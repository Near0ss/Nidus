import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { formatBRL } from '../../lib/format';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const FREELANCER_TABS = [
  { id: 'REQUESTED', label: 'Solicitações' },
  { id: 'IN_PROGRESS', label: 'Em andamento' },
  { id: 'DELIVERED', label: 'Aguardando aprovação' },
  { id: 'COMPLETED', label: 'Concluídos' },
  { id: 'CANCELLED', label: 'Cancelados' },
];
const CLIENT_TABS = [
  { id: 'REQUESTED', label: 'Solicitados' },
  { id: 'IN_PROGRESS', label: 'Em andamento' },
  { id: 'DELIVERED', label: 'Entregues' },
  { id: 'COMPLETED', label: 'Concluídos' },
];

function matchesTab(status, tab) {
  if (tab === 'IN_PROGRESS') return ['ACCEPTED', 'IN_PROGRESS'].includes(status);
  if (tab === 'CANCELLED') return ['CANCELLED', 'REJECTED'].includes(status);
  return status === tab;
}

const EMPTY_COPY = {
  REQUESTED: {
    freelancer: { title: 'Nenhuma solicitação ainda', desc: 'Novos pedidos de clientes aparecerão aqui.' },
    client: { title: 'Nenhuma contratação solicitada', desc: 'Quando você contratar um profissional, o pedido aparece aqui.', cta: '/freelancers', ctaLabel: 'Explorar profissionais' },
  },
  IN_PROGRESS: {
    freelancer: { title: 'Nenhum trabalho em andamento', desc: 'Quando você aceitar um pedido, ele aparece aqui.' },
    client: { title: 'Nenhum trabalho em andamento', desc: 'Contratos aceitos aparecerão nesta etapa.' },
  },
  DELIVERED: {
    freelancer: { title: 'Nada aguardando aprovação', desc: 'Entregas enviadas para o cliente aparecem aqui.' },
    client: { title: 'Nenhuma entrega para revisar', desc: 'Quando o freelancer entregar, você avalia aqui.' },
  },
  COMPLETED: {
    freelancer: { title: 'Nenhum trabalho concluído', desc: 'Trabalhos finalizados aparecem aqui.' },
    client: { title: 'Nenhuma contratação concluída', desc: 'Projetos finalizados aparecerão nesta lista.' },
  },
  CANCELLED: {
    freelancer: { title: 'Nenhum cancelado', desc: 'Solicitações recusadas ou canceladas aparecem aqui.' },
    client: { title: 'Nenhum cancelado', desc: 'Contratações canceladas aparecerão aqui.' },
  },
};

export default function JobsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isFreelancer = user?.type === 'freelancer';
  const tabs = isFreelancer ? FREELANCER_TABS : CLIENT_TABS;
  const [tab, setTab] = useState(tabs[0].id);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  async function load() {
    const data = await apiFetch('/api/contracts');
    setJobs(data.contracts || []);
  }

  useEffect(() => {
    load().catch((err) => toast(err.message, 'error')).finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => jobs.filter((job) => matchesTab(job.status, tab)), [jobs, tab]);

  async function act(job, action) {
    try {
      await apiFetch(`/api/contracts/${job.id}/${action}`, { method: 'POST' });
      toast('Status atualizado.');
      await load();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function submitReview(event) {
    event.preventDefault();
    try {
      await apiFetch(`/api/contracts/${review.id}/review`, {
        method: 'POST',
        body: JSON.stringify({ rating: Number(rating), comment }),
      });
      toast('Avaliação publicada.');
      setReview(null);
      setComment('');
      await load();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  if (loading) return <LoadingState />;

  const empty = (EMPTY_COPY[tab] || EMPTY_COPY.REQUESTED)[isFreelancer ? 'freelancer' : 'client'];

  return (
    <section className="perfil-section">
      <div className="section-heading">
        <div>
          <h2>{isFreelancer ? 'Trabalhos' : 'Contratações'}</h2>
          <p>Solicitações, andamento e conclusão com persistência real.</p>
        </div>
      </div>
      <div className="job-tabs" role="tablist" aria-label={isFreelancer ? 'Filtro de trabalhos' : 'Filtro de contratações'}>
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`job-tab${tab === item.id ? ' is-on' : ''}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {!visible.length ? (
        <EmptyState
          icon={<Briefcase size={18} strokeWidth={1.75} />}
          title={empty.title}
          actions={empty.cta ? <Link to={empty.cta} className="home-btn outline">{empty.ctaLabel}</Link> : null}
        >
          {empty.desc}
        </EmptyState>
      ) : visible.map((job) => (
        <article key={job.id} className="nidus-card">
          <h3>{job.title}</h3>
          <p>{job.description}</p>
          <p>{job.kind === 'QUOTE' ? 'Orçamento' : 'Serviço'} · {formatBRL(job.price) || 'A combinar'} · {job.status}</p>
          <p className="muted">
            {isFreelancer ? job.client?.name : job.freelancer?.businessName || job.freelancer?.name}
          </p>
          <div className="home-hero__actions">
            {isFreelancer && job.status === 'REQUESTED' ? (
              <>
                <button type="button" className="home-btn" onClick={() => act(job, 'accept')}>Aceitar</button>
                <button type="button" className="home-btn ghost" onClick={() => act(job, 'reject')}>Recusar</button>
              </>
            ) : null}
            {isFreelancer && ['ACCEPTED', 'IN_PROGRESS'].includes(job.status) ? (
              <button type="button" className="home-btn" onClick={() => act(job, 'deliver')}>Marcar entrega</button>
            ) : null}
            {!isFreelancer && job.status === 'DELIVERED' ? (
              <button type="button" className="home-btn" onClick={() => act(job, 'complete')}>Confirmar conclusão</button>
            ) : null}
            {!isFreelancer && job.status === 'COMPLETED' && !job.review ? (
              <button type="button" className="home-btn ghost" onClick={() => setReview(job)}>Avaliar</button>
            ) : null}
            {!['COMPLETED', 'CANCELLED', 'REJECTED'].includes(job.status) ? (
              <button type="button" className="home-btn ghost" onClick={() => act(job, 'cancel')}>Cancelar</button>
            ) : null}
          </div>
        </article>
      ))}

      {review ? (
        <div className="nidus-modal-backdrop" onClick={() => setReview(null)}>
          <form className="nidus-modal" onClick={(e) => e.stopPropagation()} onSubmit={submitReview}>
            <h2>Avaliar {review.freelancer?.name}</h2>
            <label>Nota (1–5)
              <select value={rating} onChange={(e) => setRating(e.target.value)}>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <label>Comentário<textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} /></label>
            <div className="nidus-modal-actions">
              <button type="button" className="home-btn ghost" onClick={() => setReview(null)}>Cancelar</button>
              <button type="submit" className="home-btn">Publicar</button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}
