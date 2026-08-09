import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar2 from './components/Navbar2';
import AuthChoice from './pages/AuthChoice';
import LoginPage from './pages/LoginPage';
import Register from './pages/Register';
import RegisterUser from './pages/RegisterUser';
import Home from './pages/Home';
import LandingPage from './pages/LandingPage';
import PublicProfile from './pages/PublicProfile';
import Saved from './pages/Saved';
import Servicos from './pages/Servicos';
import ServicoDetail from './pages/ServicoDetail';
import Freelancers from './pages/Freelancers';
import Social from './pages/Social';
import Mensagens from './pages/Mensagens';
import Notificacoes from './pages/Notificacoes';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import ServicesManage from './pages/dashboard/ServicesManage';
import JobsPage from './pages/dashboard/JobsPage';
import MessagesPage from './pages/dashboard/MessagesPage';
import FinancePage from './pages/dashboard/FinancePage';
import StatsPage from './pages/dashboard/StatsPage';
import PostsManage from './pages/dashboard/PostsManage';
import SettingsPage from './pages/dashboard/SettingsPage';

const PAGE_TITLES = {
  '/landing': 'Nidus',
  '/authchoice': 'Entrar · Nidus',
  '/login/cliente': 'Entrar como cliente · Nidus',
  '/login/freelancer': 'Entrar como freelancer · Nidus',
  '/register': 'Cadastro freelancer · Nidus',
  '/registeru': 'Cadastro · Nidus',
  '/home': 'Início · Nidus',
  '/servicos': 'Serviços · Nidus',
  '/freelancers': 'Freelancers · Nidus',
  '/social': 'Social · Nidus',
  '/salvos': 'Salvos · Nidus',
  '/mensagens': 'Mensagens · Nidus',
  '/notificacoes': 'Notificações · Nidus',
  '/dashboard': 'Painel · Nidus',
  '/dashboard/services': 'Serviços · Nidus',
  '/dashboard/jobs': 'Trabalhos · Nidus',
  '/dashboard/messages': 'Mensagens · Nidus',
  '/dashboard/finance': 'Finanças · Nidus',
  '/dashboard/statistics': 'Estatísticas · Nidus',
  '/dashboard/posts': 'Publicações · Nidus',
  '/dashboard/settings': 'Configurações · Nidus',
};

function PageTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname.startsWith('/u/')) {
      const name = decodeURIComponent(pathname.split('/')[2] || '');
      document.title = name ? `${name} · Nidus` : 'Perfil · Nidus';
      return;
    }
    if (pathname.startsWith('/servicos/')) {
      document.title = 'Serviço · Nidus';
      return;
    }
    if (pathname.startsWith('/dashboard')) {
      document.title = PAGE_TITLES[pathname] || PAGE_TITLES['/dashboard'];
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

function FreelancerOnly({ children }) {
  const { user } = useAuth();
  if (user?.type !== 'freelancer') return <Navigate to="/dashboard" replace />;
  return children;
}

function GuestOnly({ children }) {
  const { user, ready } = useAuth();
  if (!ready && !user) return <div className="app-boot">Carregando…</div>;
  if (user) return <Navigate to={user.type === 'freelancer' ? '/dashboard' : '/home'} replace />;
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
        <Route path="/login/:role" element={<GuestOnly><LoginPage /></GuestOnly>} />
        <Route path="/register" element={<Register />} />
        <Route path="/registeru" element={<RegisterUser />} />
        <Route path="/home" element={<AppChrome><Home /></AppChrome>} />
        <Route path="/servicos" element={<AppChrome><Servicos /></AppChrome>} />
        <Route path="/servicos/:id" element={<AppChrome><ServicoDetail /></AppChrome>} />
        <Route path="/freelancers" element={<AppChrome><Freelancers /></AppChrome>} />
        <Route path="/social" element={<AppChrome><Social /></AppChrome>} />
        <Route path="/salvos" element={<ProtectedRoute><AppChrome><Saved /></AppChrome></ProtectedRoute>} />
        <Route path="/mensagens" element={<ProtectedRoute><Mensagens /></ProtectedRoute>} />
        <Route path="/notificacoes" element={<ProtectedRoute><AppChrome><Notificacoes /></AppChrome></ProtectedRoute>} />
        <Route path="/perfil" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<ProtectedRoute><AppChrome><DashboardLayout /></AppChrome></ProtectedRoute>}>
          <Route index element={<DashboardHome />} />
          <Route path="services" element={<FreelancerOnly><ServicesManage /></FreelancerOnly>} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="finance" element={<FreelancerOnly><FinancePage /></FreelancerOnly>} />
          <Route path="statistics" element={<FreelancerOnly><StatsPage /></FreelancerOnly>} />
          <Route path="posts" element={<FreelancerOnly><PostsManage /></FreelancerOnly>} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="/u/:username" element={<AppChrome><PublicProfile /></AppChrome>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
