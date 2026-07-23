import { Globe2, Link2, AtSign, Users, Share2 } from "lucide-react";

const socials = [
  { name: "Instagram", icon: Globe2, profile: "@nidus.design", followers: "12,4k" },
  { name: "Twitter", icon: AtSign, profile: "@nidus_design", followers: "8,2k" },
  { name: "LinkedIn", icon: Users, profile: "Nidus Plataforma", followers: "4,7k" },
  { name: "Facebook", icon: Link2, profile: "Nidus", followers: "6,3k" },
];

export default function Social({ user }) {
  return (
    <section className="perfil-section perfil-social">
      <div className="section-heading">
        <div>
          <h2>Social</h2>
          <p>Fortaleça sua presença e compartilhe seu trabalho com a audiência certa.</p>
        </div>
      </div>

      <div className="social-grid">
        {socials.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.name} className="social-card">
              <div className="social-icon"><Icon size={18} /></div>
              <div>
                <strong>{item.name}</strong>
                <p>{item.profile}</p>
              </div>
              <div className="social-stats">
                <span>{item.followers}</span>
                <small>seguidores</small>
              </div>
              <button className="btn-secondary outline">
                <Share2 size={14} /> Compartilhar
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
