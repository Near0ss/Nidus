export default function ProfileTabs({ tab, setTab, user }) {
  const tabs = [
    { id: 'dashboard', label: 'Geral' },
    ...(user?.type === 'freelancer'
      ? [
          { id: 'services', label: 'Serviços' },
          { id: 'finance', label: 'Finanças' },
          { id: 'messages', label: 'Mensagens' },
          { id: 'statistics', label: 'Estatísticas' },
        ]
      : []),
    { id: 'social', label: 'Social' },
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
