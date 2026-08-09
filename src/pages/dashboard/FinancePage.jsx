import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { formatBRL } from '../../lib/format';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';

export default function FinancePage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    apiFetch('/api/finance').then(setData).catch(() => setData({ summary: {}, transactions: [] }));
  }, []);

  if (!data) return <LoadingState />;
  const s = data.summary || {};

  return (
    <section className="perfil-section perfil-finance">
      <div className="section-heading">
        <div>
          <h2>Finanças</h2>
          <p>{data.note || 'Controle interno. Nenhum pagamento externo foi processado.'}</p>
        </div>
      </div>
      <div className="finance-grid">
        <div className="finance-card"><span>Ganhos concluídos</span><strong>{formatBRL(s.completed) || 'R$ 0,00'}</strong></div>
        <div className="finance-card"><span>Ganhos pendentes</span><strong>{formatBRL(s.pending) || 'R$ 0,00'}</strong></div>
        <div className="finance-card"><span>Trabalhos ativos</span><strong>{formatBRL(s.active) || 'R$ 0,00'}</strong></div>
      </div>
      {!data.transactions?.length ? (
        <EmptyState
          title="Ainda sem movimentação."
          icon={<Wallet size={18} strokeWidth={1.75} />}
          actions={<Link to="/dashboard/jobs" className="home-btn outline">Ver trabalhos</Link>}
        >
          Quando um trabalho for aceito ou concluído, o histórico aparece aqui.
        </EmptyState>
      ) : (
        <ul className="activity-list">
          {data.transactions.map((item) => (
            <li key={item.id} className="nidus-card">
              <strong>{item.description || item.type}</strong>
              <span>{item.status} · {formatBRL(item.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
