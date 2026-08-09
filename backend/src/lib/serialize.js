import { fromCents } from './money.js';
import { roleToType } from './auth.js';

const EMPTY_SOCIAL = { instagram: '', twitter: '', linkedin: '', facebook: '' };

function socialLinks(value) {
  let parsed = value;
  if (typeof value === 'string') {
    try { parsed = JSON.parse(value); } catch { parsed = null; }
  }
  if (!parsed || typeof parsed !== 'object') return { ...EMPTY_SOCIAL };
  return { ...EMPTY_SOCIAL, ...parsed };
}

function skillNames(profile) {
  return (profile?.skills || []).map((item) => item.skill?.name).filter(Boolean);
}

function ratingSummary(reviews = []) {
  if (!reviews.length) return { rating: null, reviewCount: 0 };
  const sum = reviews.reduce((acc, item) => acc + item.rating, 0);
  return {
    rating: Math.round((sum / reviews.length) * 10) / 10,
    reviewCount: reviews.length,
  };
}

function availabilityLabel(value) {
  if (value === 'BUSY') return 'Ocupado';
  if (value === 'UNAVAILABLE') return 'Indisponível';
  if (value === 'AVAILABLE') return 'Disponível';
  return value || '';
}

function priceTypeLabel(type) {
  if (type === 'STARTING_AT') return 'A partir de';
  if (type === 'NEGOTIABLE') return 'A combinar';
  return 'Preço fixo';
}

export function serializeService(service, extras = {}) {
  if (!service) return null;
  const freelancer = service.freelancer;
  const profile = freelancer?.freelancerProfile;
  const reviews = freelancer?.reviewsReceived || [];
  const { rating, reviewCount } = extras.rating
    ? extras
    : ratingSummary(reviews);

  return {
    id: service.id,
    title: service.title,
    slug: service.slug,
    description: service.description,
    includes: service.includes || '',
    category: service.category ? { id: service.category.id, name: service.category.name, slug: service.category.slug } : null,
    subcategory: service.subcategory || '',
    priceType: service.priceType,
    priceTypeLabel: priceTypeLabel(service.priceType),
    price: fromCents(service.price),
    priceCents: service.price,
    deliveryDays: service.deliveryDays,
    status: service.status,
    views: service.views || 0,
    images: (service.media || []).sort((a, b) => a.position - b.position).map((m) => m.url),
    media: (service.media || []).sort((a, b) => a.position - b.position),
    saved: Boolean(extras.saved),
    freelancer: freelancer
      ? {
          id: freelancer.id,
          username: freelancer.username,
          name: freelancer.name,
          businessName: profile?.businessName || freelancer.name,
          avatarUrl: freelancer.avatarUrl,
          profilePhoto: freelancer.avatarUrl,
          city: profile?.city || freelancer.city,
          state: profile?.state || freelancer.state,
          country: profile?.country || freelancer.country,
          rating,
          reviewCount,
          completedJobs: extras.completedJobs ?? 0,
        }
      : null,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
  };
}

export function serializePost(post, extras = {}) {
  if (!post) return null;
  const author = post.author;
  return {
    id: post.id,
    content: post.content || '',
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    images: (post.media || []).sort((a, b) => a.position - b.position).map((m) => m.url),
    media: (post.media || []).sort((a, b) => a.position - b.position),
    likeCount: extras.likeCount ?? post.likes?.length ?? 0,
    commentCount: extras.commentCount ?? post.comments?.length ?? 0,
    liked: Boolean(extras.liked),
    saved: Boolean(extras.saved),
    author: author
      ? {
          id: author.id,
          username: author.username,
          name: author.name,
          businessName: author.freelancerProfile?.businessName || author.name,
          profilePhoto: author.avatarUrl,
          avatarUrl: author.avatarUrl,
          type: roleToType(author.role),
        }
      : null,
    comments: extras.includeComments
      ? (post.comments || []).map((comment) => ({
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          author: comment.author
            ? {
                id: comment.author.id,
                username: comment.author.username,
                name: comment.author.name,
                profilePhoto: comment.author.avatarUrl,
              }
            : null,
        }))
      : undefined,
  };
}

function baseUser(user) {
  const profile = user.freelancerProfile;
  const titles = skillNames(profile);
  const reviews = user.reviewsReceived || [];
  const { rating, reviewCount } = ratingSummary(reviews);
  const completedJobs = user._count?.contractsAsFreelancer
    ?? (user.contractsAsFreelancer || []).filter((c) => c.status === 'COMPLETED').length
    ?? 0;

  return {
    id: user.id,
    type: roleToType(user.role),
    role: user.role,
    username: user.username,
    name: user.name,
    businessName: profile?.businessName || user.name,
    professionalTitle: titles,
    headline: profile?.headline || titles.slice(0, 2).join(' • '),
    bio: user.bio || profile?.about || '',
    country: profile?.country || user.country || '',
    state: profile?.state || user.state || '',
    city: profile?.city || user.city || '',
    website: user.website || '',
    profilePhoto: user.avatarUrl || '',
    banner: user.bannerUrl || '',
    avatarUrl: user.avatarUrl || '',
    bannerUrl: user.bannerUrl || '',
    socialLinks: socialLinks(user.socialLinks),
    availability: availabilityLabel(profile?.availability),
    availabilityKey: profile?.availability || null,
    experience: profile?.experience || '',
    initialPrice: fromCents(profile?.initialPrice),
    rating,
    reviewCount,
    completedJobs,
    provider: user.provider || 'local',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function serializePublicUser(user, extras = {}) {
  if (!user) return null;
  const data = baseUser(user);
  const services = (user.servicesOwned || [])
    .filter((s) => s.status === 'ACTIVE')
    .map((s) => serializeService({ ...s, freelancer: user }, extras));
  const projects = (user.portfolio || []).map((project) => ({
    id: project.id,
    title: project.title,
    description: project.description,
    category: project.category,
    preview: project.media?.[0]?.url || '',
    images: (project.media || []).map((m) => m.url),
  }));
  const posts = (user.posts || []).map((post) => serializePost({ ...post, author: user }));

  return {
    ...data,
    projects,
    services,
    posts,
    statistics: {
      services: services.length,
      projects: projects.length,
      followers: extras.followers ?? user._count?.followers ?? 0,
      following: extras.following ?? user._count?.follows ?? 0,
      likes: extras.likes ?? 0,
      posts: posts.length,
      reviews: data.reviewCount,
      views: user.freelancerProfile?.profileViews || 0,
      rating: data.rating,
      completedJobs: data.completedJobs,
    },
    following: Boolean(extras.followingMe === undefined ? extras.isFollowing : extras.isFollowing),
    saved: Boolean(extras.saved),
  };
}

export function serializePrivateUser(user, extras = {}) {
  const pub = serializePublicUser(user, extras);
  if (!pub) return null;

  const finance = extras.finance || {
    completedCents: 0,
    pendingCents: 0,
    activeCents: 0,
  };

  return {
    ...pub,
    email: user.email,
    phone: user.phone || '',
    company: user.company || '',
    hiringFocus: user.hiringFocus || '',
    finance: {
      balance: fromCents(finance.completedCents) || 0,
      earnings: fromCents(finance.completedCents) || 0,
      pending: fromCents(finance.pendingCents) || 0,
      active: fromCents(finance.activeCents) || 0,
      expenses: 0,
      note: 'Controle interno. Nenhum pagamento externo foi processado.',
    },
    savedCounts: extras.savedCounts || { freelancers: 0, services: 0, posts: 0 },
    unreadMessages: extras.unreadMessages || 0,
    unreadNotifications: extras.unreadNotifications || 0,
  };
}

export function serializeContract(contract) {
  if (!contract) return null;
  return {
    id: contract.id,
    kind: contract.kind,
    title: contract.title,
    description: contract.description,
    budgetHint: fromCents(contract.budgetHint),
    price: fromCents(contract.price),
    deadline: contract.deadline,
    status: contract.status,
    createdAt: contract.createdAt,
    acceptedAt: contract.acceptedAt,
    startedAt: contract.startedAt,
    deliveredAt: contract.deliveredAt,
    completedAt: contract.completedAt,
    cancelledAt: contract.cancelledAt,
    service: contract.service
      ? {
          id: contract.service.id,
          title: contract.service.title,
          images: (contract.service.media || []).map((m) => m.url),
        }
      : null,
    client: contract.client
      ? {
          id: contract.client.id,
          name: contract.client.name,
          username: contract.client.username,
          profilePhoto: contract.client.avatarUrl,
        }
      : null,
    freelancer: contract.freelancer
      ? {
          id: contract.freelancer.id,
          name: contract.freelancer.name,
          username: contract.freelancer.username,
          businessName: contract.freelancer.freelancerProfile?.businessName || contract.freelancer.name,
          profilePhoto: contract.freelancer.avatarUrl,
        }
      : null,
    review: contract.review
      ? {
          id: contract.review.id,
          rating: contract.review.rating,
          comment: contract.review.comment,
          createdAt: contract.review.createdAt,
        }
      : null,
  };
}

export function serializeConversation(conversation, extras = {}) {
  const last = extras.lastMessage || conversation.messages?.[conversation.messages.length - 1] || conversation.messages?.[0];
  const other = extras.otherUser;
  return {
    id: conversation.id,
    updatedAt: conversation.updatedAt,
    contract: conversation.contract
      ? { id: conversation.contract.id, title: conversation.contract.title, status: conversation.contract.status }
      : null,
    otherUser: other
      ? {
          id: other.id,
          name: other.name,
          username: other.username,
          profilePhoto: other.avatarUrl,
          businessName: other.freelancerProfile?.businessName || other.name,
        }
      : null,
    lastMessage: last
      ? { id: last.id, content: last.content, createdAt: last.createdAt, senderId: last.senderId, readAt: last.readAt }
      : null,
    unreadCount: extras.unreadCount || 0,
  };
}

export function serializeMessage(message) {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    content: message.content,
    createdAt: message.createdAt,
    readAt: message.readAt,
    sender: message.sender
      ? {
          id: message.sender.id,
          name: message.sender.name,
          username: message.sender.username,
          profilePhoto: message.sender.avatarUrl,
        }
      : null,
  };
}

export function serializeNotification(item) {
  return {
    id: item.id,
    type: item.type,
    entityId: item.entityId,
    readAt: item.readAt,
    createdAt: item.createdAt,
    actor: item.actor
      ? {
          id: item.actor.id,
          name: item.actor.name,
          username: item.actor.username,
          profilePhoto: item.actor.avatarUrl,
        }
      : null,
  };
}

export function serializeReview(review) {
  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    client: review.client
      ? {
          id: review.client.id,
          name: review.client.name,
          username: review.client.username,
          profilePhoto: review.client.avatarUrl,
        }
      : null,
  };
}
