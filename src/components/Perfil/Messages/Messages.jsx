import { MessageSquare, User, CheckCircle2, BellRing } from "lucide-react";

const conversations = [
  { name: "cliente@empresa.com", preview: "Olá, podemos ajustar o prazo para o layout?", time: "2h atrás", unread: 3, status: "Nova" },
  { name: "Estúdio Verde", preview: "Adorei o material. Vamos fechar o contrato?", time: "Ontem", unread: 1, status: "Pendente" },
  { name: "João Mendes", preview: "O projeto está aprovado. Você pode enviar a nota fiscal?", time: "2 dias", unread: 0, status: "Respondido" },
];

export default function Messages() {
  return (
    <section className="perfil-section perfil-messages">
      <div className="section-heading">
        <div>
          <h2>Mensagens</h2>
          <p>Centralize as conversas do cliente, respondendo rapidamente a propostas e dúvidas.</p>
        </div>
      </div>

      <div className="messages-overview">
        <div className="message-status-card">
          <div>
            <strong>5 novas mensagens</strong>
            <p>Responda aos contatos mais recentes para manter o fluxo de entregas.</p>
          </div>
          <BellRing size={20} />
        </div>
      </div>

      <div className="messages-list">
        {conversations.map((conversation, index) => (
          <div key={index} className="message-card">
            <div className="message-avatar"><User size={18} /></div>
            <div className="message-info">
              <div className="message-top">
                <strong>{conversation.name}</strong>
                <span>{conversation.time}</span>
              </div>
              <p>{conversation.preview}</p>
            </div>
            <div className="message-extra">
              <span className={`message-tag message-tag-${conversation.status.toLowerCase()}`}>
                {conversation.status}
              </span>
              {conversation.unread > 0 && <div className="message-badge">{conversation.unread}</div>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
