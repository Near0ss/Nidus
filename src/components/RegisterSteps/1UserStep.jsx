import { useState } from "react";

function UserStep({ data, updateField, nextStep, setShowLogin }) {
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordInfo, setShowPasswordInfo] = useState(false);

  const password = data.password || "";

  const score =
    Number(password.length >= 6) +
    Number(password.length >= 8) +
    Number(/[A-Z]/.test(password) && /[a-z]/.test(password)) +
    Number(/[^A-Za-z0-9]/.test(password));

  const passwordValid = score >= 3;

  const passwordMatch =
    confirmPassword.length > 0 &&
    password === confirmPassword;

  function handleNext() {
    if (!formValid) return;
    nextStep();
  }

  const [closing, setClosing] = useState(false);

  const handleBlur = () => {
    setClosing(true);

    setTimeout(() => {
      setShowPasswordInfo(false);
      setClosing(false);
    }, 180);
  };

  const emailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);

  const usernameValid =
    data.username?.trim().length >= 3;

  const formValid =
    emailValid &&
    usernameValid &&
    passwordValid &&
    passwordMatch;

  return (
    <div className="step-card">
      <div className="step-icon">⋆</div>

      <h1>Crie sua conta</h1>

      <p>
        Comece criando sua conta profissional
        na plataforma Nidus.
      </p>

      <div className="step-fields">

        <input
          className={emailValid ? "valid-input" : ""}
          type="email"
          placeholder="Email"
          value={data.email}
          onChange={(e) =>
            updateField("email", e.target.value)
          }
        />

        <input
          className={usernameValid ? "valid-input" : ""}
          type="text"
          placeholder="@username"
          value={data.username}
          onChange={(e) =>
            updateField("username", e.target.value)
          }
        />

        {/* SENHA */}

        <div className="password-wrapper">

          <input
            className={passwordValid ? "valid-input" : ""}
            type="password"
            placeholder="Senha"
            value={password}
            onFocus={() => setShowPasswordInfo(true)}
            onBlur={handleBlur}
            onChange={(e) =>
              updateField("password", e.target.value)
            }
          />

          {showPasswordInfo && (
            <div
              className={`password-popup ${closing ? "hide" : ""
                }`}
            >

              <h4>Força da senha</h4>



              <div className="password-strength">
                <div
                  className={`password-strength-fill ${score === 4 ? "complete" : ""
                    }`}
                  style={{
                    width: `${(score / 4) * 100}%`
                  }}
                />
              </div>

              <p>É melhor ter:</p>

              <ul className="password-rules">

                <li
                  className={
                    /[A-Z]/.test(password) &&
                      /[a-z]/.test(password)
                      ? "done"
                      : ""
                  }
                >
                  Letras maiúsculas e minúsculas
                </li>

                <li
                  className={
                    /[^A-Za-z0-9]/.test(password)
                      ? "done"
                      : ""
                  }
                >
                  Símbolos (!@#$)
                </li>

                <li
                  className={
                    password.length >= 8
                      ? "done"
                      : ""
                  }
                >
                  Senha maior que 8 caracteres
                </li>

              </ul>

            </div>
          )}

        </div>

        {/* CONFIRMAR SENHA */}

        <input
          className={passwordMatch ? "valid-input" : ""}
          type="password"
          placeholder="Confirmar senha"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(e.target.value)
          }
        />

        {confirmPassword.length > 0 &&
          !passwordMatch && (
            <span className="password-error">
              As senhas não coincidem.
            </span>
          )}

        {passwordMatch && (
          <span className="password-success">
            ✓ Senhas coincidem
          </span>
        )}

      </div>

      <button
        className="already-account-register"
        onClick={() => setShowLogin(true)}
      >
        Já tem uma conta?
      </button>

      <button
        className={`step-next-btn ${formValid ? "active" : ""
          }`}
        onClick={handleNext}
        disabled={!formValid}
      >
        <span>Próximo</span>
      </button>

    </div>
  );
}

export default UserStep;