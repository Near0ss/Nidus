import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';
import logoText from '../assets/logotext.png';
import Background from '../assets/Login.webp';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import LoginGoogle from './LoginGoogle';

function Login({ onClose }) {
  const [closing, setClosing] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forgotHint, setForgotHint] = useState(false);
  const dialogRef = useRef(null);
  const firstFieldRef = useRef(null);

  const navigate = useNavigate();
  const { login } = useAuth();
  const googleDisponivel = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  useEffect(() => {
    firstFieldRef.current?.focus();
    function onKey(event) {
      if (event.key === 'Escape') handleClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  function handleClose() {
    setClosing(true);
    setTimeout(() => onClose(), 300);
  }

  async function handleGoogle({ accessToken }) {
    setLoading(true);
    setError(null);

    try {
      let data;
      try {
        data = await apiFetch('/api/login/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken }),
        });
      } catch (firstError) {
        await new Promise((resolve) => setTimeout(resolve, 700));
        try {
          data = await apiFetch('/api/login/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken }),
          });
        } catch {
          throw firstError;
        }
      }

      login(data.user, data.token);
      handleClose();
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Não foi possível entrar com Google');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailOrUsername,
          username: emailOrUsername,
          password,
        }),
      });

      login(data.user, data.token);
      handleClose();
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`login-modal ${closing ? 'closing' : ''}`}
      onClick={handleClose}
    >
      <div
        className="login-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="login-left">
          {Background ? (
            <img src={Background} alt="" className="login-side-image" />
          ) : (
            <div className="login-side-placeholder" />
          )}
        </div>

        <div className="login-right">
          <div className="login-topbar">
            <span className="login-topbar-spacer" aria-hidden="true" />
            <button type="button" className="login-close" onClick={handleClose} aria-label="Fechar">
              ✕
            </button>
          </div>

          <form className="login-content" onSubmit={handleSubmit}>
            <div className="login-brand">
              <img src={logoText} alt="Nidus" className="login-brand__wordmark" />
            </div>
            <h1 id="login-title">Entrar</h1>

            <label className="login-label" htmlFor="login-email">
              Nome de usuário ou e-mail
            </label>
            <input
              id="login-email"
              ref={firstFieldRef}
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              type="text"
              autoComplete="username"
              className="login-input"
              required
            />

            <label className="login-label" htmlFor="login-password">
              Senha
            </label>
            <input
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              className="login-input"
              required
            />

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="button"
              className="login-forgot"
              onClick={() => setForgotHint(true)}
            >
              Esqueceu sua senha?
            </button>
            {forgotHint && (
              <p className="login-hint" role="status">
                Recuperação de senha ainda não está disponível. Fale com o suporte do Nidus.
              </p>
            )}

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            <div className="login-divider" role="separator">
              <span>ou</span>
            </div>

            {googleDisponivel ? (
              <LoginGoogle
                disabled={loading}
                onLogin={handleGoogle}
                onError={(message) => {
                  setLoading(false);
                  setError(message);
                }}
              />
            ) : (
              <p className="login-hint">
                Login Google indisponível. Configure `VITE_GOOGLE_CLIENT_ID` no `.env`.
              </p>
            )}
          </form>

          <div className="login-bottom">
            <span>© 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
