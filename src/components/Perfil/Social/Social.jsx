import { useEffect, useState } from "react";
import {
  InstagramIcon,
  XIcon,
  LinkedInIcon,
  FacebookIcon,
} from "../../SocialLinks";
import { apiFetch } from "../../../lib/api";

const NETWORKS = [
  { key: "instagram", name: "Instagram", Icon: InstagramIcon, placeholder: "@seuusuario" },
  { key: "twitter", name: "X", Icon: XIcon, placeholder: "@seuusuario" },
  { key: "linkedin", name: "LinkedIn", Icon: LinkedInIcon, placeholder: "linkedin.com/in/seuuser" },
  { key: "facebook", name: "Facebook", Icon: FacebookIcon, placeholder: "facebook.com/seuuser" },
];

function toHref(key, value) {
  const v = String(value || "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  const handle = v.replace(/^@/, "");
  if (key === "instagram") return `https://instagram.com/${handle}`;
  if (key === "twitter") return `https://x.com/${handle}`;
  if (key === "linkedin") return v.includes("linkedin.com") ? `https://${v.replace(/^https?:\/\//i, "")}` : `https://linkedin.com/in/${handle}`;
  if (key === "facebook") return v.includes("facebook.com") ? `https://${v.replace(/^https?:\/\//i, "")}` : `https://facebook.com/${handle}`;
  return v;
}

export default function Social({ user, updateUser }) {
  const [links, setLinks] = useState({
    instagram: "",
    twitter: "",
    linkedin: "",
    facebook: "",
  });
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLinks({
      instagram: user.socialLinks?.instagram || "",
      twitter: user.socialLinks?.twitter || "",
      linkedin: user.socialLinks?.linkedin || "",
      facebook: user.socialLinks?.facebook || "",
    });
    setWebsite(user.website || "");
  }, [user]);

  async function handleSave(event) {
    event.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    setStatus("Salvando...");
    try {
      const data = await apiFetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          socialLinks: links,
          website,
        }),
      });
      updateUser(data.user);
      setStatus("Redes atualizadas.");
    } catch (err) {
      setStatus(err.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="perfil-section perfil-social">
      <div className="section-heading">
        <div>
          <h2>Redes externas</h2>
          <p>Links do Instagram, LinkedIn e site. A rede interna do Nidus fica em Social.</p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="social-grid">
          {NETWORKS.map(({ key, name, Icon, placeholder }) => {
            const href = toHref(key, links[key]);
            return (
              <label key={key} className="social-card">
                <div className="social-card-top">
                  <span className="social-icon">
                    <Icon size={18} />
                  </span>
                  <strong>{name}</strong>
                  {href ? (
                    <a href={href} target="_blank" rel="noreferrer">
                      Abrir
                    </a>
                  ) : (
                    <small>vazio</small>
                  )}
                </div>
                <input
                  value={links[key]}
                  onChange={(e) => setLinks((prev) => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder}
                />
              </label>
            );
          })}
        </div>

        <label className="social-website">
          Site / portfólio
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://seusite.com"
          />
        </label>

        <div className="settings-actions">
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Salvar redes"}
          </button>
          {status && <span className="settings-status">{status}</span>}
        </div>
      </form>
    </section>
  );
}
