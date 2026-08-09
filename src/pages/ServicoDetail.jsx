import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Footer2 from '../components/Footer2';
import UserAvatar from '../components/ui/UserAvatar';
import SafeImage from '../components/ui/SafeImage';
import { fallbackForCategory } from '../lib/mediaFallback';
import Rating from '../components/ui/Rating';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { apiFetch } from '../lib/api';
import { deliveryLabel, priceLabel } from '../lib/format';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import '../css/Home.css';
import '../css/nidus.css';

export default function ServicoDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [error, setError] = useState(null);
  const [confirmHire, setConfirmHire] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quote, setQuote] = useState({ title: '', description: '', budget: '', deadlineDays: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    apiFetch(`/api/services/${id}`)
      .then((data) => setService(data.service))
      .catch((err) => setError(err.message));
  }, [id]);

  function requireClient() {
    if (!user) {
      navigate('/authchoice');
      return false;
    }
    if (user.type === 'freelancer') {
      toast('Use uma conta de cliente para contratar.', 'error');
      return false;
    }
    return true;
  }

  async function hire() {
    if (!requireClient()) return;
    setBusy(true);
    try {
      await apiFetch('/api/contracts', {
        method: 'POST',
        body: JSON.stringify({
          kind: 'HIRE',
          freelancerId: service.freelancer.id,
          serviceId: service.id,
          title: service.title,
          description: service.description,
        }),
      });
      toast('Solicitação enviada. O freelancer vai responder no painel.');
      setConfirmHire(false);
      navigate('/dashboard/jobs');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function sendQuote(event) {
    event.preventDefault();
    if (!requireClient()) return;
    setBusy(true);
    try {
      await apiFetch('/api/contracts', {
        method: 'POST',
        body: JSON.stringify({
          kind: 'QUOTE',
          freelancerId: service.freelancer.id,
          serviceId: service.id,
          title: quote.title || `Orçamento · ${service.title}`,
          description: quote.description,
          budget: quote.budget,
          deadlineDays: quote.deadlineDays,
        }),
      });
      toast('Orçamento enviado.');
      setQuoteOpen(false);
      navigate('/dashboard/jobs');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function toggleSave() {
    if (!user) return navigate('/authchoice');
    try {
      const data = await apiFetch(`/api/saved/services/${service.id}`, { method: 'POST' });
      setService((prev) => ({ ...prev, saved: data.saved }));
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  if (error) return <div className="nidus-page"><ErrorState message={error} /></div>;
  if (!service) return <div className="nidus-page"><LoadingState /></div>;

  const freelancer = service.freelancer || {};

  return (
    <div className="home-page">
      <main id="conteudo-principal" className="nidus-page service-detail">
        <div className="service-gallery">
          {(service.images || []).map((src, index) => (
            <SafeImage key={`${src}-${index}`} src={src} alt={`${service.title} · imagem ${index + 1}`} fallback={fallbackForCategory(service.category)} />
          ))}
          {!service.images?.length ? (
            <SafeImage src="" alt={service.title} fallback={fallbackForCategory(service.category)} />
          ) : null}
        </div>

        <section className="nidus-card service-detail__info">
          <p className="u-eyebrow">{service.category?.name || 'Serviço'}</p>
          <h1>{service.title}</h1>
          <p>{service.description}</p>
          {service.includes ? (
            <>
              <h2>O que está incluso</h2>
              <pre className="includes">{service.includes}</pre>
            </>
          ) : null}
          <div className="service-detail__meta">
            <strong>{priceLabel(service)}</strong>
            <span>{deliveryLabel(service.deliveryDays)}</span>
          </div>
        </section>

        <aside className="nidus-card service-detail__cta">
          <Link to={`/u/${freelancer.username}`} className="service-card-new__author">
            <UserAvatar src={freelancer.profilePhoto} name={freelancer.businessName || freelancer.name} size={48} />
            <div>
              <strong>{freelancer.businessName || freelancer.name}</strong>
              <Rating value={freelancer.rating} count={freelancer.reviewCount} />
              <span className="muted">{freelancer.completedJobs || 0} trabalhos concluídos</span>
            </div>
          </Link>
          <button type="button" className="home-btn" onClick={() => requireClient() && setConfirmHire(true)}>
            Contratar este serviço
          </button>
          <button type="button" className="home-btn ghost" onClick={() => requireClient() && setQuoteOpen(true)}>
            Solicitar orçamento personalizado
          </button>
          <button type="button" className="home-btn ghost" onClick={toggleSave}>
            {service.saved ? 'Salvo' : 'Salvar serviço'}
          </button>
        </aside>
      </main>
      <Footer2 />

      {confirmHire ? (
        <ConfirmDialog
          title="Confirmar solicitação"
          confirmLabel={busy ? 'Enviando…' : 'Enviar solicitação'}
          onClose={() => setConfirmHire(false)}
          onConfirm={hire}
        >
          <p><strong>{service.title}</strong> com {freelancer.businessName || freelancer.name}.</p>
          <p>{priceLabel(service)} · {deliveryLabel(service.deliveryDays)}</p>
          <p className="muted">Nenhum pagamento externo é processado. Isso cria uma solicitação de trabalho.</p>
        </ConfirmDialog>
      ) : null}

      {quoteOpen ? (
        <div className="nidus-modal-backdrop" onClick={() => setQuoteOpen(false)}>
          <form className="nidus-modal" onClick={(e) => e.stopPropagation()} onSubmit={sendQuote}>
            <h2>Orçamento personalizado</h2>
            <label>Título
              <input value={quote.title} onChange={(e) => setQuote({ ...quote, title: e.target.value })} placeholder="Sistema administrativo com painel financeiro" />
            </label>
            <label>O que você precisa?
              <textarea value={quote.description} onChange={(e) => setQuote({ ...quote, description: e.target.value })} required rows={4} />
            </label>
            <label>Orçamento aproximado (opcional)
              <input type="number" min="0" value={quote.budget} onChange={(e) => setQuote({ ...quote, budget: e.target.value })} />
            </label>
            <label>Prazo desejado (dias)
              <input type="number" min="1" value={quote.deadlineDays} onChange={(e) => setQuote({ ...quote, deadlineDays: e.target.value })} />
            </label>
            <div className="nidus-modal-actions">
              <button type="button" className="home-btn ghost" onClick={() => setQuoteOpen(false)}>Cancelar</button>
              <button type="submit" className="home-btn" disabled={busy}>Enviar</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
