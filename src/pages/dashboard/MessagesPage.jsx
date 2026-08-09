import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import UserAvatar from '../../components/ui/UserAvatar';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import { apiFetch } from '../../lib/api';
import { timeAgo } from '../../lib/format';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function MessagesPage() {
  const { user, refresh } = useAuth();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [active, setActive] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const selectedId = params.get('c') || '';

  async function loadConversations() {
    const data = await apiFetch('/api/conversations');
    setConversations(data.conversations || []);
    return data.conversations || [];
  }

  useEffect(() => {
    loadConversations().catch((err) => toast(err.message, 'error')).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setActive(null);
      setMessages([]);
      return;
    }
    apiFetch(`/api/conversations/${selectedId}/messages`)
      .then(async (data) => {
        setActive(data.conversation);
        setMessages(data.messages || []);
        await loadConversations();
        refresh();
      })
      .catch((err) => toast(err.message, 'error'));
  }, [selectedId]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, selectedId]);

  async function send(event) {
    event.preventDefault();
    if (!selectedId || !text.trim()) return;
    try {
      const data = await apiFetch(`/api/conversations/${selectedId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: text.trim() }),
      });
      setMessages((prev) => [...prev, data.message]);
      setText('');
      await loadConversations();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  const other = active?.otherUser || conversations.find((c) => c.id === selectedId)?.otherUser;

  return (
    <section className="perfil-section dash-messages">
      <div className="section-heading">
        <div>
          <h2>Mensagens</h2>
          <p>Converse com clientes e acompanhe seus projetos.</p>
        </div>
      </div>

      <div className={`dash-messages__panel${selectedId ? ' is-chat' : ''}`}>
        <aside className="dash-messages__list">
          {loading ? <LoadingState /> : null}
          {!loading && !conversations.length ? (
            <EmptyState
              className="is-center"
              icon={<MessageCircle size={18} strokeWidth={1.75} />}
              title="Nenhuma conversa ainda"
            >
              Quando alguém entrar em contato, aparecerá aqui.
            </EmptyState>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                type="button"
                className={`messages-item${conv.id === selectedId ? ' is-active' : ''}`}
                onClick={() => setParams({ c: conv.id })}
              >
                <UserAvatar src={conv.otherUser?.profilePhoto} name={conv.otherUser?.businessName || conv.otherUser?.name} size={40} />
                <div>
                  <strong>{conv.otherUser?.businessName || conv.otherUser?.name}</strong>
                  <p>{conv.lastMessage?.content || 'Sem mensagens ainda'}</p>
                </div>
                <div className="messages-item__meta">
                  <time>{timeAgo(conv.lastMessage?.createdAt || conv.updatedAt)}</time>
                  {conv.unreadCount ? <span className="badge">{conv.unreadCount}</span> : null}
                </div>
              </button>
            ))
          )}
        </aside>

        <section className="dash-messages__thread">
          {selectedId ? (
            <>
              <header>
                <button type="button" className="messages-back" onClick={() => setParams({})} aria-label="Voltar para conversas">
                  ←
                </button>
                <UserAvatar src={other?.profilePhoto} name={other?.businessName || other?.name} size={40} />
                <div>
                  <strong>{other?.businessName || other?.name}</strong>
                  {other?.username ? <p className="muted">@{other.username}</p> : null}
                  {active?.contract ? <p className="muted">Sobre: {active.contract.title}</p> : null}
                </div>
              </header>
              <div className="messages-scroll" ref={scrollRef}>
                {messages.map((message) => (
                  <div key={message.id} className={`bubble${message.senderId === user?.id ? ' is-mine' : ''}`}>
                    <p>{message.content}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={send} className="messages-compose">
                <label className="sr-only" htmlFor="dash-msg">Mensagem</label>
                <input
                  id="dash-msg"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Digite sua mensagem..."
                />
                <button type="submit" className="home-btn">Enviar</button>
              </form>
            </>
          ) : (
            <EmptyState className="is-center" icon={<MessageCircle size={18} strokeWidth={1.75} />} title="Selecione uma conversa">
              Escolha uma conversa ao lado para começar.
            </EmptyState>
          )}
        </section>
      </div>
    </section>
  );
}
