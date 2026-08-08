export default function Messages({ user }) {
  const conversations = user?.messages || [];

  return (
    <section className="perfil-section perfil-messages u-rise">
      <div className="section-heading">
        <div>
          <h2>Mensagens</h2>
          <p>Conversas reais com clientes e profissionais.</p>
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="nidus-empty">
          <strong>Caixa ainda vazia</strong>
          <p>Quando alguém te chamar, a conversa entra neste ninho.</p>
        </div>
      ) : (
        <div className="messages-list">
          {conversations.map((conversation, index) => (
            <div key={conversation.id || index} className="message-card">
              <strong>{conversation.name || conversation.from || 'Contato'}</strong>
              <p>{conversation.preview || conversation.text || ''}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
