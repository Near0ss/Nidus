import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Footer2 from '../components/Footer2';
import ServiceCard from '../components/ServiceCard';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import '../css/Home.css';
import '../css/nidus.css';

export default function Servicos() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const sort = params.get('sort') || 'recent';
  const maxDays = params.get('maxDays') || '';
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';

  useEffect(() => {
    apiFetch('/api/categories').then((data) => setCategories(data.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const query = new URLSearchParams();
    if (q) query.set('q', q);
    if (category) query.set('category', category);
    if (sort) query.set('sort', sort);
    if (maxDays) query.set('maxDays', maxDays);
    if (minPrice) query.set('minPrice', minPrice);
    if (maxPrice) query.set('maxPrice', maxPrice);
    apiFetch(`/api/services?${query}`)
      .then((data) => active && setServices(data.services || []))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [q, category, sort, maxDays, minPrice, maxPrice]);

  function update(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  }

  async function onSave(service) {
    if (!user) return toast('Entre para salvar serviços.', 'error');
    try {
      const data = await apiFetch(`/api/saved/services/${service.id}`, { method: 'POST' });
      setServices((prev) => prev.map((item) => (item.id === service.id ? { ...item, saved: data.saved } : item)));
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  return (
    <div className="home-page">
      <main id="conteudo-principal" className="nidus-page">
        <section className="home-hero">
          <div className="home-hero__copy">
            <span className="u-eyebrow">Contratar</span>
            <h1>Serviços</h1>
            <p>Encontre ofertas ativas por categoria, preço e prazo.</p>
          </div>
        </section>

        {categories.length ? (
          <div className="chip-row">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`chip${category === cat.slug ? ' is-on' : ''}`}
                onClick={() => update('category', category === cat.slug ? '' : cat.slug)}
              >
                {cat.name} · {cat.serviceCount ?? 0}
              </button>
            ))}
          </div>
        ) : null}

        <form className="nidus-filters" onSubmit={(e) => e.preventDefault()}>
          <label>
            Busca
            <input value={q} onChange={(e) => update('q', e.target.value)} placeholder="Landing page, logo…" />
          </label>
          <label>
            Categoria
            <select value={category} onChange={(e) => update('category', e.target.value)}>
              <option value="">Todas</option>
              {categories.map((cat) => <option key={cat.id} value={cat.slug}>{cat.name}</option>)}
            </select>
          </label>
          <label>
            Prazo máx.
            <select value={maxDays} onChange={(e) => update('maxDays', e.target.value)}>
              <option value="">Qualquer</option>
              <option value="7">Até 7 dias</option>
              <option value="14">Até 14 dias</option>
              <option value="30">Até 30 dias</option>
            </select>
          </label>
          <label>
            Preço mín.
            <input type="number" min="0" value={minPrice} onChange={(e) => update('minPrice', e.target.value)} />
          </label>
          <label>
            Preço máx.
            <input type="number" min="0" value={maxPrice} onChange={(e) => update('maxPrice', e.target.value)} />
          </label>
          <label>
            Ordenar
            <select value={sort} onChange={(e) => update('sort', e.target.value)}>
              <option value="recent">Recentes</option>
              <option value="price_asc">Menor preço</option>
              <option value="price_desc">Maior preço</option>
              <option value="views">Mais vistos</option>
            </select>
          </label>
        </form>

        {loading ? <LoadingState /> : null}
        {error ? <ErrorState message={error} /> : null}
        {!loading && !services.length ? (
          <EmptyState title="Nenhum serviço ativo com esses filtros." />
        ) : (
          <div className="nidus-grid">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} onSave={onSave} />
            ))}
          </div>
        )}
      </main>
      <Footer2 />
    </div>
  );
}
