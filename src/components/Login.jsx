import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/Login.css';
import logoText from '../assets/logotext.png';
import Background from '../assets/Login.webp';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoginGoogle from './LoginGoogle';

function destinationFor(user) {
  return user?.type === 'freelancer' ? '/dashboard' : '/home';
}

function roleLabel(roleOrType) {
  if (roleOrType === 'FREELANCER' || roleOrType === 'freelancer') return 'freelancer';
  return 'cliente';
}

function Login({ onClose, intendedRole, asPage = false }) {
  const [closing, setClosing] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forgotHint, setForgotHint] = useState(false);
  const [googlePending, setGooglePending] = useState(null);
  const dialogRef = useRef(null);
  const firstFieldRef = useRef(null);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const googleDisponivel = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const isFreelancer = intendedRole === 'FREELANCER';
  const isClient = intendedRole === 'CLIENT';

  useEffect(() => {
    firstFieldRef.current?.focus();
    function onKey(event) {
      if (event.key === 'Escape' && onClose) handleClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  function handleClose() {
    if (!onClose) return;
    setClosing(true);
    setTimeout(() => onClose(), 300);
  }

  function finish(user, extra = {}) {
    login(user);
    if (extra.roleMismatch) {
      toast(`Esta conta está cadastrada como ${roleLabel(user.type)}.`);
    }
    handleClose();
    navigate(destinationFor(user));
  }

  async function handleGoogle({ accessToken }) {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/api/login/google', {
        method: 'POST',
        body: JSON.stringify({ accessToken }),
      });
      if (data.needsRole) {
        setGooglePending({ accessToken, profile: data.profile });
        return;
      }
      finish(data.user, data);
    } catch (err) {
      setError(err.message || 'Não foi possível entrar com Google');
    } finally {
      setLoading(false);
    }
  }

  async function completeGoogle(role) {
    if (!googlePending) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/api/login/google/complete', {
        method: 'POST',
        body: JSON.stringify({ accessToken: googlePending.accessToken, role }),
      });
      finish(data.user);
    } catch (err) {
      setError(err.message || 'Não foi possível concluir o cadastro Google');
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
        body: JSON.stringify({
          email: emailOrUsername,
          username: emailOrUsername,
          password,
          intendedRole,
        }),
      });
      finish(data.user, data);
    } catch (err) {
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }

  const card = (
    <div
      className={`login-card${asPage ? ' login-card-page' : ''}`}
      role="dialog"
      aria-modal={!asPage}
      aria-labelledby="login-title"
      ref={dialogRef}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="login-left">
        {Background ? <img src={Background} alt="" className="login-side-image" /> : <div className="login-side-placeholder" />}
      </div>
      <div className="login-right">
        <div className="login-topbar">
          {asPage ? <Link to="/authchoice" className="login-back">Voltar</Link> : <span className="login-topbar-spacer" aria-hidden="true" />}
          {onClose ? (
            <button type="button" className="login-close" onClick={handleClose} aria-label="Fechar">✕</button>
          ) : <span />}
        </div>

        {googlePending ? (
          <div className="login-content">
            <div className="login-brand">
              <img src={logoText} alt="Nidus" className="login-brand__wordmark" />
            </div>
            <h1 id="login-title">Como você pretende usar o Nidus?</h1>
            <p className="login-lead">Escolha uma vez. Depois a conta permanece neste papel.</p>
            {error ? <p className="login-error" role="alert">{error}</p> : null}
            <button type="button" className="login-button" disabled={loading} onClick={() => completeGoogle('CLIENT')}>
              Contratar profissionais
            </button>
            <button type="button" className="login-button ghost" disabled={loading} onClick={() => completeGoogle('FREELANCER')}>
              Trabalhar como freelancer
            </button>
          </div>
        ) : (
          <form className="login-content" onSubmit={handleSubmit}>
            <div className="login-brand">
              <img src={logoText} alt="Nidus" className="login-brand__wordmark" />
            </div>
            <h1 id="login-title">{isFreelancer ? 'Entrar como freelancer' : isClient ? 'Entrar como cliente' : 'Entrar'}</h1>
            <p className="login-lead">
              {isFreelancer
                ? 'Divulgue seu trabalho e gerencie seus projetos no Nidus.'
                : 'Encontre profissionais e acompanhe seus projetos.'}
            </p>

            <label className="login-label" htmlFor="login-email">E-mail</label>
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

            <label className="login-label" htmlFor="login-password">Senha</label>
            <input
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              className="login-input"
              required
            />

            {error ? <p className="login-error" role="alert">{error}</p> : null}

            <button type="button" className="login-forgot" onClick={() => setForgotHint(true)}>
              Esqueceu sua senha?
            </button>
            {forgotHint ? (
              <p className="login-hint" role="status">
                Recuperação de senha ainda não está disponível. Fale com o suporte do Nidus.
              </p>
            ) : null}

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            <div className="login-divider" role="separator"><span>ou</span></div>

            {googleDisponivel ? (
              <LoginGoogle
                disabled={loading}
                label="Continuar com Google"
                onLogin={handleGoogle}
                onError={(message) => {
                  setLoading(false);
                  setError(message);
                }}
              />
            ) : (
              <p className="login-hint">Login Google indisponível. Configure `VITE_GOOGLE_CLIENT_ID` no `.env`.</p>
            )}

            <div className="login-alt">
              {isFreelancer ? (
                <>
                  <Link to="/register">Criar conta de freelancer</Link>
                  <Link to="/login/cliente" className="login-switch">Sou cliente</Link>
                </>
              ) : (
                <>
                  <Link to="/registeru">Criar conta de cliente</Link>
                  <Link to="/login/freelancer" className="login-switch">Sou freelancer</Link>
                </>
              )}
            </div>
          </form>
        )}

        <div className="login-bottom"><span>© 2026</span></div>
      </div>
    </div>
  );

  if (asPage) {
    return <div className="login-page-shell">{card}</div>;
  }

  return (
    <div className={`login-modal ${closing ? 'closing' : ''}`} onClick={handleClose}>
      {card}
    </div>
  );
}

export default Login;
