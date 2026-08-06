import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";

export default function Settings({ user, updateUser }) {
  const [form, setForm] = useState({
    name: "",
    businessName: "",
    username: "",
    email: "",
    bio: "",
    country: "",
    state: "",
  });
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!user) return;

    setForm({
      name: user.name || "",
      businessName: user.businessName || "",
      username: user.username || "",
      email: user.email || "",
      bio: user.bio || "",
      country: user.country || "",
      state: user.state || "",
    });
  }, [user]);

  async function handleSave() {
    setStatus("Salvando...");
    try {
      const payload = user?.type === "freelancer"
        ? {
            businessName: form.businessName,
            username: form.username,
            bio: form.bio,
            country: form.country,
            state: form.state,
          }
        : {
            name: form.name,
            country: form.country,
            state: form.state,
          };

      const data = await apiFetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      updateUser(data.user);
      setStatus("Perfil atualizado com sucesso.");
    } catch (err) {
      setStatus(err.message || "Erro ao salvar");
    }
  }

  if (!user) {
    return null;
  }

  return (
    <section className="perfil-section perfil-settings">
      <div className="section-heading">
        <div>
          <h2>Configurações</h2>
          <p>Edite seus dados e mantenha seu perfil atualizado.</p>
        </div>
      </div>

      <div className="settings-grid">
        {user.type === "freelancer" ? (
          <>
            <label>
              Nome da empresa
              <input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
            </label>
            <label>
              Usuário
              <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </label>
          </>
        ) : (
          <label>
            Nome
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
        )}

        <label>
          Email
          <input value={form.email} disabled />
        </label>
        <label>
          País
          <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
        </label>
        <label>
          Estado
          <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
        </label>
        {user.type === "freelancer" && (
          <label className="settings-fullwidth">
            Biografia
            <textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </label>
        )}
      </div>

      <div className="settings-actions">
        <button className="btn-primary" onClick={handleSave}>Salvar alterações</button>
        {status && <span className="settings-status">{status}</span>}
      </div>
    </section>
  );
}
