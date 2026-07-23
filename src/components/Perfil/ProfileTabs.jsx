export default function ProfileTabs({ tab, setTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Geral' },
    { id: 'services', label: 'Serviços' },
    { id: 'finance', label: 'Finanças' },
    { id: 'messages', label: 'Mensagens' },
    { id: 'social', label: 'Social' },
    { id: 'statistics', label: 'Estatísticas' },
    { id: 'settings', label: 'Configurações' },
  ];

  return (
    <div className="profile-tabs">
      <div className="profile-tabs-inner">
        {tabs.map((item) => (
          <button
            key={item.id}
            className={`profile-tab ${tab === item.id ? 'active' : ''}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
