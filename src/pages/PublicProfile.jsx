import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Bookmark, MapPin, MessageSquare } from 'lucide-react';
import Footer2 from '../components/Footer2';
import ServiceCard from '../components/ServiceCard';
import PostCard from '../components/PostCard';
import Rating from '../components/ui/Rating';
import UserAvatar from '../components/ui/UserAvatar';
import EmptyState from '../components/ui/EmptyState';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ratingLabel } from '../lib/format';
import '../css/Perfil.css';
import '../css/Home.css';
import '../css/nidus.css';

export default function PublicProfile() {
  const { username } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quote, setQuote] = useState({ title: '', description: '', budget: '', deadlineDays: '' });

  async function load() {
    const data = await apiFetch(`/api/u/${encodeURIComponent(username)}`);
    setProfile(data.user);
    if (data.user?.id) {
      const rev = await apiFetch(`/api/users/${data.user.id}/reviews`);
      setReviews(rev.reviews || []);
    }
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, [username]);

  function requireClient() {
    if (!user) {
      navigate('/authchoice');
      return false;
    }
    if (user.type === 'freelancer') {
      toast('Use uma conta de cliente para esta ação.', 'error');
      return false;
    }
    return true;
  }

  async function toggleSave() {
    if (!requireClient()) return;
    const data = await apiFetch(`/api/saved/${profile.id}`, { method: 'POST' });
    setProfile((prev) => ({ ...prev, saved: data.saved }));
  }

  async function toggleFollow() {
    if (!user) return navigate('/authchoice');
    const data = await apiFetch(`/api/users/${profile.id}/follow`, { method: 'POST' });
    setProfile((prev) => ({
      ...prev,
      following: data.following,
      statistics: { ...prev.statistics, followers: data.followerCount },
    }));
  }

  async function openMessage() {
    if (!requireClient()) return;
    const data = await apiFetch('/api/conversations', {
      method: 'POST',
      body: JSON.stringify({ userId: profile.id }),
    });
    navigate(`/dashboard/messages?c=${data.conversation.id}`);
  }

  async function sendQuote(event) {
    event.preventDefault();
    if (!requireClient()) return;
    await apiFetch('/api/contracts', {
      method: 'POST',
      body: JSON.stringify({
        kind: 'QUOTE',
        freelancerId: profile.id,
        title: quote.title,
        description: quote.description,
        budget: quote.budget,
        deadlineDays: quote.deadlineDays,
      }),
    });
    toast('Orçamento enviado.');
    setQuoteOpen(false);
    navigate('/dashboard/jobs');
  }

  if (error && !profile) {
    return (
      <div className="nidus-page">
        <EmptyState title="Perfil não encontrado">{error}</EmptyState>
      </div>
    );
  }
  if (!profile) return <div className="app-boot">Carregando perfil…</div>;

  const isOwn = user?.id === profile.id;

  return (
    <div className="home-page">
      <div className="perfil-page">
        <div className="perfil-layout public-profile">
          <main id="conteudo-principal" className="perfil-feed">
            <section className="perfil-hero">
              <div
                className={`profile-cover${profile.banner ? '' : ' is-default'}`}
                style={profile.banner ? { backgroundImage: `url(${profile.banner})` } : undefined}
              />
              <div className="home-hero">
                <div className="home-hero__orb perfil-orb">
                  <UserAvatar src={profile.profilePhoto} name={profile.businessName || profile.name || profile.username} size={88} />
                </div>
                <div className="home-hero__copy">
                  <span className="u-eyebrow">{profile.headline || profile.professionalTitle?.[0] || 'Profissional'}</span>
                  <h1>{profile.businessName || profile.name}</h1>
                  <p className="public-profile-handle">@{profile.username}</p>
                  <p><MapPin size={14} strokeWidth={1.75} /> <span>{[profile.city, profile.state, profile.country].filter(Boolean).join(' · ') || '—'}</span></p>
                  <p>{profile.availability || 'Disponível'} · {profile.completedJobs || 0} trabalhos concluídos</p>
                  <Rating value={profile.rating} count={profile.reviewCount} />
                  {profile.bio ? <p className="public-profile-bio">{profile.bio}</p> : null}
                  {profile.professionalTitle?.length ? (
                    <div className="public-profile-tags">
                      {profile.professionalTitle.map((title) => <span key={title}>{title}</span>)}
                    </div>
                  ) : null}
                  {!isOwn ? (
                    <div className="home-hero__actions">
                      <button type="button" className="home-btn" onClick={() => requireClient() && setQuoteOpen(true)}>Contratar</button>
                      <button type="button" className="home-btn ghost" onClick={openMessage}><MessageSquare size={16} /> Mensagem</button>
                      <button type="button" className="home-btn ghost" onClick={toggleSave}><Bookmark size={16} /> {profile.saved ? 'Salvo' : 'Salvar'}</button>
                      <button type="button" className="home-btn ghost" onClick={toggleFollow}>{profile.following ? 'Seguindo' : 'Seguir'}</button>
                    </div>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="perfil-section perfil-about">
              <h2>Sobre</h2>
              <p>{profile.bio || profile.experience || 'Sem descrição ainda.'}</p>
              {profile.experience && profile.bio ? <p className="muted">Experiência: {profile.experience}</p> : null}
            </section>

            <section className="perfil-section">
              <div className="section-heading"><h2>Serviços</h2></div>
              {profile.services?.length ? (
                <div className="nidus-grid">{profile.services.map((service) => <ServiceCard key={service.id} service={service} />)}</div>
              ) : <EmptyState title="Nenhum serviço ativo." />}
            </section>

            <section className="perfil-section">
              <div className="section-heading"><h2>Portfólio</h2></div>
              {profile.projects?.length ? (
                <div className="project-grid">
                  {profile.projects.map((project) => (
                    <article key={project.id} className="project-card">
                      <div className={`project-image${project.preview ? '' : ' is-empty'}`} style={project.preview ? { backgroundImage: `url(${project.preview})` } : undefined} />
                      <div className="project-card-body">
                        <span>{project.title}</span>
                        <small>{project.category || 'Portfólio'}</small>
                        {project.description ? <p>{project.description}</p> : null}
                      </div>
                    </article>
                  ))}
                </div>
              ) : <EmptyState title="Portfólio ainda vazio." />}
            </section>

            <section className="perfil-section">
              <div className="section-heading">
                <h2>Avaliações</h2>
                <strong>{ratingLabel(profile.rating, profile.reviewCount)}</strong>
              </div>
              {reviews.length ? reviews.map((review) => (
                <article key={review.id} className="nidus-card">
                  <strong>{review.client?.name}</strong>
                  <Rating value={review.rating} count={1} />
                  <p>{review.comment}</p>
                </article>
              )) : <EmptyState title="Nenhuma avaliação ainda">Quando clientes concluírem trabalhos, as notas aparecem aqui.</EmptyState>}
            </section>

            <section className="perfil-section">
              <div className="section-heading"><h2>Publicações</h2><Link to="/social">Abrir Social</Link></div>
              {profile.posts?.length ? profile.posts.map((post) => <PostCard key={post.id} post={post} />) : <EmptyState title="Sem publicações." />}
            </section>
          </main>
        </div>
        <Footer2 />
      </div>

      {quoteOpen ? (
        <div className="nidus-modal-backdrop" onClick={() => setQuoteOpen(false)}>
          <form className="nidus-modal" onClick={(e) => e.stopPropagation()} onSubmit={sendQuote}>
            <h2>Contratar / orçamento</h2>
            <label>Título<input value={quote.title} onChange={(e) => setQuote({ ...quote, title: e.target.value })} required placeholder="Quero um sistema administrativo…" /></label>
            <label>Descrição<textarea rows={4} value={quote.description} onChange={(e) => setQuote({ ...quote, description: e.target.value })} required /></label>
            <label>Orçamento aproximado<input type="number" min="0" value={quote.budget} onChange={(e) => setQuote({ ...quote, budget: e.target.value })} /></label>
            <label>Prazo (dias)<input type="number" min="1" value={quote.deadlineDays} onChange={(e) => setQuote({ ...quote, deadlineDays: e.target.value })} /></label>
            <div className="nidus-modal-actions">
              <button type="button" className="home-btn ghost" onClick={() => setQuoteOpen(false)}>Cancelar</button>
              <button type="submit" className="home-btn">Enviar</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
