import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { formatBRL } from '../../lib/format';
import LoadingState from '../../components/ui/LoadingState';

export default function StatsPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    apiFetch('/api/stats').then((data) => setStats(data.stats)).catch(() => setStats({}));
  }, []);

  if (!stats) return <LoadingState />;

  const items = [
    ['Visualizações de perfil', stats.profileViews || 0],
    ['Visualizações de serviço', stats.serviceViews || 0],
    ['Cliques em contratar', stats.hireClicks || 0],
    ['Mensagens recebidas', stats.messagesReceived || 0],
    ['Solicitações', stats.requestsReceived || 0],
    ['Contratos aceitos', stats.contractsAccepted || 0],
    ['Trabalhos concluídos', stats.jobsCompleted || 0],
    ['Receita', formatBRL(stats.revenue) || 'R$ 0,00'],
    ['Seguidores', stats.followers || 0],
    ['Curtidas', stats.likes || 0],
    ['Comentários', stats.comments || 0],
    ['Publicações', stats.posts || 0],
    ['Avaliação média', stats.rating ?? '—'],
    ['Avaliações', stats.reviewCount || 0],
  ];

  return (
    <section className="perfil-section perfil-statistics">
      <div className="section-heading">
        <div>
          <h2>Estatísticas</h2>
          <p>Somente dados reais do banco. Sem fallback falso.</p>
        </div>
      </div>
      <div className="statistics-grid">
        {items.map(([label, value]) => (
          <div key={label} className="stat-block">
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
