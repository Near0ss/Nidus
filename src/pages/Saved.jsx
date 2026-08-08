import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, MapPin } from "lucide-react";
import Footer2 from "../components/Footer2";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";
import "../css/Home.css";
import "../css/Saved.css";

export default function Saved() {
  const { user, updateUser } = useAuth();
  const [people, setPeople] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.type !== "normal") {
      setLoading(false);
      return;
    }

    setLoading(true);
    apiFetch("/api/saved")
      .then((data) => setPeople(data.users || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  async function unsave(id) {
    try {
      await apiFetch(`/api/saved/${id}`, { method: "POST" });
      setPeople((prev) => prev.filter((item) => item.id !== id));
      updateUser?.({
        savedIds: (user?.savedIds || []).filter((savedId) => savedId !== id),
      });
    } catch (err) {
      setError(err.message);
    }
  }

  const isContractor = user?.type === "normal";

  return (
    <div className="home-page saved-page">

      <main id="conteudo-principal" className="saved-main">
        <section className="home-hero">
          <img src={logo} alt="" className="home-hero__orb" />
          <div className="home-hero__copy">
            <span className="u-eyebrow">Favoritos</span>
            <h1>Salvos</h1>
            <p>
              {!isContractor
                ? "Salvar profissionais faz parte da jornada de quem contrata."
                : people.length
                  ? `${people.length} ninho${people.length === 1 ? "" : "s"} guardado${people.length === 1 ? "" : "s"} para contratar depois.`
                  : "Guarde os profissionais que você quer contratar depois."}
            </p>
            <div className="home-hero__actions">
              <Link to="/home?view=freelancers" className="home-btn">
                explorar ninhos
              </Link>
              <Link to="/home" className="home-btn ghost">
                ver feed
              </Link>
            </div>
          </div>
        </section>

        {!isContractor ? (
          <section className="home-empty">
            <img src={logo} alt="" className="home-empty__orb" />
            <h2>Disponível para contratantes</h2>
            <p>Entre com uma conta de usuário para salvar freelancers.</p>
            <div className="home-hero__actions">
              <Link to="/home" className="home-btn">
                Explorar o feed
              </Link>
            </div>
          </section>
        ) : error ? (
          <section className="home-empty">
            <h2>Não deu para carregar</h2>
            <p>{error}</p>
          </section>
        ) : loading ? (
          <section className="home-empty">
            <h2>Carregando o ninho…</h2>
            <p>Buscando os profissionais que você salvou.</p>
          </section>
        ) : people.length === 0 ? (
          <section className="home-empty">
            <img src={logo} alt="" className="home-empty__orb" />
            <h2>Ainda sem favoritos</h2>
            <p>Explore o feed e salve profissionais para contratar depois.</p>
            <div className="home-hero__actions">
              <Link to="/home?view=freelancers" className="home-btn">
                Explorar freelancers
              </Link>
            </div>
          </section>
        ) : (
          <div className="saved-grid">
            {people.map((author) => (
              <article key={author.id} className="freelancer-card saved-card">
                <Link to={`/u/${author.username}`} className="saved-card__main">
                  <div className="freelancer-avatar">
                    {author.profilePhoto ? (
                      <img src={author.profilePhoto} alt="" />
                    ) : (
                      <span>
                        {(author.businessName || author.username || "N").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="freelancer-body">
                    <strong>{author.businessName || author.username}</strong>
                    <span>
                      {(author.professionalTitle || []).slice(0, 2).join(" • ") || "Freelancer"}
                    </span>
                    <p>
                      <MapPin size={13} />
                      {author.country || "Brasil"}
                    </p>
                  </div>
                </Link>
                <button type="button" className="saved-unsave" onClick={() => unsave(author.id)}>
                  <Bookmark size={15} />
                  Remover
                </button>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer2 />
    </div>
  );
}
