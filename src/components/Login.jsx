import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Login.css";
import logoText from "../assets/logotext.png";
import Background from "../assets/Login.png";

function Login({ onClose, sideImage }) {
  const [closing, setClosing] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  function handleClose() {
    setClosing(true);

    // tempo igual ao da animação (300ms)
    setTimeout(() => {
      onClose();
    }, 300);
  }

  return (
    <div className={`login-modal ${closing ? "closing" : ""}`} onClick={handleClose}>
      <div className="login-card" onClick={(e) => e.stopPropagation()}>
        <div className="login-left">
          {Background ? (
            <img src={Background} alt="" className="login-side-image" />
          ) : (
            <div className="login-side-placeholder" />
          )}
        </div>

        <div className="login-right">
          <div className="login-topbar">
            <img src={logoText} alt="Nidus" className="login-logo" />

            <button
              className="login-close"
              onClick={handleClose}
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>

          <div className="login-content">
            <h1>Entrar</h1>

            <input value={emailOrUsername} onChange={(e) => setEmailOrUsername(e.target.value)} type="text" placeholder="Nome ou Email" className="login-input" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Senha" className="login-input" />

            <div style={{ height: 8 }} />
            {error && <div style={{ color: "#c33", marginBottom: 8 }}>{error}</div>}

            <button className="login-forgot">Esqueceu sua senha?</button>
            <button className="login-button" onClick={async () => {
              setLoading(true);
              setError(null);

              try {
                const res = await fetch('http://localhost:5000/api/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: emailOrUsername, username: emailOrUsername, password })
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Erro ao logar');

                // save user in localStorage
                localStorage.setItem('nidus_user', JSON.stringify(data.user));

                // close modal then navigate
                handleClose();
                navigate('/home');
              } catch (err) {
                setError(err.message || 'Erro desconhecido');
              } finally {
                setLoading(false);
              }
            }}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>

          <div className="login-bottom">
            <span>© 2026 Nidus Inc.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;