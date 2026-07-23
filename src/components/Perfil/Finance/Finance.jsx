import { DollarSign, BarChart3, CreditCard, TrendingDown, ArrowUpRight, Wallet } from "lucide-react";

export default function Finance({ user }) {
  const totalEarned = user?.earnings || "3.450,00";
  const balance = user?.balance || "1.280,00";
  const revenue = user?.revenue || "7.840,00";
  const fees = user?.fees || "340,00";

  return (
    <section className="perfil-section perfil-finance">
      <div className="section-heading">
        <div>
          <h2>Finanças</h2>
          <p>Controle os ganhos, pagamentos e metas do seu perfil profissional.</p>
        </div>
      </div>

      <div className="finance-grid">
        <div className="finance-card">
          <div className="finance-icon"><DollarSign size={20} /></div>
          <span>Saldo disponível</span>
          <strong>R$ {balance}</strong>
        </div>
        <div className="finance-card">
          <div className="finance-icon"><CreditCard size={20} /></div>
          <span>Recebimentos</span>
          <strong>R$ {totalEarned}</strong>
        </div>
        <div className="finance-card">
          <div className="finance-icon"><Wallet size={20} /></div>
          <span>Faturamento</span>
          <strong>R$ {revenue}</strong>
        </div>
        <div className="finance-card">
          <div className="finance-icon"><TrendingDown size={20} /></div>
          <span>Taxas</span>
          <strong>R$ {fees}</strong>
        </div>
      </div>

      <div className="finance-details">
        <div className="finance-detail-card">
          <h3>Resumo mensal</h3>
          <p>Os próximos 30 dias mostram oportunidades de crescimento e faturamento constante.</p>
          <div className="finance-progress">
            <span>Meta</span>
            <strong>R$ 12.000</strong>
          </div>
          <div className="finance-progress-bar">
            <div style={{ width: "68%" }} />
          </div>
        </div>
        <div className="finance-detail-card">
          <h3>Transações recentes</h3>
          <ul>
            <li>Consultoria UX - R$ 1.200</li>
            <li>Branding Studio - R$ 850</li>
            <li>Landing page - R$ 560</li>
            <li>Revisão de portfólio - R$ 290</li>
          </ul>
          <button className="btn-secondary outline">
            <ArrowUpRight size={16} /> Ver todas as entradas
          </button>
        </div>
      </div>
    </section>
  );
}
