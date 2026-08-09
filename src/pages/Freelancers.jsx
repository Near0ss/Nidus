import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Footer2 from '../components/Footer2';
import FreelancerCard from '../components/FreelancerCard';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import { apiFetch } from '../lib/api';
import '../css/Home.css';
import '../css/nidus.css';

export default function Freelancers() {
  const [params, setParams] = useSearchParams();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const q = params.get('q') || '';
  const skill = params.get('skill') || '';
  const city = params.get('city') || '';
  const availability = params.get('availability') || '';

  useEffect(() => {
    let active = true;
    const query = new URLSearchParams();
    if (q) query.set('q', q);
    if (skill) query.set('skill', skill);
    if (city) query.set('city', city);
    if (availability) query.set('availability', availability);
    apiFetch(`/api/freelancers?${query}`)
      .then((data) => active && setList(data.freelancers || []))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [q, skill, city, availability]);

  function update(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  }

  return (
    <div className="home-page">
      <main id="conteudo-principal" className="nidus-page">
        <section className="home-hero">
          <div className="home-hero__copy">
            <span className="u-eyebrow">Descobrir</span>
            <h1>Freelancers</h1>
            <p>Profissionais públicos prontos para conversar e receber trabalhos.</p>
          </div>
        </section>

        <form className="nidus-filters" onSubmit={(e) => e.preventDefault()}>
          <label>Busca<input value={q} onChange={(e) => update('q', e.target.value)} placeholder="Nome, cidade, especialidade" /></label>
          <label>Especialidade<input value={skill} onChange={(e) => update('skill', e.target.value)} placeholder="UI/UX, React…" /></label>
          <label>Cidade<input value={city} onChange={(e) => update('city', e.target.value)} /></label>
          <label>Disponibilidade
            <select value={availability} onChange={(e) => update('availability', e.target.value)}>
              <option value="">Todas</option>
              <option value="AVAILABLE">Disponível</option>
              <option value="BUSY">Ocupado</option>
              <option value="UNAVAILABLE">Indisponível</option>
            </select>
          </label>
        </form>

        {loading ? <LoadingState /> : null}
        {error ? <ErrorState message={error} /> : null}
        {!loading && !list.length ? <EmptyState title="Nenhum freelancer encontrado." /> : (
          <div className="nidus-grid freelancer-grid">
            {list.map((item) => <FreelancerCard key={item.id} freelancer={item} />)}
          </div>
        )}
      </main>
      <Footer2 />
    </div>
  );
}
