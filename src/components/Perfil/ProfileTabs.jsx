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

  function onKeyDown(event) {
    const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (!keys.includes(event.key)) return;

    event.preventDefault();
    const index = tabs.findIndex((item) => item.id === tab);
    let next = index;

    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;

    setTab(tabs[next].id);
  }

  return (
    <div className="profile-tabs">
      <div className="profile-tabs-inner" role="tablist" aria-label="Seções do perfil" onKeyDown={onKeyDown}>
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`perfil-tab-${item.id}`}
            aria-selected={tab === item.id}
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
