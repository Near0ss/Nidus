import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import Footer2 from '../components/Footer2';
import UserAvatar from '../components/ui/UserAvatar';
import EmptyState from '../components/ui/EmptyState';
import LoadingState from '../components/ui/LoadingState';
import { apiFetch } from '../lib/api';
import { timeAgo } from '../lib/format';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import '../css/Home.css';
import '../css/Perfil.css';
import '../css/nidus.css';

const LABELS = {
  FOLLOW: 'começou a te seguir',
  COMMENT: 'comentou sua publicação',
  LIKE: 'curtiu sua publicação',
  MESSAGE: 'enviou uma mensagem',
  JOB_REQUEST: 'enviou uma solicitação de trabalho',
  JOB_ACCEPTED: 'aceitou sua solicitação',
  JOB_REJECTED: 'recusou sua solicitação',
  JOB_DELIVERED: 'marcou uma entrega',
  JOB_COMPLETED: 'confirmou a conclusão',
  REVIEW: 'deixou uma avaliação',
};

export default function Notificacoes() {
  const { toast } = useToast();
  const { refresh } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const unread = items.filter((item) => !item.readAt).length;

  async function load() {
    const data = await apiFetch('/api/notifications');
    setItems(data.notifications || []);
  }

  useEffect(() => {
    load().catch((err) => toast(err.message, 'error')).finally(() => setLoading(false));
  }, []);

  async function mark(id) {
    await apiFetch(`/api/notifications/${id}/read`, { method: 'POST' });
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, readAt: new Date().toISOString() } : item)));
    refresh();
  }

  async function markAll() {
    await apiFetch('/api/notifications/read-all', { method: 'POST' });
    setItems((prev) => prev.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() })));
    refresh();
  }

  return (
    <div className="home-page">
      <div className="perfil-page">
        <div className="perfil-layout">
          <main id="conteudo-principal" className="perfil-feed">
            <section className="perfil-section">
              <div className="section-heading">
                <div>
                  <h2>Notificações</h2>
                  <p>Acompanhe seguidores, mensagens, trabalhos e avaliações.</p>
                </div>
                {unread ? (
                  <button type="button" className="home-btn text" onClick={markAll}>
                    Marcar todas como lidas
                  </button>
                ) : null}
              </div>
              {loading ? <LoadingState /> : null}
              {!loading && !items.length ? (
                <EmptyState icon={<Bell size={18} strokeWidth={1.75} />} title="Tudo em dia">
                  Você não possui novas notificações.
                </EmptyState>
              ) : null}
              <div className="notif-list">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`nidus-card notif-item${item.readAt ? '' : ' is-unread'}`}
                    onClick={() => !item.readAt && mark(item.id)}
                  >
                    <UserAvatar src={item.actor?.profilePhoto} name={item.actor?.name} size={40} />
                    <div>
                      <strong>{item.actor?.name || 'Alguém'} {LABELS[item.type] || item.type}</strong>
                      <time>{timeAgo(item.createdAt) || 'agora'}</time>
                    </div>
                    {!item.readAt ? <span className="notif-item__dot" aria-hidden="true" /> : <span />}
                  </button>
                ))}
              </div>
            </section>
          </main>
        </div>
        <Footer2 />
      </div>
    </div>
  );
}
