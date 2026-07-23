import {
  Wallet,
  Briefcase,
  Star,
  TrendingUp,
  ArrowUpRight,
  Clock3,
  Bell,
  Plus,
} from "lucide-react";

export default function Dashboard({ user }) {
  return (
    <section className="perfil-dashboard">
      <div className="dashboard-header">
        <div>
          <span className="dashboard-small">Bem-vindo de volta</span>

          <h1>Olá, {user?.businessName || user?.username}</h1>

          <p>
            Gerencie seu perfil profissional, acompanhe seu desempenho e veja as
            novidades da sua conta.
          </p>
        </div>

        <div className="dashboard-actions">
          <button className="dashboard-primary">
            <Plus size={18} />
            Novo Projeto
          </button>

          <button className="dashboard-secondary">Editar Perfil</button>
        </div>
      </div>

      <div className="dashboard-cards">
        <article className="dashboard-card">
          <div className="dashboard-card-top">
            <Wallet size={22} />

            <span>Saldo disponível</span>
          </div>

          <strong>R$ {user?.balance || "0,00"}</strong>

          <small>+12% em relação ao mês anterior</small>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card-top">
            <TrendingUp size={22} />

            <span>Ganhos Totais</span>
          </div>

          <strong>R$ {user?.earnings || "0,00"}</strong>

          <small>Receita acumulada</small>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card-top">
            <Briefcase size={22} />

            <span>Projetos</span>
          </div>

          <strong>{user?.projects?.length || 0}</strong>

          <small>Projetos ativos</small>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card-top">
            <Star size={22} />

            <span>Avaliação</span>
          </div>

          <strong>{user?.rating || "4.9"}</strong>

          <small>Excelente reputação</small>
        </article>
      </div>

      <div className="dashboard-content">
        <section className="dashboard-panel">
          <div className="panel-header">
            <h3>Atividade recente</h3>

            <button>Ver tudo</button>
          </div>

          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">
                <ArrowUpRight size={18} />
              </div>

              <div>
                <strong>Novo orçamento recebido</strong>

                <span>Um cliente enviou uma solicitação de projeto.</span>
              </div>

              <small>Hoje</small>
            </div>

            <div className="activity-item">
              <div className="activity-icon">
                <Clock3 size={18} />
              </div>

              <div>
                <strong>Projeto atualizado</strong>

                <span>Seu portfólio foi sincronizado.</span>
              </div>

              <small>Ontem</small>
            </div>

            <div className="activity-item">
              <div className="activity-icon">
                <Bell size={18} />
              </div>

              <div>
                <strong>Novo comentário</strong>

                <span>Um cliente avaliou seu último serviço.</span>
              </div>

              <small>2 dias</small>
            </div>
          </div>
        </section>

        <section className="dashboard-panel dashboard-right">
          <h3>Desempenho</h3>

          <div className="dashboard-progress">
            <div>
              <span>Perfil completo</span>

              <strong>92%</strong>
            </div>

            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "92%" }} />
            </div>
          </div>

          <div className="dashboard-progress">
            <div>
              <span>Portfólio</span>

              <strong>80%</strong>
            </div>

            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "80%" }} />
            </div>
          </div>

          <div className="dashboard-progress">
            <div>
              <span>Serviços</span>

              <strong>70%</strong>
            </div>

            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "70%" }} />
            </div>
          </div>

          <div className="dashboard-tip">
            💡 Perfis completos aparecem primeiro nas buscas do Nidus.
          </div>
        </section>
      </div>
    </section>
  );
}
