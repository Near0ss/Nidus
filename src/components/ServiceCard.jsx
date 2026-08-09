import { Link } from 'react-router-dom';
import { Bookmark, Clock } from 'lucide-react';
import UserAvatar from './ui/UserAvatar';
import Rating from './ui/Rating';
import SafeImage from './ui/SafeImage';
import { deliveryLabel, priceLabel } from '../lib/format';
import { fallbackForCategory } from '../lib/mediaFallback';

export default function ServiceCard({ service, onSave }) {
  if (!service) return null;
  const image = service.images?.[0];
  const freelancer = service.freelancer || {};
  const title = service.title || 'Serviço';

  return (
    <article className="nidus-card service-card-new">
      <Link to={`/servicos/${service.id}`} className="service-card-new__media">
        <SafeImage
          src={image}
          alt={title}
          fallback={fallbackForCategory(service.category)}
        />
      </Link>
      <div className="service-card-new__body">
        <div className="service-card-new__top">
          <Link to={`/servicos/${service.id}`}>
            <h3>{title}</h3>
          </Link>
          {onSave ? (
            <button
              type="button"
              className={`icon-btn${service.saved ? ' is-on' : ''}`}
              aria-label={service.saved ? 'Remover dos salvos' : 'Salvar serviço'}
              onClick={() => onSave(service)}
            >
              <Bookmark size={18} fill={service.saved ? 'currentColor' : 'none'} />
            </button>
          ) : null}
        </div>
        <Link to={`/u/${freelancer.username}`} className="service-card-new__author">
          <UserAvatar src={freelancer.profilePhoto || freelancer.avatarUrl} name={freelancer.businessName || freelancer.name} size={28} />
          <span>{freelancer.businessName || freelancer.name || freelancer.username}</span>
        </Link>
        <div className="service-card-new__meta">
          <span>{service.category?.name || 'Serviço'}</span>
          <span><Clock size={14} /> {deliveryLabel(service.deliveryDays)}</span>
        </div>
        <div className="service-card-new__footer">
          <strong>{priceLabel(service)}</strong>
          <Rating value={freelancer.rating} count={freelancer.reviewCount} />
        </div>
      </div>
    </article>
  );
}
