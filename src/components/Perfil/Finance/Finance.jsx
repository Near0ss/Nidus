export default function Finance({ user }) {
  const balance = Number(user?.finance?.balance ?? user?.balance ?? 0);
  const earnings = Number(user?.finance?.earnings ?? user?.earnings ?? 0);
  const hasMoney = balance > 0 || earnings > 0;

  return (
    <section className="perfil-section perfil-finance u-rise">
      <div className="section-heading">
        <div>
          <h2>Finanças</h2>
          <p>Ganhos e pagamentos reais do seu ninho — sem números inventados.</p>
        </div>
      </div>

      {hasMoney ? (
        <div className="finance-grid">
          <div className="finance-card">
            <span>Saldo disponível</span>
            <strong>R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          </div>
          <div className="finance-card">
            <span>Ganhos totais</span>
            <strong>R$ {earnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          </div>
        </div>
      ) : (
        <div className="nidus-empty">
          <strong>Ainda sem movimentação</strong>
          <p>Quando um cliente pagar um serviço, o saldo aparece aqui.</p>
        </div>
      )}
    </section>
  );
}
