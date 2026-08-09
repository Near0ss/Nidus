import { Link } from 'react-router-dom';
import UserAvatar from './ui/UserAvatar';
import Rating from './ui/Rating';
import { formatBRL, locationLabel } from '../lib/format';

export default function FreelancerCard({ freelancer }) {
  if (!freelancer) return null;
  const skills = (freelancer.professionalTitle || []).slice(0, 3);
  const price = formatBRL(freelancer.initialPrice);

  return (
    <article className="nidus-card freelancer-card-new">
      <UserAvatar
        src={freelancer.profilePhoto || freelancer.avatarUrl}
        name={freelancer.businessName || freelancer.name}
        size={56}
      />
      <div className="freelancer-card-new__body">
        <strong>{freelancer.businessName || freelancer.name}</strong>
        <span className="muted">@{freelancer.username}</span>
        <p>{freelancer.headline || skills.join(' • ') || 'Profissional'}</p>
        {skills.length ? (
          <ul className="skill-chips">
            {skills.map((skill) => <li key={skill}>{skill}</li>)}
          </ul>
        ) : null}
        <div className="freelancer-card-new__meta">
          {locationLabel(freelancer) ? <span>{locationLabel(freelancer)}</span> : null}
          <Rating value={freelancer.rating} count={freelancer.reviewCount} />
          <span>{freelancer.completedJobs || 0} trabalhos</span>
          {price ? <span>A partir de {price}</span> : null}
        </div>
        <Link to={`/u/${freelancer.username}`} className="home-btn ghost">
          Ver perfil
        </Link>
      </div>
    </article>
  );
}
