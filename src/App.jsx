import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar2 from './components/Navbar2';
import AuthChoice from './pages/AuthChoice';
import Register from './pages/Register';
import RegisterUser from './pages/RegisterUser';
import Perfil from './pages/Perfil';
import Home from './pages/Home';
import LandingPage from './pages/LandingPage';
import PublicProfile from './pages/PublicProfile';
import Saved from './pages/Saved';

const PAGE_TITLES = {
  '/landing': 'Nidus',
  '/authchoice': 'Entrar · Nidus',
  '/register': 'Cadastro freelancer · Nidus',
  '/registeru': 'Cadastro · Nidus',
  '/home': 'Explorar · Nidus',
  '/perfil': 'Perfil · Nidus',
  '/salvos': 'Salvos · Nidus',
};

function PageTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname.startsWith('/u/')) {
      const name = decodeURIComponent(pathname.split('/')[2] || '');
      document.title = name ? `${name} · Nidus` : 'Perfil · Nidus';
      return;
    }
    document.title = PAGE_TITLES[pathname] || 'Nidus';
  }, [pathname]);

  return null;
}

function HomeRedirect() {
  const { user, ready } = useAuth();
  if (!ready && !user) return <div className="app-boot">Carregando…</div>;
  return <Navigate to={user ? '/home' : '/landing'} replace />;
}

function ProtectedRoute({ children }) {
  const { user, ready } = useAuth();
  if (!ready && !user) return <div className="app-boot">Carregando perfil…</div>;
  if (ready && !user) return <Navigate to="/authchoice" replace />;
  if (!user) return <div className="app-boot">Carregando perfil…</div>;
  return children;
}

function GuestOnly({ children }) {
  const { user, ready } = useAuth();
  if (!ready && !user) return <div className="app-boot">Carregando…</div>;
  if (user) return <Navigate to="/home" replace />;
  return children;
}

function AppChrome({ children }) {
  return (
    <>
      <div className="app-wash" aria-hidden="true" />
      <Navbar2 />
      {children}
    </>
  );
}

function AppRoutes() {
  return (
    <>
      <PageTitle />
      <a className="skip-link" href="#conteudo-principal">
        Ir para o conteúdo
      </a>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/landing" element={<GuestOnly><LandingPage /></GuestOnly>} />
        <Route path="/authchoice" element={<GuestOnly><AuthChoice /></GuestOnly>} />
        <Route path="/register" element={<Register />} />
        <Route path="/registeru" element={<RegisterUser />} />
        <Route path="/perfil" element={<ProtectedRoute><AppChrome><Perfil /></AppChrome></ProtectedRoute>} />
        <Route path="/home" element={<AppChrome><Home /></AppChrome>} />
        <Route path="/salvos" element={<ProtectedRoute><AppChrome><Saved /></AppChrome></ProtectedRoute>} />
        <Route path="/u/:username" element={<AppChrome><PublicProfile /></AppChrome>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
