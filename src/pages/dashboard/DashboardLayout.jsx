import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Footer2 from '../../components/Footer2';
import ProfileBanner from '../../components/Perfil/ProfileBanner';
import { useAuth } from '../../context/AuthContext';
import '../../css/Perfil.css';
import '../../css/Home.css';
import '../../css/nidus.css';

export default function DashboardLayout() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const isFreelancer = user?.type === 'freelancer';

  const links = isFreelancer
    ? [
        { to: '/dashboard', label: 'Painel', end: true },
        { to: '/dashboard/services', label: 'Serviços' },
        { to: '/dashboard/jobs', label: 'Trabalhos' },
        { to: '/dashboard/messages', label: 'Mensagens' },
        { to: '/dashboard/finance', label: 'Finanças' },
        { to: '/dashboard/statistics', label: 'Estatísticas' },
        { to: '/dashboard/posts', label: 'Publicações' },
        { to: '/dashboard/settings', label: 'Configurações' },
      ]
    : [
        { to: '/dashboard', label: 'Painel', end: true },
        { to: '/dashboard/jobs', label: 'Contratações' },
        { to: '/dashboard/messages', label: 'Mensagens' },
        { to: '/salvos', label: 'Salvos' },
        { to: '/notificacoes', label: 'Notificações' },
        { to: '/dashboard/settings', label: 'Configurações' },
      ];

  if (!user) return <div className="app-boot">Carregando…</div>;

  return (
    <div className="perfil-page">
      <div className="perfil-layout">
        <main id="conteudo-principal" className="perfil-feed">
          <ProfileBanner user={user} updateUser={updateUser} onEditProfile={() => navigate('/dashboard/settings')} />
          <div className="profile-tabs">
            <div className="profile-tabs-inner" role="tablist" aria-label="Painel">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) => `profile-tab${isActive ? ' active' : ''}`}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
          <Outlet />
        </main>
      </div>
      <Footer2 />
    </div>
  );
}
