import { useState } from "react";
import logoText from "../../assets/logotext.png";
import { apiFetch } from "../../lib/api";
import { isValidUsername, normalizeUsername } from "../../lib/username";

function UserStep({ data, updateField, nextStep, setShowLogin }) {
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordInfo, setShowPasswordInfo] = useState(false);
  const [closing, setClosing] = useState(false);
  const [checking, setChecking] = useState(false);
  const [emailTaken, setEmailTaken] = useState("");
  const [usernameTaken, setUsernameTaken] = useState("");
  const [checkError, setCheckError] = useState("");

  const password = data.password || "";

  const score =
    Number(password.length >= 6) +
    Number(password.length >= 8) +
    Number(/[A-Z]/.test(password) && /[a-z]/.test(password)) +
    Number(/[^A-Za-z0-9]/.test(password));

  const passwordValid = score >= 3;

  const passwordMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || "");
  const usernameValid = isValidUsername(data.username);

  const formValid =
    emailValid && usernameValid && passwordValid && passwordMatch && !emailTaken && !usernameTaken;

  async function checkAvailability({ email, username }) {
    const params = new URLSearchParams();
    if (email) params.set("email", email);
    if (username) params.set("username", username);

    const result = await apiFetch(`/api/register/check?${params.toString()}`);

    if (email) {
      setEmailTaken(result.emailTaken ? "Este e-mail já está cadastrado." : "");
    }
    if (username) {
      setUsernameTaken(result.usernameTaken ? "Este username já está em uso." : "");
    }

    return result;
  }

  async function handleNext() {
    if (!formValid || checking) return;

    setChecking(true);
    setCheckError("");

    try {
      const result = await checkAvailability({
        email: data.email,
        username: data.username,
      });

      if (result.emailTaken || result.usernameTaken) return;
      nextStep();
    } catch (err) {
      setCheckError(err.message || "Não foi possível verificar o cadastro.");
    } finally {
      setChecking(false);
    }
  }

  const handleBlur = () => {
    setClosing(true);
    setTimeout(() => {
      setShowPasswordInfo(false);
      setClosing(false);
    }, 180);
  };

  return (
    <div className="step-card">
      <div className="step-brand">
        <img src={logoText} alt="Nidus" className="step-brand__wordmark" />
      </div>

      <h1>Crie sua conta</h1>

      <p>Comece criando sua conta profissional na plataforma.</p>

      <div className="step-fields">
        <input
          className={emailValid && !emailTaken ? "valid-input" : ""}
          type="email"
          placeholder="Email"
          value={data.email}
          onChange={(e) => {
            updateField("email", e.target.value.trim());
            setEmailTaken("");
            setCheckError("");
          }}
          onBlur={() => {
            if (emailValid) checkAvailability({ email: data.email }).catch(() => {});
          }}
          autoComplete="email"
        />
        {emailTaken ? <span className="field-error">{emailTaken}</span> : null}

        <div className={`username-mask ${usernameValid && !usernameTaken ? "valid-input" : ""}`}>
          <span className="username-mask__at">@</span>
          <input
            type="text"
            placeholder="username"
            value={data.username}
            onChange={(e) => {
              updateField("username", normalizeUsername(e.target.value));
              setUsernameTaken("");
              setCheckError("");
            }}
            onBlur={() => {
              if (usernameValid) checkAvailability({ username: data.username }).catch(() => {});
            }}
            autoComplete="username"
            maxLength={20}
          />
        </div>
        {data.username && !usernameValid ? (
          <span className="field-hint">Use 3 a 20 caracteres: letras, números ou _</span>
        ) : null}
        {usernameTaken ? <span className="field-error">{usernameTaken}</span> : null}

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
        {checkError ? <span className="field-error">{checkError}</span> : null}
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
        className={`step-next-btn ${formValid && !checking ? "active" : ""}`}
        onClick={handleNext}
        disabled={!formValid || checking}
      >
        <span>{checking ? "Verificando..." : "Próximo"}</span>
      </button>
    </div>
  );
}

export default UserStep;
