import { useEffect, useState } from "react";
import Navbar2 from "../components/Navbar2";
import FilterSection from "../components/FilterSection";
import "../css/Home.css";
import Footer2 from "../components/Footer2";
import { apiFetch } from "../lib/api";

function Home() {
  const [feed, setFeed] = useState([]);
  const [topFreelancers, setTopFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    categories: [],
    tools: [],
    country: "",
    city: ""
  });

  useEffect(() => {
    async function loadTopFreelancers() {
      try {
        const data = await apiFetch("/api/users");
        setTopFreelancers(
          (data.users || [])
            .slice()
            .sort((a, b) => (b.statistics?.posts || 0) - (a.statistics?.posts || 0))
        );
      } catch (err) {
        console.error(err.message || "Erro ao carregar freelancers");
      }
    }

    loadTopFreelancers();
  }, []);

  useEffect(() => {
    async function loadFeed() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (filters.country) params.append("country", filters.country);
        if (filters.city) params.append("city", filters.city);
        if (filters.categories.length > 0) params.append("categories", filters.categories.join(","));
        if (filters.tools.length > 0) params.append("tools", filters.tools.join(","));

        const url = `/api/feed${params.toString() ? `?${params.toString()}` : ""}`;
        const data = await apiFetch(url);

        setFeed(data.feed || []);
      } catch (err) {
        setError(err.message || "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    }

    loadFeed();
  }, [filters]);

  function handleFilterChange(updatedFilters) {
    setFilters(updatedFilters);
  }

  const featuredPosts = feed.slice(0, 2);
  const recentPosts = feed.slice(2);
  const popularFreelancers = topFreelancers.slice(0, 4);

  return (
    <div className="home-page">
      <Navbar2 />

      <div className="home-layout">
        <FilterSection onFilterChange={handleFilterChange} />

        <main className="home-feed">
          <div className="feed-header">
            <div>
              <h1>Feed</h1>
              <p>Conecte-se com os projetos, novidades e posts recentes da comunidade Nidus.</p>
            </div>
          </div>

          <section className="home-welcome-card">
            <div>
              <strong>Refine seu feed</strong>
              <p>Use os filtros para ver trabalhos por categoria, ferramentas e localização.</p>
            </div>
          </section>

          {loading ? (
            <section className="feed-empty">
              <div className="feed-empty-card">
                <span className="feed-empty-icon">⟳</span>
                <h2>Carregando feed...</h2>
                <p>Aguarde um momento enquanto os posts são carregados.</p>
              </div>
            </section>
          ) : error ? (
            <section className="feed-empty">
              <div className="feed-empty-card">
                <span className="feed-empty-icon">⚠</span>
                <h2>Falha ao carregar</h2>
                <p>{error}</p>
              </div>
            </section>
          ) : feed.length === 0 ? (
            <section className="feed-empty">
              <div className="feed-empty-card">
                <span className="feed-empty-icon">◎</span>
                <h2>Nenhum post combina com esses filtros</h2>
                <p>Experimente limpar os filtros ou mudar a localização para encontrar mais resultados.</p>
              </div>
            </section>
          ) : (
            <>
              <section className="feed-section">
                <div className="section-header">
                  <h2>Destaques</h2>
                  <p>Os posts mais recentes e relevantes para você.</p>
                </div>
                <div className="featured-grid">
                  {featuredPosts.map((post) => (
                    <article key={post.id} className="feed-card featured-card">
                      <div className="feed-card-header">
                        <div className="feed-author-avatar">
                          {post.author.profilePhoto ? (
                            <img src={post.author.profilePhoto} alt={post.author.businessName || post.author.username} />
                          ) : (
                            <span>{(post.author.businessName || post.author.username || "U").charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <strong>{post.author.businessName || post.author.username}</strong>
                          <span>{post.author.country || "Brasil"}</span>
                        </div>
                        <small>{new Date(post.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</small>
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
                  <h2>Freelancers em alta</h2>
                  <p>Profissionais com mais publicações recentes na plataforma.</p>
                </div>
                <div className="top-freelancers-grid">
                  {popularFreelancers.map((author) => (
                    <article key={author.id} className="freelancer-card">
                      <div className="freelancer-avatar">
                        {author.profilePhoto ? (
                          <img src={author.profilePhoto} alt={author.businessName || author.username} />
                        ) : (
                          <span>{(author.businessName || author.username || "F").charAt(0)}</span>
                        )}
                      </div>
                      <div className="freelancer-body">
                        <strong>{author.businessName || author.username}</strong>
                        <span>{author.country || "Brasil"}</span>
                        <p>{author.professionalTitle?.slice(0, 2).join(" • ") || "Especialista em serviços digitais"}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="feed-section">
                <div className="section-header">
                  <h2>Novidades</h2>
                  <p>Confira as últimas publicações da comunidade Nidus.</p>
                </div>
                <div className="feed-list">
                  {recentPosts.map((post) => (
                    <article key={post.id} className="feed-card">
                      <div className="feed-card-header">
                        <div className="feed-author-avatar">
                          {post.author.profilePhoto ? (
                            <img src={post.author.profilePhoto} alt={post.author.businessName || post.author.username} />
                          ) : (
                            <span>{(post.author.businessName || post.author.username || "U").charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <strong>{post.author.businessName || post.author.username}</strong>
                          <span>{post.author.country || "Brasil"}</span>
                        </div>
                        <small>{new Date(post.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</small>
                      </div>

                      {post.media && (
                        <div className="feed-card-image" style={{ backgroundImage: `url(${post.media})` }} />
                      )}

                      <div className="feed-card-content">
                        <p>{post.caption || "Compartilhando um trabalho recente com a comunidade."}</p>
                      </div>

                      <div className="feed-card-actions">
                        <button type="button">Curtir • {post.likes || 0}</button>
                        <button type="button">Comentários • {post.comments?.length || 0}</button>
                        <button type="button">Compartilhar</button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      <Footer2 />
    </div>
  );
}

export default Home;