import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../css/Register.css";

import logo from "../assets/logo.png";
import { apiFetch } from "../lib/api";

function RegisterUser() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    country: "",
    state: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const navigate = useNavigate();

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await apiFetch("/api/register-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      setSuccess("Conta criada com sucesso!");
      localStorage.setItem("nidus_user", JSON.stringify(data.user));
      setTimeout(() => navigate("/perfil"), 800);
    } catch (err) {
      setError(err.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="register-page">
      <div className="register-window register-user-window">
        <section className="register-left register-user-left">
          <div className="register-logo-area">
            <img src={logo} alt="Nidus" className="register-logo" />
          </div>

          <div className="register-content">
            <div className="register-step-header">
              <h1>Cadastro de usuário</h1>
              <p>Registre-se rapidamente para explorar perfis e contratar freelancers.</p>
            </div>

            <form className="register-form" onSubmit={handleSubmit}>
              <label>
                Nome
                <input
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  type="text"
                  placeholder="Seu nome completo"
                />
              </label>

              <label>
                Email
                <input
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  type="email"
                  placeholder="seu@email.com"
                />
              </label>

              <label>
                Senha
                <input
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  type="password"
                  placeholder="Crie uma senha segura"
                />
              </label>

              <label>
                País
                <input
                  value={form.country}
                  onChange={(e) => updateField("country", e.target.value)}
                  type="text"
                  placeholder="Brasil"
                />
              </label>

              <label>
                Estado
                <input
                  value={form.state}
                  onChange={(e) => updateField("state", e.target.value)}
                  type="text"
                  placeholder="São Paulo"
                />
              </label>

              {error && <div className="register-error">{error}</div>}
              {success && <div className="register-success">{success}</div>}

              <button className="register-submit" type="submit" disabled={loading}>
                {loading ? "Registrando..." : "Criar conta"}
              </button>
            </form>
          </div>
        </section>

        <section className="register-right register-user-right">
          <div className="register-preview-card">
            <h2>Bem-vindo ao Nidus.</h2>
            <p>Explore talentos, salve perfis e contrate profissionais com confiança.</p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default RegisterUser;
