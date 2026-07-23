import { BarChart3, Star, TrendingUp, Eye, Zap } from "lucide-react";

export default function Statistics({ user }) {
  const views = user?.views || 1240;
  const rating = user?.rating || 4.9;
  const growth = user?.growth || "18%";
  const projects = user?.projects?.length || 0;

  return (
    <section className="perfil-section perfil-statistics">
      <div className="section-heading">
        <div>
          <h2>Estatísticas</h2>
          <p>Monitore o desempenho do perfil e identifique as áreas que mais convertem.</p>
        </div>
      </div>

      <div className="statistics-grid">
        <div className="stat-block">
          <div className="stat-block-icon"><Eye size={18} /></div>
          <strong>{views}</strong>
          <span>Visualizações</span>
        </div>
        <div className="stat-block">
          <div className="stat-block-icon"><Star size={18} /></div>
          <strong>{rating}</strong>
          <span>Avaliação</span>
        </div>
        <div className="stat-block">
          <div className="stat-block-icon"><TrendingUp size={18} /></div>
          <strong>{growth}</strong>
          <span>Crescimento</span>
        </div>
        <div className="stat-block">
          <div className="stat-block-icon"><BarChart3 size={18} /></div>
          <strong>{projects}</strong>
          <span>Projetos</span>
        </div>
      </div>

      <div className="statistics-chart">
        <div className="chart-labels">
          <span>Comparativo mensal</span>
          <strong>+ 24%</strong>
        </div>
        <div className="chart-bar-list">
          <div><span>Fev</span><div className="chart-bar" style={{ height: "48%" }} /></div>
          <div><span>Mar</span><div className="chart-bar" style={{ height: "72%" }} /></div>
          <div><span>Abr</span><div className="chart-bar" style={{ height: "56%" }} /></div>
          <div><span>Mai</span><div className="chart-bar" style={{ height: "88%" }} /></div>
          <div><span>Jun</span><div className="chart-bar" style={{ height: "66%" }} /></div>
        </div>
      </div>

      <div className="statistics-insights">
        <div className="stat-insight-card">
          <Zap size={18} />
          <div>
            <strong>Maior engajamento</strong>
            <p>Projetos de UX estão sendo mais clicados nas últimas semanas.</p>
          </div>
        </div>
        <div className="stat-insight-card">
          <Zap size={18} />
          <div>
            <strong>Alta conversão</strong>
            <p>Clientes que veem o portfólio retornam mais rápido para pedido.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
