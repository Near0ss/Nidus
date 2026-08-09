import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Footer2 from '../components/Footer2';
import ServiceCard from '../components/ServiceCard';
import FreelancerCard from '../components/FreelancerCard';
import PostCard from '../components/PostCard';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import '../css/Home.css';
import '../css/nidus.css';

export default function Home() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [data, setData] = useState(null);
  const [search, setSearch] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const req = q
      ? apiFetch(`/api/search?q=${encodeURIComponent(q)}`)
      : apiFetch('/api/home');
    req
      .then((payload) => {
        if (!active) return;
        if (q) setSearch(payload);
        else setData(payload);
        setError(null);
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [q]);

  return (
    <div className="home-page">
      <main id="conteudo-principal" className="home-feed nidus-page">
        <section className="home-hero">
          <img src={logo} alt="" className="home-hero__orb" />
          <div className="home-hero__copy">
            <span className="u-eyebrow">Descobrir</span>
            <h1>{q ? `Resultados para “${q}”` : 'Comece pelo que você precisa'}</h1>
            <p>
              Serviços, profissionais e a comunidade — tudo no mesmo lugar para divulgar, contratar e trabalhar.
            </p>
            <div className="home-hero__actions">
              <Link to="/servicos" className="home-btn">Serviços</Link>
              <Link to="/freelancers" className="home-btn ghost">Freelancers</Link>
              <Link to="/social" className="home-btn ghost">Social</Link>
            </div>
          </div>
        </section>

        {loading ? <LoadingState /> : null}
        {error ? <ErrorState message={error} /> : null}

        {q && search && !loading ? (
          <>
            {search.categories?.length ? (
              <section className="nidus-section">
                <h2>Categorias</h2>
                <div className="chip-row">
                  {search.categories.map((cat) => (
                    <Link key={cat.id} className="chip" to={`/servicos?category=${cat.slug}`}>{cat.name}</Link>
                  ))}
                </div>
              </section>
            ) : null}
            <section className="nidus-section">
              <h2>Serviços</h2>
              <div className="nidus-grid">
                {(search.services || []).map((service) => <ServiceCard key={service.id} service={service} />)}
              </div>
              {!search.services?.length ? <p className="muted">Nenhum serviço encontrado.</p> : null}
            </section>
            <section className="nidus-section">
              <h2>Freelancers</h2>
              <div className="nidus-grid freelancer-grid">
                {(search.freelancers || []).map((item) => <FreelancerCard key={item.id} freelancer={item} />)}
              </div>
            </section>
            <section className="nidus-section">
              <h2>Publicações</h2>
              {(search.posts || []).map((post) => <PostCard key={post.id} post={post} />)}
            </section>
          </>
        ) : null}

        {!q && data && !loading ? (
          <>
            {data.categories?.length ? (
              <section className="nidus-section">
                <div className="section-heading"><h2>Categorias em destaque</h2></div>
                <div className="chip-row">
                  {data.categories.map((cat) => (
                    <Link key={cat.id} className="chip" to={`/servicos?category=${cat.slug}`}>
                      {cat.name} · {cat.serviceCount}
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="nidus-section">
              <div className="section-heading">
                <h2>Serviços em destaque</h2>
                <Link to="/servicos">Ver todos</Link>
              </div>
              <div className="nidus-grid">
                {(data.featuredServices || []).map((service) => <ServiceCard key={service.id} service={service} />)}
              </div>
            </section>

            <section className="nidus-section">
              <div className="section-heading">
                <h2>Freelancers recomendados</h2>
                <Link to="/freelancers">Ver todos</Link>
              </div>
              <div className="nidus-grid freelancer-grid">
                {(data.freelancers || []).map((item) => <FreelancerCard key={item.id} freelancer={item} />)}
              </div>
            </section>

            <section className="nidus-section">
              <div className="section-heading">
                <h2>Novos serviços</h2>
              </div>
              <div className="nidus-grid">
                {(data.newServices || []).map((service) => <ServiceCard key={service.id} service={service} />)}
              </div>
            </section>

            {data.nearbyFreelancers?.length ? (
              <section className="nidus-section">
                <div className="section-heading"><h2>Perto de você</h2></div>
                <div className="nidus-grid freelancer-grid">
                  {data.nearbyFreelancers.map((item) => <FreelancerCard key={item.id} freelancer={item} />)}
                </div>
              </section>
            ) : null}

            <section className="nidus-section">
              <div className="section-heading">
                <h2>Conteúdo da comunidade</h2>
                <Link to="/social">Abrir Social</Link>
              </div>
              {(data.posts || []).map((post) => <PostCard key={post.id} post={post} />)}
              {!user ? <p className="muted">Entre para curtir, comentar e salvar publicações.</p> : null}
            </section>
          </>
        ) : null}
      </main>
      <Footer2 />
    </div>
  );
}
