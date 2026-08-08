import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";

const EMPTY_FORM = {
  name: "",
  businessName: "",
  username: "",
  email: "",
  bio: "",
  company: "",
  website: "",
  phone: "",
  hiringFocus: "",
  country: "",
  state: "",
  availability: "",
};

export default function Settings({ user, updateUser }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const isFreelancer = user?.type === "freelancer";

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      businessName: user.businessName || "",
      username: user.username || "",
      email: user.email || "",
      bio: user.bio || "",
      company: user.company || "",
      website: user.website || "",
      phone: user.phone || "",
      hiringFocus: user.hiringFocus || "",
      country: user.country || "",
      state: user.state || "",
      availability: user.availability || "",
    });
  }, [user]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setStatus("Salvando...");
    try {
      const payload = isFreelancer
        ? {
            businessName: form.businessName,
            username: form.username,
            bio: form.bio,
            website: form.website,
            country: form.country,
            state: form.state,
            availability: form.availability,
          }
        : {
            name: form.name,
            bio: form.bio,
            company: form.company,
            website: form.website,
            phone: form.phone,
            hiringFocus: form.hiringFocus,
            country: form.country,
            state: form.state,
          };

      const data = await apiFetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      updateUser(data.user);
      setStatus("Perfil atualizado.");
    } catch (err) {
      setStatus(err.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <section className="perfil-section perfil-settings">
      <div className="section-heading">
        <div>
          <h2>Configurações</h2>
          <p>Complete seus dados. Quanto mais preenchido, mais fácil te encontrarem no Nidus.</p>
        </div>
      </div>

      <form className="settings-grid" onSubmit={handleSave}>
        {isFreelancer ? (
          <>
            <label>
              Nome da empresa
              <input value={form.businessName} onChange={(e) => setField("businessName", e.target.value)} />
            </label>
            <label>
              Usuário
              <input value={form.username} onChange={(e) => setField("username", e.target.value)} />
            </label>
          </>
        ) : (
          <>
            <label>
              Nome
              <input value={form.name} onChange={(e) => setField("name", e.target.value)} />
            </label>
            <label>
              Empresa / organização
              <input
                value={form.company}
                onChange={(e) => setField("company", e.target.value)}
                placeholder="Opcional"
              />
            </label>
          </>
        )}

        <label>
          Email
          <input value={form.email} disabled />
        </label>

        {!isFreelancer && (
          <label>
            Telefone
            <input
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </label>
        )}

        <label>
          País
          <input value={form.country} onChange={(e) => setField("country", e.target.value)} placeholder="Brasil" />
        </label>
        <label>
          Estado / cidade
          <input value={form.state} onChange={(e) => setField("state", e.target.value)} placeholder="São Paulo" />
        </label>

        <label className={isFreelancer ? "" : "settings-fullwidth"}>
          Site / portfólio
          <input
            value={form.website}
            onChange={(e) => setField("website", e.target.value)}
            placeholder="https://"
          />
        </label>

        {isFreelancer && (
          <label>
            Disponibilidade
            <input
              value={form.availability}
              onChange={(e) => setField("availability", e.target.value)}
              placeholder="Livre, ocupado, em projeto..."
            />
          </label>
        )}

        {!isFreelancer && (
          <label className="settings-fullwidth">
            O que você costuma contratar
            <input
              value={form.hiringFocus}
              onChange={(e) => setField("hiringFocus", e.target.value)}
              placeholder="Ex: branding, site, motion, UI"
            />
          </label>
        )}

        <label className="settings-fullwidth">
          Bio
          <textarea
            rows={4}
            value={form.bio}
            onChange={(e) => setField("bio", e.target.value)}
            placeholder={
              isFreelancer
                ? "Conte o que você faz e para quem."
                : "Conte quem você é e que tipo de projeto busca."
            }
          />
        </label>

        <div className="settings-actions settings-fullwidth">
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
          {status && <span className="settings-status">{status}</span>}
        </div>
      </form>
    </section>
  );
}
