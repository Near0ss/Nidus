import { useState } from "react";

export default function Settings({ user, updateUser }) {
  const [form, setForm] = useState({
    businessName: user?.businessName || "",
    username: user?.username || "",
    email: user?.email || "",
    bio: user?.bio || "",
    country: user?.country || "",
    state: user?.state || "",
  });
  const [status, setStatus] = useState(null);

  async function handleSave() {
    setStatus("Salvando...");
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Erro ao salvar");
      updateUser(form);
      setStatus("Perfil atualizado com sucesso.");
    } catch (err) {
      setStatus(err.message);
    }
  }

  return (
    <section className="perfil-section perfil-settings">
      <div className="section-heading">
        <div>
          <h2>Configurações</h2>
          <p>Edite seus dados profissionais e mantenha seu perfil atualizado.</p>
        </div>
      </div>

      <div className="settings-grid">
        <label>
          Nome da empresa
          <input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
        </label>
        <label>
          Usuário
          <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        </label>
        <label>
          Email
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label>
          País
          <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
        </label>
        <label>
          Estado
          <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
        </label>
        <label className="settings-fullwidth">
          Biografia
          <textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </label>
      </div>

      <div className="settings-actions">
        <button className="btn-primary" onClick={handleSave}>Salvar alterações</button>
        {status && <span className="settings-status">{status}</span>}
      </div>
    </section>
  );
}
