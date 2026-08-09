import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PenSquare } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import PostCard from '../../components/PostCard';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function PostsManage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState([]);
  const [removeId, setRemoveId] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    apiFetch(`/api/posts?authorId=${user.id}`).then((data) => setPosts(data.posts || []));
  }, [user?.id]);

  async function remove() {
    await apiFetch(`/api/posts/${removeId}`, { method: 'DELETE' });
    setPosts((prev) => prev.filter((p) => p.id !== removeId));
    setRemoveId(null);
    toast('Publicação excluída.');
  }

  return (
    <section className="perfil-section">
      <div className="section-heading">
        <div>
          <h2>Publicações</h2>
          <p>Gerencie o que aparece no Social.</p>
        </div>
      </div>
      {!posts.length ? (
        <EmptyState
          icon={<PenSquare size={18} strokeWidth={1.75} />}
          title="Nenhuma publicação ainda"
          actions={<Link to="/social" className="home-btn outline">Abrir Social</Link>}
        >
          Quando você publicar no Social, seus posts aparecerão aqui.
        </EmptyState>
      ) : posts.map((post) => (
        <div key={post.id}>
          <PostCard post={post} />
          <button type="button" className="home-btn ghost" onClick={() => setRemoveId(post.id)}>Excluir</button>
        </div>
      ))}
      {removeId ? (
        <ConfirmDialog title="Excluir publicação?" danger confirmLabel="Excluir" onClose={() => setRemoveId(null)} onConfirm={remove}>
          <p>Essa ação não pode ser desfeita.</p>
        </ConfirmDialog>
      ) : null}
    </section>
  );
}
