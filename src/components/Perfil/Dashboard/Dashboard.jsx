import { Plus } from "lucide-react";
import logo from "../../../assets/logo.png";

function formatMoney(value) {
  const amount = Number(value || 0);
  return amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function profileCompleteness(user) {
  const checks = [
    Boolean(user?.bio),
    Boolean(user?.profilePhoto),
    Boolean(user?.country),
    Boolean(user?.website),
    (user?.professionalTitle || []).length > 0,
    (user?.projects || []).length > 0,
    Object.values(user?.socialLinks || {}).some(Boolean),
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

export default function Dashboard({ user, onEditProfile, onNewProject }) {
  const isFreelancer = user?.type !== "normal";
  const hasSocial = Object.values(user?.socialLinks || {}).some(Boolean);
  const completeness = isFreelancer
    ? profileCompleteness(user)
    : Math.round(
        ([
          Boolean(user?.name),
          Boolean(user?.email),
          Boolean(user?.country),
          Boolean(user?.state),
          Boolean(user?.profilePhoto),
          Boolean(user?.bio),
          Boolean(user?.company || user?.website),
          hasSocial,
        ].filter(Boolean).length /
          8) *
          100,
      );
  const projectCount = user?.projects?.length || 0;
  const rating = user?.statistics?.reviews ? user.statistics.reviews : null;
  const balance = user?.finance?.balance ?? user?.balance ?? 0;
  const earnings = user?.finance?.earnings ?? user?.earnings ?? 0;
  const savedCount = Array.isArray(user?.savedIds) ? user.savedIds.length : 0;

  const pills = isFreelancer
    ? [
        { label: "Saldo", value: `R$ ${formatMoney(balance)}` },
        { label: "Ganhos", value: `R$ ${formatMoney(earnings)}` },
        { label: "Projetos", value: String(projectCount) },
        { label: "Avaliação", value: rating ?? "—" },
      ]
    : [
        { label: "Conta", value: "Contratante" },
        { label: "Salvos", value: String(savedCount) },
        { label: "Perfil", value: `${completeness}%` },
      ];

  return (
    <section className="perfil-dashboard">
      <div className="section-header">
        <div>
          <h2>Visão geral</h2>
          <p>
            {isFreelancer
              ? "Acompanhe trabalhos, ganhos e o que o mundo vê do seu perfil."
              : "Explore profissionais, salve ninhos e complete sua conta."}
          </p>
        </div>
        <button className="home-btn" onClick={onNewProject} type="button">
          <Plus size={16} />
          {isFreelancer ? "Novo serviço" : "Explorar freelancers"}
        </button>
      </div>

      <ul className={`home-pills${isFreelancer ? " is-four" : ""}`}>
        {pills.map((item) => (
          <li key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>

      <section className="home-empty">
        <img src={logo} alt="" className="home-empty__orb" />
        <h2>Ainda sem atividade</h2>
        <p>
          {isFreelancer
            ? "Quando chegar um pedido ou comentário, ele aparece aqui."
            : "Quando você salvar ou contratar alguém, a atividade entra aqui."}
        </p>
        <div className="home-hero__actions">
          {!isFreelancer && (
            <button type="button" className="home-btn ghost" onClick={onEditProfile}>
              Completar perfil
            </button>
          )}
        </div>
      </section>
    </section>
  );
}
