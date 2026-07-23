import {
  Globe,
  Star,
  FolderOpen,
  CircleCheck,
  Pencil,
  Briefcase,
  Wallet,
  MessageCircle,
  BarChart3
} from "lucide-react";

export default function SidebarProfile({
  user,
  setTab,
}) {
  return (
    <aside className="perfil-sidebar">

      <div className="perfil-card">

        <button
          className="perfil-main-button"
          onClick={() => setTab("settings")}
        >
          <Pencil size={18} />
          Editar perfil
        </button>
git
        <button
          className="perfil-secondary-button"
          onClick={() => setTab("social")}
        >
          Sociais
        </button>

      </div>

      <div className="perfil-card">

        <h4>Disponibilidade</h4>

        <p>
          Ative sua disponibilidade para
          aparecer nas buscas e receber
          novos clientes.
        </p>

        <button className="perfil-outline-button">
          Ativar disponibilidade
        </button>

      </div>

      <div className="perfil-card">

        <h4>Experiência</h4>

        <p>
          Adicione experiências e projetos
          para fortalecer seu perfil.
        </p>

        <button
          className="perfil-link-button"
          onClick={() => setTab("services")}
        >
          Adicionar experiência
        </button>

      </div>

      <div className="perfil-card">

        <div className="perfil-info-item">

          <FolderOpen size={17} />

          <span>Projetos</span>

          <strong>
            {user?.projects?.length || 0}
          </strong>

        </div>

        <div className="perfil-info-item">

          <Star size={17} />

          <span>Avaliação</span>

          <strong>
            {user?.rating || "4.9"}
          </strong>

        </div>

        <div className="perfil-info-item">

          <Wallet size={17} />

          <span>Saldo</span>

          <strong>
            R$ {user?.balance || "0,00"}
          </strong>

        </div>

        <div className="perfil-info-item">

          <CircleCheck size={17} />

          <span>Status</span>

          <strong>Ativo</strong>

        </div>

      </div>


      <div className="perfil-member">

        <span>
          MEMBRO DESDE
        </span>

        <strong>
          {user?.createdAt
            ? new Date(
                user.createdAt
              ).toLocaleDateString("pt-BR")
            : "2026"}
        </strong>

      </div>

    </aside>
  );
}