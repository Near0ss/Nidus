import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import FilterSection from "../components/FilterSection";
import Footer2 from "../components/Footer2";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";
import "../css/Home.css";

function FreelancerCard({ author }) {
  return (
    <Link to={`/u/${author.username}`} className="freelancer-card">
      <div className="freelancer-avatar">
        {author.profilePhoto ? (
          <img src={author.profilePhoto} alt="" />
        ) : (
          <span>{(author.businessName || author.username || "F").charAt(0)}</span>
        )}
      </div>
      <div className="freelancer-body">
        <strong>{author.businessName || author.username}</strong>
        <span>{author.country || "Brasil"}</span>
        <p>{author.professionalTitle?.slice(0, 2).join(" • ") || "Especialista em serviços digitais"}</p>
      </div>
    </Link>
  );
}

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const view = searchParams.get("view") || "";

  const [feed, setFeed] = useState([]);
  const [topFreelancers, setTopFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState({});
  const [filters, setFilters] = useState({
    categories: [],
    tools: [],
    country: "",
    city: "",
  });

  useEffect(() => {
    async function loadTopFreelancers() {
      try {
        const data = await apiFetch("/api/users");
        setTopFreelancers(
          (data.users || [])
            .slice()
            .sort((a, b) => (b.statistics?.posts || 0) - (a.statistics?.posts || 0)),
        );
      } catch (err) {
        console.error(err.message || "Erro ao carregar freelancers");
      }
    }

    loadTopFreelancers();
  }, []);

  useEffect(() => {
    let active = true;

    async function loadFeed() {
      setError(null);
      if (feed.length === 0) setLoading(true);

      try {
        const params = new URLSearchParams();
        if (filters.country) params.append("country", filters.country);
        if (filters.city) params.append("city", filters.city);
        if (filters.categories.length > 0) params.append("categories", filters.categories.join(","));
        if (filters.tools.length > 0) params.append("tools", filters.tools.join(","));
        if (query) params.append("q", query);

        const url = `/api/feed${params.toString() ? `?${params.toString()}` : ""}`;
        const data = await apiFetch(url);
        if (!active) return;
        setFeed(data.feed || []);
      } catch (err) {
        if (!active) return;
        setError(err.message || "Erro desconhecido");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadFeed();
    return () => { active = false; };
  }, [filters, query]);

  const handleFilterChange = useCallback((updatedFilters) => {
    setFilters((prev) => {
      if (
        prev.country === updatedFilters.country &&
        prev.city === updatedFilters.city &&
        prev.categories.join() === updatedFilters.categories.join() &&
        prev.tools.join() === updatedFilters.tools.join()
      ) {
        return prev;
      }
      return updatedFilters;
    });
  }, []);

  const featuredPosts = feed.slice(0, 2);
  const recentPosts = feed.slice(2);
  const popularFreelancers = useMemo(() => {
    if (!query) return topFreelancers.slice(0, 8);
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    return topFreelancers.filter((author) => {
      const haystack = [
        author.businessName,
        author.username,
        author.name,
        author.country,
        author.state,
        ...(author.professionalTitle || []),
      ]
        .join(" ")
        .toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    });
  }, [topFreelancers, query]);

  function toggleLike(postId) {
    setLiked((prev) => ({ ...prev, [postId]: !prev[postId] }));
  }

  function goPublish() {
    navigate(user ? "/perfil" : "/authchoice");
  }

  return (
    <div className="home-page">

      <div className="home-layout">
        <FilterSection onFilterChange={handleFilterChange} />

        <main id="conteudo-principal" className="home-feed">
          <section className="home-hero">
            <img src={logo} alt="" className="home-hero__orb" />
            <div className="home-hero__copy">
              <span className="u-eyebrow">{view === "freelancers" ? "Descobrir" : "Comunidade"}</span>
              <h1>{view === "freelancers" ? "Freelancers" : "Feed"}</h1>
              <p>
                {query
                  ? `Resultados para “${query}”`
                  : "Projetos, ninhos e profissionais — a comunidade Nidus num só lugar."}
              </p>
              <div className="home-hero__actions">
                <Link to="/home?view=freelancers" className="home-btn">
                  explorar ninhos
                </Link>
                <button type="button" className="home-btn ghost" onClick={goPublish}>
                  publicar trabalho
                </button>
              </div>
            </div>
          </section>

          <ul className="home-pills" aria-label="Resumo da comunidade">
            <li>
              <strong>{popularFreelancers.length || "—"}</strong>
              <span>ninhos ativos</span>
            </li>
            <li>
              <strong>{feed.length}</strong>
              <span>publicações</span>
            </li>
            <li>
              <strong>PT-BR</strong>
              <span>comunidade</span>
            </li>
          </ul>

          {view === "freelancers" ? (
            popularFreelancers.length === 0 ? (
              <section className="home-empty">
                <img src={logo} alt="" className="home-empty__orb" />
                <h2>Nenhum ninho encontrado</h2>
                <p>Tente outra busca ou limpe os filtros.</p>
              </section>
            ) : (
              <div className="top-freelancers-grid">
                {popularFreelancers.map((author) => (
                  <FreelancerCard key={author.id} author={author} />
                ))}
              </div>
            )
          ) : loading ? (
            <section className="home-empty">
              <h2>Carregando o ninho…</h2>
              <p>Buscando publicações da comunidade.</p>
            </section>
          ) : error ? (
            <section className="home-empty">
              <h2>Falha ao carregar</h2>
              <p>{error}</p>
            </section>
          ) : (
            <>
              {query && popularFreelancers.length > 0 && (
                <section className="feed-section">
                  <div className="section-header">
                    <h2>Ninhos encontrados</h2>
                    <p>Profissionais que combinam com “{query}”.</p>
                  </div>
                  <div className="top-freelancers-grid">
                    {popularFreelancers.slice(0, 8).map((author) => (
                      <FreelancerCard key={author.id} author={author} />
                    ))}
                  </div>
                </section>
              )}

              {feed.length === 0 ? (
                <section className="home-empty">
                  <img src={logo} alt="" className="home-empty__orb" />
                  <h2>
                    {query && popularFreelancers.length > 0
                      ? "Nenhum post com esse termo"
                      : query
                        ? "Nada encontrado"
                        : "O feed ainda está quieto"}
                  </h2>
                  <p>
                    {query && popularFreelancers.length > 0
                      ? "Não há publicações com essa busca, mas os ninhos acima combinam."
                      : query
                        ? "Tente outro termo ou explore os freelancers da comunidade."
                        : "Ainda não há publicações. Entre num ninho ou seja o primeiro a mostrar trabalho."}
                  </p>
                  <div className="home-hero__actions">
                    <Link to="/home?view=freelancers" className="home-btn">
                      ver freelancers
                    </Link>
                    <button type="button" className="home-btn ghost" onClick={goPublish}>
                      publicar agora
                    </button>
                  </div>
                </section>
              ) : (
                <>
                  <section className="feed-section">
                    <div className="section-header">
                      <h2>Destaques</h2>
                      <p>Os posts mais recentes da comunidade.</p>
                    </div>
                    <div className="featured-grid">
                      {featuredPosts.map((post) => (
                        <article key={post.id} className="feed-card featured-card">
                          <div className="feed-card-header">
                            <Link to={`/u/${post.author.username}`} className="feed-author-avatar">
                              {post.author.profilePhoto ? (
                                <img src={post.author.profilePhoto} alt="" />
                              ) : (
                                <span>{(post.author.businessName || post.author.username || "U").charAt(0)}</span>
                              )}
                            </Link>
                            <div>
                              <Link to={`/u/${post.author.username}`}>
                                <strong>{post.author.businessName || post.author.username}</strong>
                              </Link>
                              <span>{post.author.country || "Brasil"}</span>
                            </div>
                            <small>
                              {new Date(post.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                            </small>
                          </div>
                          {post.media && (
                            <div className="feed-card-image" style={{ backgroundImage: `url(${post.media})` }} />
                          )}
                          <div className="feed-card-content">
                            <p>{post.caption || "Compartilhando um trabalho recente com a comunidade."}</p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>

                  <section className="feed-section">
                    <div className="section-header">
                      <h2>Novidades</h2>
                      <p>Últimas publicações no Nidus.</p>
                    </div>
                    <div className="feed-list">
                      {recentPosts.map((post) => {
                        const likes = (post.likes || 0) + (liked[post.id] ? 1 : 0);
                        return (
                          <article key={post.id} className="feed-card">
                            <div className="feed-card-header">
                              <Link to={`/u/${post.author.username}`} className="feed-author-avatar">
                                {post.author.profilePhoto ? (
                                  <img src={post.author.profilePhoto} alt="" />
                                ) : (
                                  <span>{(post.author.businessName || post.author.username || "U").charAt(0)}</span>
                                )}
                              </Link>
                              <div>
                                <Link to={`/u/${post.author.username}`}>
                                  <strong>{post.author.businessName || post.author.username}</strong>
                                </Link>
                                <span>{post.author.country || "Brasil"}</span>
                              </div>
                              <small>
                                {new Date(post.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                              </small>
                            </div>

                            {post.media && (
                              <div className="feed-card-image" style={{ backgroundImage: `url(${post.media})` }} />
                            )}

                            <div className="feed-card-content">
                              <p>{post.caption || "Compartilhando um trabalho recente com a comunidade."}</p>
                            </div>

                            <div className="feed-card-actions">
                              <button type="button" onClick={() => toggleLike(post.id)} aria-pressed={Boolean(liked[post.id])}>
                                {liked[post.id] ? "Curtido" : "Curtir"} • {likes}
                              </button>
                              <button type="button" disabled title="Em breve">
                                Comentários • {post.comments?.length || 0}
                              </button>
                              <button
                                type="button"
                                onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/u/${post.author.username}`)}
                              >
                                Compartilhar
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                </>
              )}

              {!query && popularFreelancers.length > 0 && (
                <section className="feed-section">
                  <div className="section-header">
                    <h2>Ninhos em alta</h2>
                    <p>Profissionais para explorar agora.</p>
                  </div>
                  <div className="top-freelancers-grid">
                    {popularFreelancers.slice(0, 4).map((author) => (
                      <FreelancerCard key={author.id} author={author} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>

      <Footer2 />
    </div>
  );
}

export default Home;
