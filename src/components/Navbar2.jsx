import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Bell, Menu, MessageCircle, X } from 'lucide-react';
import '../css/Navbar2.css';
import '../css/nidus.css';
import logo from '../assets/logotext.png';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './ui/UserAvatar';
import IconButton from './ui/IconButton';

export default function Navbar2() {
  const { user, logout, refresh } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const isFreelancer = user?.type === 'freelancer';

  useEffect(() => {
    setQuery(params.get('q') || '');
  }, [params]);

  useEffect(() => {
    setProfileOpen(false);
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!user) return undefined;
    refresh();
    return undefined;
  }, [location.pathname]);

  useEffect(() => {
    if (!profileOpen) return undefined;
    function onPointerDown(event) {
      if (!profileRef.current?.contains(event.target)) setProfileOpen(false);
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
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  }

  function handleSearch(event) {
    event.preventDefault();
    const q = query.trim();
    navigate(q ? `/home?q=${encodeURIComponent(q)}` : '/home');
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
          <Link to="/home" data-label="Início" className={`navbar-nav-link ${isActive('/home') ? 'navbar-nav-link-active' : ''}`}>Início</Link>
          <Link to="/servicos" data-label="Serviços" className={`navbar-nav-link ${isActive('/servicos') ? 'navbar-nav-link-active' : ''}`}>Serviços</Link>
          <Link to="/freelancers" data-label="Freelancers" className={`navbar-nav-link ${isActive('/freelancers') ? 'navbar-nav-link-active' : ''}`}>Freelancers</Link>
          <Link to="/social" data-label="Social" className={`navbar-nav-link ${isActive('/social') ? 'navbar-nav-link-active' : ''}`}>Social</Link>
        </div>

        <form className="navbar-navbar2-center" onSubmit={handleSearch} role="search">
          <label className="sr-only" htmlFor="nidus-search">Pesquisar serviços, freelancers e publicações</label>
          <input
            id="nidus-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar serviços, pessoas, posts…"
            className="navbar-navbar2-search"
          />
        </form>

        <div className="navbar-navbar2-right">
          <button type="button" className="navbar-menu-toggle" aria-expanded={menuOpen} aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} onClick={() => setMenuOpen((v) => !v)}>
            {menuOpen ? <X size={20} strokeWidth={1.75} /> : <Menu size={20} strokeWidth={1.75} />}
          </button>

          {user ? (
            <>
              <IconButton
                to="/dashboard/messages"
                label="Mensagens"
                active={isActive('/dashboard/messages') || isActive('/mensagens')}
                badge={user.unreadMessages}
                icon={<MessageCircle size={20} strokeWidth={1.75} />}
              />
              <IconButton
                to="/notificacoes"
                label="Notificações"
                active={isActive('/notificacoes')}
                badge={user.unreadNotifications}
                icon={<Bell size={20} strokeWidth={1.75} />}
              />
              <div ref={profileRef} className={`navbar-profile ${profileOpen ? 'is-open' : ''}`}>
                <button
                  type="button"
                  className="navbar-profile-trigger"
                  title="Minha conta"
                  aria-label="Minha conta"
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                  onClick={() => setProfileOpen((v) => !v)}
                >
                  <UserAvatar
                    src={user?.profilePhoto}
                    name={user?.businessName || user?.name || user?.username}
                    size={40}
                  />
                </button>
                {profileOpen ? (
                  <div className="navbar-profile-menu" role="menu">
                    <div className="navbar-profile-header">
                      <h3>{user?.businessName || user?.username || user?.name}</h3>
                      <p>@{user?.username}</p>
                    </div>
                    <Link to={user.username ? `/u/${user.username}` : '/dashboard'} onClick={() => setProfileOpen(false)}>Meu perfil</Link>
                    <Link to="/dashboard" onClick={() => setProfileOpen(false)}>{isFreelancer ? 'Painel' : 'Minha conta'}</Link>
                    {isFreelancer ? (
                      <>
                        <Link to="/dashboard/services" onClick={() => setProfileOpen(false)}>Meus serviços</Link>
                        <Link to="/dashboard/jobs" onClick={() => setProfileOpen(false)}>Trabalhos</Link>
                      </>
                    ) : (
                      <>
                        <Link to="/dashboard/jobs" onClick={() => setProfileOpen(false)}>Minhas contratações</Link>
                        <Link to="/salvos" onClick={() => setProfileOpen(false)}>Salvos</Link>
                      </>
                    )}
                    <Link to="/dashboard/settings" onClick={() => setProfileOpen(false)}>Configurações</Link>
                    <div className="navbar-profile-divider" />
                    <button type="button" className="navbar-profile-logout" onClick={handleLogout}>Sair</button>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <Link to="/authchoice" className="home-btn">Entrar</Link>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="navbar-mobile-panel">
          <Link to="/home" onClick={() => setMenuOpen(false)}>Início</Link>
          <Link to="/servicos" onClick={() => setMenuOpen(false)}>Serviços</Link>
          <Link to="/freelancers" onClick={() => setMenuOpen(false)}>Freelancers</Link>
          <Link to="/social" onClick={() => setMenuOpen(false)}>Social</Link>
          {user ? <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Painel</Link> : null}
        </div>
      )}
    </nav>
  );
}
