import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Heart, MessageCircle, MoreHorizontal, Share2 } from 'lucide-react';
import UserAvatar from './ui/UserAvatar';
import SafeImage from './ui/SafeImage';
import { apiFetch } from '../lib/api';
import { timeAgo } from '../lib/format';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function PostCard({ post, onChange, onDelete }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  async function toggleLike() {
    if (!user) return toast('Entre para curtir.', 'error');
    try {
      const data = await apiFetch(`/api/posts/${post.id}/like`, { method: 'POST' });
      onChange?.({ ...post, liked: data.liked, likeCount: data.likeCount });
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function toggleSave() {
    if (!user) return toast('Entre para salvar.', 'error');
    try {
      const data = await apiFetch(`/api/posts/${post.id}/save`, { method: 'POST' });
      onChange?.({ ...post, saved: data.saved });
      toast(data.saved ? 'Publicação salva.' : 'Removida dos salvos.');
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function loadComments() {
    const next = !open;
    setOpen(next);
    if (!next) return;
    try {
      const data = await apiFetch(`/api/posts/${post.id}/comments`);
      setComments(data.comments || []);
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function submitComment(event) {
    event.preventDefault();
    if (!user) return toast('Entre para comentar.', 'error');
    const content = text.trim();
    if (!content) return;
    setBusy(true);
    try {
      const data = await apiFetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      setComments((prev) => [...prev, data.comment]);
      setText('');
      onChange?.({ ...post, commentCount: (post.commentCount || 0) + 1 });
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function share() {
    const url = `${window.location.origin}/social?post=${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast('Link copiado.');
    } catch {
      toast('Não foi possível copiar o link.', 'error');
    }
  }

  const author = post.author || {};
  const own = user?.id === author.id;
  const images = post.images || [];

  return (
    <article className="nidus-card post-card-new">
      <header className="post-card-new__head">
        <Link to={`/u/${author.username}`} className="post-card-new__author">
          <UserAvatar src={author.profilePhoto} name={author.businessName || author.name} size={40} />
          <div>
            <strong>{author.businessName || author.name}</strong>
            <span>@{author.username} · {timeAgo(post.createdAt)}</span>
          </div>
        </Link>
        {own ? (
          <div className="post-card-new__menu">
            <button type="button" aria-label="Mais opções" onClick={() => setMenu((v) => !v)}>
              <MoreHorizontal size={18} />
            </button>
            {menu ? (
              <div className="post-card-new__menu-list">
                <button type="button" onClick={() => { setMenu(false); onDelete?.(post); }}>Excluir</button>
              </div>
            ) : null}
          </div>
        ) : null}
      </header>
      {post.content ? <p className="post-card-new__text">{post.content}</p> : null}
      {images.length ? (
        <div className={`post-card-new__media${images.length > 1 ? ' is-grid' : ''}`}>
          {images.map((src, index) => (
            <SafeImage key={`${src}-${index}`} src={src} alt="" />
          ))}
        </div>
      ) : null}
      <div className="post-card-new__actions">
        <div className="post-card-new__group">
          <button type="button" className={post.liked ? 'is-on' : ''} onClick={toggleLike} aria-label="Curtir">
            <Heart size={18} fill={post.liked ? 'currentColor' : 'none'} />
            {post.likeCount ? <span>{post.likeCount}</span> : null}
          </button>
          <button type="button" onClick={loadComments} aria-label="Comentar">
            <MessageCircle size={18} />
            {post.commentCount ? <span>{post.commentCount}</span> : null}
          </button>
          <button type="button" onClick={share} aria-label="Compartilhar">
            <Share2 size={18} />
          </button>
        </div>
        <button type="button" className={post.saved ? 'is-on' : ''} onClick={toggleSave} aria-label="Salvar">
          <Bookmark size={18} fill={post.saved ? 'currentColor' : 'none'} />
        </button>
      </div>
      {open ? (
        <div className="post-card-new__comments">
          {comments.length === 0 ? <p className="muted">Seja o primeiro a comentar.</p> : null}
          {comments.map((comment) => (
            <div key={comment.id} className="post-comment">
              <strong>{comment.author?.name || comment.author?.username}</strong>
              <p>{comment.content}</p>
            </div>
          ))}
          {user ? (
            <form onSubmit={submitComment} className="post-comment-form">
              <label className="sr-only" htmlFor={`c-${post.id}`}>Comentário</label>
              <input
                id={`c-${post.id}`}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escreva um comentário…"
              />
              <button type="submit" className="home-btn" disabled={busy}>Enviar</button>
            </form>
          ) : (
            <p className="muted">Entre para comentar.</p>
          )}
        </div>
      ) : null}
    </article>
  );
}
