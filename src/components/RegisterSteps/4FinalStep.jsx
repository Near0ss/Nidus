import {
  User,
  Building2,
  BriefcaseBusiness,
  Mail,
  Globe,
  MapPin,
  DollarSign,
  Clock3,
  BadgeCheck,
} from "lucide-react";



function FinalStep({ data, prevStep, onSubmit, isLoading, error, success }) {
    
  return (
    <div className="step-card final-step">
      <div className="step-icon">♥</div>

      <h1>Finalizando</h1>

      <p>Clique na informação se algo estiver incorreto</p>

      <div className="summary-section">
        <div className="summary-title">
          <User size={28} />
          Conta
        </div>

        <div className="summary-item">
          <BadgeCheck size={16} />
          <span>{data.username}</span>
        </div>

        <div className="summary-item">
          <Mail size={16} />
          <span>{data.email}</span>
        </div>
      </div>

      <div className="summary-section">
        <div className="summary-title">
          <Building2 size={28} />
          Perfil profissional
        </div>

        <div className="summary-item">
          <Building2 size={16} />
          <span>{data.businessName}</span>
        </div>

        <div className="summary-item">
          <Globe size={16} />
          <span>{data.country}</span>
        </div>

        <div className="summary-item">
          <MapPin size={16} />
          <span>{data.state}</span>
        </div>

        <div className="summary-tags">
          {data.professionalTitle.map((title) => (
            <span key={title}>{title}</span>
          ))}
        </div>
      </div>

      

      {error && (
        <div className="error-message" style={{ color: '#ef4444', marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fee2e2', borderRadius: '0.5rem', textAlign: 'center' }}>
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="success-message" style={{ color: '#10b981', marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#d1fae5', borderRadius: '0.5rem', textAlign: 'center' }}>
          ✅ {success}
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
        style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
      >
        <span>{isLoading ? '⏳ Criando conta...' : 'Criar conta'}</span>
      </button>
    </div>
  );
}

export default FinalStep;