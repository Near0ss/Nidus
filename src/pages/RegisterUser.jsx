import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import "../css/Register.css";

import Login from "../components/Login";
import logoText from "../assets/logotext.png";
import Background from "../assets/LoginNidus.webp";
import FinalPreview from "../assets/Login.webp";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const COUNTRIES = [
  "Brasil",
  "Argentina",
  "Chile",
  "Uruguai",
  "Paraguai",
  "Bolívia",
  "Peru",
  "Colômbia",
  "Equador",
  "México",
  "Estados Unidos",
  "Canadá",
  "Portugal",
  "Espanha",
  "França",
  "Alemanha",
  "Itália",
  "Reino Unido",
  "Japão",
  "China",
  "Coreia do Sul",
  "Austrália",
];

function RegisterUser() {
  const totalSteps = 2;
  const [step, setStep] = useState(1);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [checking, setChecking] = useState(false);
  const [emailTaken, setEmailTaken] = useState("");
  const [usernameTaken, setUsernameTaken] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordInfo, setShowPasswordInfo] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showCountries, setShowCountries] = useState(false);
  const countryTimeout = useRef(null);

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    country: "",
    state: "",
  });

  const navigate = useNavigate();
  const { login } = useAuth();

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const password = form.password || "";
  const score =
    Number(password.length >= 6) +
    Number(password.length >= 8) +
    Number(/[A-Z]/.test(password) && /[a-z]/.test(password)) +
    Number(/[^A-Za-z0-9]/.test(password));
  const passwordValid = score >= 3;
  const passwordMatch = confirmPassword.length > 0 && password === confirmPassword;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const usernameValid = /^[a-zA-Z0-9._]{3,24}$/.test(form.username.trim());
  const nameValid = form.name.trim().length >= 2;
  const step1Valid = nameValid && usernameValid && emailValid && passwordValid && passwordMatch && !emailTaken && !usernameTaken;
  const countryValid = form.country.length > 0;
  const stateValid = form.state.trim().length >= 2;
  const step2Valid = countryValid && stateValid;

  function handleBlur() {
    setClosing(true);
    setTimeout(() => {
      setShowPasswordInfo(false);
      setClosing(false);
    }, 180);
  }

  function openCountries() {
    clearTimeout(countryTimeout.current);
    setShowCountries(true);
  }

  function closeCountries() {
    countryTimeout.current = setTimeout(() => {
      setShowCountries(false);
    }, 180);
  }

  async function nextStep() {
    if (!step1Valid || checking) return;
    setChecking(true);
    setError(null);

    try {
      const result = await apiFetch(
        `/api/register/check?email=${encodeURIComponent(form.email.trim())}&username=${encodeURIComponent(form.username.trim())}`,
      );
      if (result.emailTaken) {
        setEmailTaken("Este e-mail já está cadastrado.");
        return;
      }
      if (result.usernameTaken) {
        setUsernameTaken("Este username já está em uso.");
        return;
      }
      setEmailTaken("");
      setUsernameTaken("");
      setStep(2);
    } catch (err) {
      setError(err.message || "Não foi possível verificar o e-mail.");
    } finally {
      setChecking(false);
    }
  }

  function prevStep() {
    setStep(1);
  }

  async function handleSubmit() {
    if (!step2Valid) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await apiFetch("/api/register-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      setSuccess("Conta criada com sucesso!");
      login(data.user, data.token);
      navigate("/home");
    } catch (err) {
      setError(err.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="register-page">
      <div className="register-window">
        <section className="register-left">
          <div className="register-logo-area">
            <button
              type="button"
              className="register-back"
              onClick={() => (step === 1 ? navigate("/authchoice") : prevStep())}
            >
              <ArrowLeft size={18} strokeWidth={2.2} aria-hidden="true" />
              Voltar
            </button>
          </div>

          <div className="register-content">
            {step === 1 ? (
              <div className="step-card">
                <div className="step-brand">
                  <img src={logoText} alt="Nidus" className="step-brand__wordmark" />
                </div>

                <h1>Criar conta de cliente</h1>
                <p>Encontre profissionais e acompanhe seus projetos.</p>

                <div className="step-fields">
                  <input
                    className={nameValid ? "valid-input" : ""}
                    type="text"
                    placeholder="Nome completo"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    autoComplete="name"
                  />

                  <input
                    className={usernameValid && !usernameTaken ? "valid-input" : ""}
                    type="text"
                    placeholder="Username"
                    value={form.username}
                    onChange={(e) => {
                      updateField("username", e.target.value.replace(/\s/g, ""));
                      setUsernameTaken("");
                    }}
                    onBlur={async () => {
                      if (!usernameValid) return;
                      try {
                        const result = await apiFetch(
                          `/api/register/check?username=${encodeURIComponent(form.username.trim())}`,
                        );
                        setUsernameTaken(result.usernameTaken ? "Este username já está em uso." : "");
                      } catch {
                        /* ignore preview check */
                      }
                    }}
                    autoComplete="username"
                  />
                  {usernameTaken ? <span className="field-error">{usernameTaken}</span> : null}

                  <input
                    className={emailValid && !emailTaken ? "valid-input" : ""}
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => {
                      updateField("email", e.target.value.trim());
                      setEmailTaken("");
                    }}
                    onBlur={async () => {
                      if (!emailValid) return;
                      try {
                        const result = await apiFetch(
                          `/api/register/check?email=${encodeURIComponent(form.email.trim())}`,
                        );
                        setEmailTaken(result.emailTaken ? "Este e-mail já está cadastrado." : "");
                      } catch {
                        /* ignore preview check */
                      }
                    }}
                    autoComplete="email"
                  />
                  {emailTaken ? <span className="field-error">{emailTaken}</span> : null}

                  <div className="password-wrapper">
                    <input
                      className={passwordValid ? "valid-input" : ""}
                      type="password"
                      placeholder="Senha"
                      value={password}
                      onFocus={() => setShowPasswordInfo(true)}
                      onBlur={handleBlur}
                      onChange={(e) => updateField("password", e.target.value)}
                      autoComplete="new-password"
                    />

                    {showPasswordInfo && (
                      <div className={`password-popup ${closing ? "hide" : ""}`}>
                        <h4>Força da senha</h4>
                        <div className="password-strength">
                          <div
                            className={`password-strength-fill ${score === 4 ? "complete" : ""}`}
                            style={{ width: `${(score / 4) * 100}%` }}
                          />
                        </div>
                        <p>É melhor ter:</p>
                        <ul className="password-rules">
                          <li className={/[A-Z]/.test(password) && /[a-z]/.test(password) ? "done" : ""}>
                            Letras maiúsculas e minúsculas
                          </li>
                          <li className={/[^A-Za-z0-9]/.test(password) ? "done" : ""}>
                            Símbolos (!@#$)
                          </li>
                          <li className={password.length >= 8 ? "done" : ""}>
                            Senha maior que 8 caracteres
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  <input
                    className={passwordMatch ? "valid-input" : ""}
                    type="password"
                    placeholder="Confirmar senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />

                  {confirmPassword.length > 0 && !passwordMatch && (
                    <span className="field-error">As senhas não coincidem.</span>
                  )}
                  {passwordMatch && <span className="field-success">Senhas coincidem</span>}
                  {error && step === 1 ? <span className="field-error">{error}</span> : null}
                </div>

                <button
                  type="button"
                  className="already-account-register"
                  onClick={() => setShowLogin(true)}
                >
                  Já tem uma conta?
                </button>

                <button
                  type="button"
                  className={`step-next-btn ${step1Valid && !checking ? "active" : ""}`}
                  onClick={nextStep}
                  disabled={!step1Valid || checking}
                >
                  <span>{checking ? "Verificando..." : "Próximo"}</span>
                </button>
              </div>
            ) : (
              <div className="step-card">
                <h1>Onde você está</h1>
                <p>Usamos isso para mostrar profissionais perto de você.</p>

                <div className="step-fields">
                  <div className="location-row">
                    <div
                      className="country-selector"
                      onMouseEnter={openCountries}
                      onMouseLeave={closeCountries}
                    >
                      <button
                        type="button"
                        className={`country-button ${countryValid ? "valid-input" : ""}`}
                      >
                        {form.country || "País"}
                      </button>

                      {showCountries && (
                        <div
                          className="country-popup"
                          onMouseEnter={openCountries}
                          onMouseLeave={closeCountries}
                        >
                          {COUNTRIES.map((country) => (
                            <button
                              key={country}
                              type="button"
                              className="country-option"
                              onClick={() => {
                                updateField("country", country);
                                setShowCountries(false);
                              }}
                            >
                              {country}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <input
                      className={stateValid ? "valid-input" : ""}
                      type="text"
                      placeholder="Estado"
                      value={form.state}
                      onChange={(e) => updateField("state", e.target.value)}
                      autoComplete="address-level1"
                    />
                  </div>
                </div>

                {error && <span className="field-error">{error}</span>}
                {success && <span className="field-success">{success}</span>}

                <button type="button" className="already-account-register" onClick={prevStep}>
                  Voltar
                </button>

                <button
                  type="button"
                  className={`step-next-btn ${step2Valid && !loading ? "active" : ""}`}
                  disabled={!step2Valid || loading}
                  onClick={handleSubmit}
                >
                  <span>{loading ? "Registrando..." : "Criar conta"}</span>
                </button>
              </div>
            )}
          </div>

          <div className="register-footer">
            <div className="register-progress-info">
              <p>
                Etapa {step} de {totalSteps}
              </p>
            </div>

            <div className="register-steps">
              {[1, 2].map((item) => (
                <span key={item} className={step >= item ? "active" : ""} />
              ))}
            </div>
          </div>
        </section>

        <section className="register-right">
          <div className="register-preview-card">
            <h2>{step === 1 ? "Bem-vindo ao Nidus." : "Encontre o ninho certo."}</h2>
            <p>
              {step === 1
                ? "Explore talentos, salve perfis e contrate profissionais com confiança."
                : "Mostre onde você está para descobrir freelancers perto de você."}
            </p>

            <div className="register-preview-content">
              <div className="register-image-container">
                <img
                  src={step === 1 ? Background : FinalPreview}
                  alt=""
                  className="register-preview-image"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {showLogin && <Login onClose={() => setShowLogin(false)} intendedRole="CLIENT" />}
    </main>
  );
}

export default RegisterUser;
