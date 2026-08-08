import { useNavigate } from "react-router-dom";
import { Wallet, MapPin, Bookmark } from "lucide-react";

export default function SidebarProfile({ user, setTab }) {
  const navigate = useNavigate();
  const isFreelancer = user?.type === "freelancer";
  const savedCount = Array.isArray(user?.savedIds) ? user.savedIds.length : 0;

  return (
    <aside className="perfil-sidebar">
      <div className="sidebar-header">
        <h3>Atalhos</h3>
      </div>

      {isFreelancer ? (
        <button type="button" className="new-project" onClick={() => setTab("services")}>
          Novo serviço
        </button>
      ) : (
        <button type="button" className="new-project" onClick={() => navigate("/home")}>
          Explorar freelancers
        </button>
      )}

      <button type="button" className="perfil-ghost-link" onClick={() => setTab("settings")}>
        Configurações
      </button>
      <button type="button" className="perfil-ghost-link" onClick={() => setTab("social")}>
        Redes sociais
      </button>

      {isFreelancer ? (
        <>
          <div className="perfil-card-divider" />
          <h4>Disponibilidade</h4>
          <p>Ative para aparecer nas buscas e receber novos clientes.</p>
          <button type="button" className="perfil-outline-button">
            Ativar disponibilidade
          </button>
        </>
      ) : user?.bio ? (
        <p className="perfil-bio-preview">{user.bio}</p>
      ) : null}

      <div className="perfil-card-divider" />

      {isFreelancer ? (
        <>
          <div className="perfil-info-item">
            <Wallet size={16} />
            <span>Projetos</span>
            <strong>{user?.projects?.length || 0}</strong>
          </div>
          <div className="perfil-info-item">
            <Wallet size={16} />
            <span>Saldo</span>
            <strong>R$ 0,00</strong>
          </div>
        </>
      ) : (
        <>
          <div className="perfil-info-item">
            <Bookmark size={16} />
            <span>Salvos</span>
            <strong>{savedCount}</strong>
          </div>
          <div className="perfil-info-item">
            <MapPin size={16} />
            <span>Local</span>
            <strong>{user?.country || "—"}</strong>
          </div>
        </>
      )}

      <div className="perfil-member">
        <span>Membro desde</span>
        <strong>
          {user?.createdAt
            ? new Date(user.createdAt).toLocaleDateString("pt-BR")
            : "—"}
        </strong>
      </div>
    </aside>
  );
}
