import { useEffect, useRef, useState } from 'react';
import Footer2 from '../components/Footer2';
import PostCard from '../components/PostCard';
import UserAvatar from '../components/ui/UserAvatar';
import MediaPicker from '../components/ui/MediaPicker';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { apiFetch, uploadFiles } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import '../css/Home.css';
import '../css/nidus.css';

export default function Social() {
  const { user } = useAuth();
  const { toast } = useToast();
  const areaRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [removeId, setRemoveId] = useState(null);
  const canPublish = user?.type === 'freelancer';

  async function load() {
    setLoading(true);
    try {
      const data = await apiFetch('/api/feed');
      setPosts(data.feed || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [content, open]);

  async function publish(event) {
    event.preventDefault();
    if (!canPublish) return toast('Somente freelancers publicam no Social.', 'error');
    if (!content.trim() && !files.length) return;
    setBusy(true);
    try {
      let images = [];
      if (files.length) {
        const uploaded = await uploadFiles(files);
        images = (uploaded.urls || []).filter((url) => url && !String(url).startsWith('blob:'));
      }
      const data = await apiFetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify({ content: content.trim(), images }),
      });
      setPosts((prev) => [data.post, ...prev]);
      setContent('');
      setFiles([]);
      setOpen(false);
      toast('Publicação no ar.');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function removePost() {
    await apiFetch(`/api/posts/${removeId}`, { method: 'DELETE' });
    setPosts((prev) => prev.filter((item) => item.id !== removeId));
    setRemoveId(null);
    toast('Publicação excluída.');
  }

  return (
    <div className="home-page">
      <main id="conteudo-principal" className="social-shell">
        <section className="home-hero social-hero">
          <div className="home-hero__copy">
            <span className="u-eyebrow">Comunidade</span>
            <h1>Social</h1>
            <p>Processo, entregas, disponibilidade e bastidores dos profissionais do Nidus.</p>
          </div>
        </section>

        {canPublish ? (
          <form className={`nidus-card social-composer${open ? ' is-open' : ''}`} onSubmit={publish}>
            <div className="social-composer__row">
              <UserAvatar src={user.profilePhoto} name={user.businessName || user.name} size={44} />
              <label className="sr-only" htmlFor="post-content">Nova publicação</label>
              <textarea
                id="post-content"
                ref={areaRef}
                rows={1}
                value={content}
                onFocus={() => setOpen(true)}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Mostre no que você está trabalhando..."
              />
            </div>
            {open ? (
              <div className="social-composer__tools">
                <MediaPicker files={files} onChange={setFiles} multiple max={6} label="Adicionar mídia" />
                <button type="submit" className="home-btn" disabled={busy || (!content.trim() && !files.length)}>
                  {busy ? 'Publicando…' : 'Publicar'}
                </button>
              </div>
            ) : (
              <div className="social-composer__tools is-compact">
                <button type="button" className="media-picker__btn" onClick={() => setOpen(true)}>Adicionar mídia</button>
                <button type="submit" className="home-btn" disabled>Publicar</button>
              </div>
            )}
          </form>
        ) : user ? (
          <p className="muted social-hint">Você pode curtir, comentar e salvar. Publicações profissionais são dos freelancers.</p>
        ) : (
          <p className="muted social-hint">Entre para interagir com a comunidade.</p>
        )}

        {loading ? <LoadingState /> : null}
        {error ? <ErrorState message={error} onRetry={load} /> : null}
        {!loading && !posts.length ? (
          <EmptyState title="Ainda não há publicações.">Quando alguém postar, o feed aparece aqui.</EmptyState>
        ) : null}
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onDelete={(item) => setRemoveId(item.id)}
            onChange={(next) => setPosts((prev) => prev.map((item) => (item.id === next.id ? { ...item, ...next } : item)))}
          />
        ))}
      </main>
      <Footer2 />
      {removeId ? (
        <ConfirmDialog title="Excluir publicação?" danger confirmLabel="Excluir" onClose={() => setRemoveId(null)} onConfirm={removePost}>
          <p>Essa ação não pode ser desfeita.</p>
        </ConfirmDialog>
      ) : null}
    </div>
  );
}
