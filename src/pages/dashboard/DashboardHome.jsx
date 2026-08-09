import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { formatBRL } from '../../lib/format';
import LoadingState from '../../components/ui/LoadingState';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';

export default function DashboardHome() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    apiFetch('/api/dashboard').then(setData).catch(() => setData({}));
  }, []);

  if (!data) return <LoadingState />;
  const s = data.summary || {};
  const isFreelancer = user?.type === 'freelancer';

  return (
    <section className="perfil-section perfil-dashboard">
      <div className="section-heading">
        <div>
          <h2>Visão geral</h2>
          <p>{isFreelancer ? 'Solicitações, trabalhos e ganhos reais.' : 'Suas contratações e atividade.'}</p>
        </div>
        <Link to={isFreelancer ? '/dashboard/services' : '/freelancers'} className="home-btn">
          {isFreelancer ? 'Novo serviço' : 'Explorar freelancers'}
        </Link>
      </div>

      <ul className={`home-pills${isFreelancer ? ' is-four' : ''}`}>
        {isFreelancer ? (
          <>
            <li><span>Solicitações</span><strong>{s.requests || 0}</strong></li>
            <li><span>Ativos</span><strong>{s.active || 0}</strong></li>
            <li><span>Ganhos</span><strong>{formatBRL(s.earnings) || 'R$ 0,00'}</strong></li>
            <li><span>Não lidas</span><strong>{s.unreadMessages || 0}</strong></li>
            <li><span>Visualizações</span><strong>{s.profileViews || 0}</strong></li>
            <li><span>Avaliação</span><strong>{s.rating ?? '—'}</strong></li>
          </>
        ) : (
          <>
            <li><span>Solicitados</span><strong>{s.requested || 0}</strong></li>
            <li><span>Em andamento</span><strong>{s.inProgress || 0}</strong></li>
            <li><span>Entregues</span><strong>{s.delivered || 0}</strong></li>
            <li><span>Concluídos</span><strong>{s.completed || 0}</strong></li>
          </>
        )}
      </ul>

      <div className="nidus-section">
        <h3>Atividade recente</h3>
        {(data.recent || data.recentContracts || []).length === 0 ? (
          <EmptyState
            title={isFreelancer ? 'Nenhuma atividade ainda' : 'Nenhuma contratação ainda'}
            actions={!isFreelancer ? <Link to="/freelancers" className="home-btn outline">Explorar profissionais</Link> : <Link to="/dashboard/services" className="home-btn outline">Criar serviço</Link>}
          >
            {isFreelancer ? 'Quando um cliente solicitar um trabalho, o resumo aparece aqui.' : 'Quando você contratar um profissional, a atividade aparece aqui.'}
          </EmptyState>
        ) : (
          <ul className="activity-list">
            {(data.recent || data.recentContracts || []).map((item) => (
              <li key={item.id} className="nidus-card">
                <strong>{item.title}</strong>
                <span>{item.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
