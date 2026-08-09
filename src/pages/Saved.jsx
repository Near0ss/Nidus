import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Footer2 from '../components/Footer2';
import FreelancerCard from '../components/FreelancerCard';
import ServiceCard from '../components/ServiceCard';
import PostCard from '../components/PostCard';
import LoadingState from '../components/ui/LoadingState';
import EmptyState from '../components/ui/EmptyState';
import { apiFetch } from '../lib/api';
import '../css/Home.css';
import '../css/nidus.css';

export default function Saved() {
  const [data, setData] = useState({ freelancers: [], services: [], posts: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('freelancers');

  useEffect(() => {
    apiFetch('/api/saved')
      .then((payload) => setData({
        freelancers: payload.freelancers || payload.users || [],
        services: payload.services || [],
        posts: payload.posts || [],
      }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home-page">
      <main id="conteudo-principal" className="nidus-page">
        <section className="home-hero">
          <div className="home-hero__copy">
            <span className="u-eyebrow">Salvos</span>
            <h1>Guardados</h1>
            <p>Freelancers, serviços e publicações em listas separadas.</p>
          </div>
        </section>

        <div className="chip-row">
          <button type="button" className={`chip${tab === 'freelancers' ? ' is-on' : ''}`} onClick={() => setTab('freelancers')}>Freelancers</button>
          <button type="button" className={`chip${tab === 'services' ? ' is-on' : ''}`} onClick={() => setTab('services')}>Serviços</button>
          <button type="button" className={`chip${tab === 'posts' ? ' is-on' : ''}`} onClick={() => setTab('posts')}>Publicações</button>
        </div>

        {loading ? <LoadingState /> : null}

        {tab === 'freelancers' && !loading ? (
          data.freelancers.length
            ? <div className="nidus-grid freelancer-grid">{data.freelancers.map((item) => <FreelancerCard key={item.id} freelancer={item} />)}</div>
            : <EmptyState title="Você ainda não salvou freelancers." actions={<Link to="/freelancers" className="home-btn">Explorar</Link>} />
        ) : null}

        {tab === 'services' && !loading ? (
          data.services.length
            ? <div className="nidus-grid">{data.services.map((item) => <ServiceCard key={item.id} service={item} />)}</div>
            : <EmptyState title="Você ainda não salvou serviços." actions={<Link to="/servicos" className="home-btn">Ver serviços</Link>} />
        ) : null}

        {tab === 'posts' && !loading ? (
          data.posts.length
            ? data.posts.map((post) => <PostCard key={post.id} post={post} />)
            : <EmptyState title="Você ainda não salvou publicações." actions={<Link to="/social" className="home-btn">Abrir Social</Link>} />
        ) : null}
      </main>
      <Footer2 />
    </div>
  );
}
