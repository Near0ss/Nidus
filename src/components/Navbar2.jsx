import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import '../css/Navbar2.css';
import logo from '../assets/logotext.png';
import { useAuth } from '../context/AuthContext';

export default function Navbar2() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    setQuery(params.get('q') || '');
  }, [params]);

  useEffect(() => {
    setProfileOpen(false);
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!profileOpen) return undefined;

    function onPointerDown(event) {
      if (!profileRef.current?.contains(event.target)) {
        setProfileOpen(false);
      }
    }

    function onKeyDown(event) {
      if (event.key === 'Escape') setProfileOpen(false);
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [profileOpen]);

  function isActive(path) {
    return location.pathname === path;
  }

  function handleSearch(event) {
    event.preventDefault();
    const q = query.trim();
    const next = new URLSearchParams();
    if (q) next.set('q', q);
    if (location.pathname === '/home' && params.get('view')) {
      next.set('view', params.get('view'));
    }
    const qs = next.toString();
    navigate(qs ? `/home?${qs}` : '/home');
    setMenuOpen(false);
  }

  async function handleLogout() {
    setProfileOpen(false);
    await logout();
    navigate('/landing');
  }

  return (
    <nav className="navbar-navbar2" aria-label="Navegação do app">
      <div className="navbar-navbar2-container">
        <div className="navbar-navbar2-left">
          <Link to={user ? '/home' : '/landing'}>
            <img src={logo} alt="Nidus" className="navbar-navbar2-logo" />
          </Link>

          <Link to="/perfil" data-label="Perfil" className={`navbar-nav-link ${isActive('/perfil') ? 'navbar-nav-link-active' : ''}`}>
            Perfil
          </Link>
          <Link to="/home" data-label="Projetos" className={`navbar-nav-link ${isActive('/home') && !params.get('view') ? 'navbar-nav-link-active' : ''}`}>
            Projetos
          </Link>
          <Link
            to="/home?view=freelancers"
            data-label="Freelancers"
            className={`navbar-nav-link ${params.get('view') === 'freelancers' ? 'navbar-nav-link-active' : ''}`}
          >
            Freelancers
          </Link>
          {user?.type === 'normal' && (
            <Link to="/salvos" data-label="Salvos" className={`navbar-nav-link ${isActive('/salvos') ? 'navbar-nav-link-active' : ''}`}>
              Salvos
            </Link>
          )}
        </div>

        <form className="navbar-navbar2-center" onSubmit={handleSearch} role="search">
          <label className="sr-only" htmlFor="nidus-search">
            Pesquisar projetos e usuários
          </label>
          <input
            id="nidus-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar projetos, usuários..."
            className="navbar-navbar2-search"
          />
        </form>

        <div className="navbar-navbar2-right">
          <button
            type="button"
            className="navbar-menu-toggle"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? 'Fechar' : 'Menu'}
          </button>

          {user ? (
            <div ref={profileRef} className={`navbar-profile ${profileOpen ? 'is-open' : ''}`}>
              <button
                type="button"
                className="navbar-profile-trigger"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                onClick={() => setProfileOpen((v) => !v)}
              >
                {user?.profilePhoto ? (
                  <img src={user.profilePhoto} alt="" className="navbar-profile-avatar" />
                ) : (
                  <span className="navbar-profile-fallback">
                    {(user?.name || user?.username || "N").charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="sr-only">Menu da conta</span>
              </button>

              {profileOpen ? (
                <div className="navbar-profile-menu" role="menu">
                  <div className="navbar-profile-header">
                    {user?.profilePhoto ? (
                      <img src={user.profilePhoto} alt="" className="navbar-profile-avatar-large" />
                    ) : (
                      <span className="navbar-profile-fallback navbar-profile-avatar-large">
                        {(user?.name || user?.username || "N").charAt(0).toUpperCase()}
                      </span>
                    )}
                    <h3>{user?.username || user?.name || 'Usuário'}</h3>
                    <p>{user?.email || ''}</p>
                  </div>

                  <button
                    type="button"
                    className="navbar-profile-upgrade"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/perfil');
                    }}
                  >
                    Meu Perfil
                  </button>
                  <Link to="/home" onClick={() => setProfileOpen(false)}>Projetos</Link>
                  {user?.type === 'normal' && (
                    <Link to="/salvos" onClick={() => setProfileOpen(false)}>Salvos</Link>
                  )}
                  <button type="button" className="navbar-profile-logout" onClick={handleLogout}>
                    Sair
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link to="/authchoice" className="navbar-nav-link navbar-nav-link-active">
              Entrar
            </Link>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="navbar-mobile-panel">
          <Link to="/perfil" onClick={() => setMenuOpen(false)}>Perfil</Link>
          <Link to="/home" onClick={() => setMenuOpen(false)}>Projetos</Link>
          <Link to="/home?view=freelancers" onClick={() => setMenuOpen(false)}>Freelancers</Link>
          {user?.type === 'normal' && (
            <Link to="/salvos" onClick={() => setMenuOpen(false)}>Salvos</Link>
          )}
        </div>
      )}
    </nav>
  );
}
