import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Bookmark, MapPin } from "lucide-react";
import Footer2 from "../components/Footer2";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import "../css/Perfil.css";
import "../css/Home.css";

function formatMoney(value) {
  const amount = Number(String(value || "").replace(",", "."));
  if (!Number.isFinite(amount) || amount <= 0) return "A combinar";
  return `R$ ${amount.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function PublicProfile() {
  const { username } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    apiFetch(`/api/u/${encodeURIComponent(username)}`)
      .then((data) => {
        if (active) setProfile(data.user);
      })
      .catch((err) => {
        if (active) setError(err.message || "Perfil não encontrado");
      });
    return () => {
      active = false;
    };
  }, [username]);

  useEffect(() => {
    if (!user || user.type !== "normal") return;
    apiFetch("/api/saved")
      .then((data) => {
        const ids = (data.users || []).map((item) => item.id);
        setSaved(ids.includes(profile?.id));
      })
      .catch(() => {});
  }, [user, profile?.id]);

  async function toggleSave() {
    if (!user) {
      navigate("/authchoice");
      return;
    }
    if (user.type !== "normal") return;
    setSaving(true);
    try {
      const data = await apiFetch(`/api/saved/${profile.id}`, { method: "POST" });
      setSaved(Boolean(data.saved));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const initials =
    (profile?.businessName || profile?.username || "N").charAt(0).toUpperCase();
  const projects = profile?.projects || [];

  return (
    <div className="home-page">
      <div className="perfil-page">
        <div className="perfil-layout public-profile">
          <main id="conteudo-principal" className="perfil-feed">
            {error && !profile ? (
              <section className="nidus-empty public-profile-empty">
                <strong>Ninho não encontrado</strong>
                <p>{error}</p>
                <Link to="/home" className="home-btn ghost">
                  Voltar ao feed
                </Link>
              </section>
            ) : null}

            {profile ? (
              <>
                <section className="perfil-hero">
                  <div
                    className={`profile-cover${profile.banner ? "" : " is-default"}`}
                    style={
                      profile.banner
                        ? { backgroundImage: `url(${profile.banner})` }
                        : undefined
                    }
                  />

                  <div className="home-hero">
                    <div className="home-hero__orb perfil-orb" aria-hidden="true">
                      {profile.profilePhoto ? (
                        <img src={profile.profilePhoto} alt="" />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>

                    <div className="home-hero__copy">
                      <span className="u-eyebrow">Perfil público</span>
                      <h1>{profile.businessName || profile.username}</h1>
                      <p className="public-profile-handle">@{profile.username}</p>
                      <p>
                        <MapPin size={14} />
                        <span>
                          {[profile.country, profile.state].filter(Boolean).join(" · ") ||
                            "Brasil"}
                        </span>
                      </p>
                      <p className="public-profile-bio">
                        {profile.bio || "Este ninho ainda não tem uma bio."}
                      </p>

                      {profile.professionalTitle?.length > 0 ? (
                        <div className="public-profile-tags">
                          {profile.professionalTitle.map((title) => (
                            <span key={title}>{title}</span>
                          ))}
                        </div>
                      ) : null}

                      <div className="home-hero__actions">
                        {user?.type === "normal" ? (
                          <button
                            type="button"
                            className="home-btn"
                            onClick={toggleSave}
                            disabled={saving}
                          >
                            <Bookmark size={16} />
                            {saved ? "Salvo" : "Salvar profissional"}
                          </button>
                        ) : !user ? (
                          <button
                            type="button"
                            className="home-btn"
                            onClick={() => navigate("/authchoice")}
                          >
                            Entrar para salvar
                          </button>
                        ) : null}
                        <Link to="/home" className="home-btn ghost">
                          Ver feed
                        </Link>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="perfil-section">
                  <div className="section-heading">
                    <div>
                      <h2>Trabalhos</h2>
                      <p>Projetos publicados neste ninho.</p>
                    </div>
                    <strong className="public-profile-count">
                      {projects.length} {projects.length === 1 ? "projeto" : "projetos"}
                    </strong>
                  </div>

                  {projects.length === 0 ? (
                    <div className="nidus-empty public-profile-empty">
                      <strong>Ninho ainda vazio</strong>
                      <p>Este freelancer ainda não publicou projetos.</p>
                    </div>
                  ) : (
                    <div className="project-grid">
                      {projects.map((project, index) => (
                        <article key={project.id || index} className="project-card">
                          <div
                            className={`project-image${project.preview ? "" : " is-empty"}`}
                            style={
                              project.preview
                                ? { backgroundImage: `url(${project.preview})` }
                                : undefined
                            }
                          />
                          <div className="project-card-body">
                            <div className="project-card-header">
                              <span>{project.title || project.name || `Projeto ${index + 1}`}</span>
                              <small>{project.category || project.deliveryTime || "Portfólio"}</small>
                            </div>
                            {project.description ? <p>{project.description}</p> : null}
                            <div className="project-card-meta">
                              <span>{formatMoney(project.initialPrice)}</span>
                              <span>{project.deliveryTime || "Prazo a combinar"}</span>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              </>
            ) : !error ? (
              <div className="app-boot">Carregando perfil…</div>
            ) : null}
          </main>
        </div>
        <Footer2 />
      </div>
    </div>
  );
}
