import { ArrowUpRight, Briefcase, Layers, PlusSquare, Eye, Star } from "lucide-react";

export default function Services({ user }) {
  const projects = user?.projects || [];

  return (
    <section className="perfil-section perfil-section-services">
      <div className="section-heading">
        <div>
          <h2>Serviços</h2>
          <p>Apresente seu portfólio, ofertas e projetos mais relevantes para novos clientes.</p>
        </div>
        <div className="section-actions">
          <button className="btn-secondary">
            <PlusSquare size={16} /> Adicionar serviço
          </button>
          <button className="btn-secondary outline">
            <ArrowUpRight size={16} /> Destaque do portfólio
          </button>
        </div>
      </div>

      <div className="service-highlights">
        <div className="service-highlight-card">
          <div className="highlight-icon"><Briefcase size={20} /></div>
          <div>
            <span>Projetos ativos</span>
            <strong>{projects.length}</strong>
          </div>
        </div>
        <div className="service-highlight-card">
          <div className="highlight-icon"><Eye size={20} /></div>
          <div>
            <span>Visualizações</span>
            <strong>{user?.views || 1240}</strong>
          </div>
        </div>
        <div className="service-highlight-card">
          <div className="highlight-icon"><Star size={20} /></div>
          <div>
            <span>Avaliação média</span>
            <strong>{user?.rating || 4.9}</strong>
          </div>
        </div>
      </div>

      <div className="project-grid">
        {projects.length === 0 ? (
          <div className="empty-project-card">
            <div className="empty-project-icon">+</div>
            <strong>Criar um projeto</strong>
            <p>Adicione um projeto ao seu portfólio para atrair clientes e mostrar seu estilo.</p>
          </div>
        ) : (
          projects.map((project, index) => (
            <article key={index} className="project-card">
              <div className="project-image" style={{ backgroundImage: `url(${project.preview})` }} />
              <div className="project-card-body">
                <div className="project-card-header">
                  <span>{project.title || `Projeto ${index + 1}`}</span>
                  <small>{project.category || "Design de interiores"}</small>
                </div>
                <p>{project.description || "Projeto criado para apresentar a qualidade do meu trabalho."}</p>
                <div className="project-card-meta">
                  <span>{project.initialPrice ? `R$ ${project.initialPrice}` : "R$ 0"}</span>
                  <span>{project.deliveryTime || "1 mês"}</span>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
