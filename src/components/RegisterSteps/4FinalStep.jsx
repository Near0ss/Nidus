import {
  User,
  Building2,
  Globe,
  MapPin,
  BadgeCheck,
  Mail,
} from "lucide-react";
import { normalizeUsername } from "../../lib/username";

function FinalStep({ data, prevStep, goToStep, onSubmit, isLoading, error, success }) {
  const username = normalizeUsername(data.username);

  return (
    <div className="step-card final-step">
      <h1>Finalizando</h1>

      <p>Clique na informação se algo estiver incorreto</p>

      <div className="summary-section">
        <div className="summary-title">
          <User size={28} />
          Conta
        </div>

        <button type="button" className="summary-item" onClick={() => goToStep?.(1)}>
          <BadgeCheck size={16} />
          <span>@{username}</span>
        </button>

        <button type="button" className="summary-item" onClick={() => goToStep?.(1)}>
          <Mail size={16} />
          <span>{data.email}</span>
        </button>
      </div>

      <div className="summary-section">
        <div className="summary-title">
          <Building2 size={28} />
          Perfil profissional
        </div>

        <button type="button" className="summary-item" onClick={() => goToStep?.(2)}>
          <Building2 size={16} />
          <span>{data.businessName}</span>
        </button>

        <button type="button" className="summary-item" onClick={() => goToStep?.(2)}>
          <Globe size={16} />
          <span>{data.country}</span>
        </button>

        <button type="button" className="summary-item" onClick={() => goToStep?.(2)}>
          <MapPin size={16} />
          <span>{data.state}</span>
        </button>

        <button type="button" className="summary-tags" onClick={() => goToStep?.(2)}>
          {data.professionalTitle.map((title) => (
            <span key={title}>{title}</span>
          ))}
        </button>
      </div>

      {error && (
        <div className="field-error field-error--box">
          {error}
        </div>
      )}

      {success && (
        <div className="field-success field-success--box">
          {success}
        </div>
      )}

      <button
        type="button"
        className="already-account-register"
        onClick={prevStep}
        disabled={isLoading}
      >
        Voltar
      </button>

      <button
        type="button"
        className="step-next-btn active"
        onClick={onSubmit}
        disabled={isLoading}
        style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? "not-allowed" : "pointer" }}
      >
        <span>{isLoading ? "Criando conta..." : "Criar conta"}</span>
      </button>
    </div>
  );
}

export default FinalStep;
