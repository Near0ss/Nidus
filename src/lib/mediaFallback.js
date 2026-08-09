import design from '../assets/professions/design.webp';
import dev from '../assets/professions/dev.webp';
import mobile from '../assets/professions/mobile.webp';
import video from '../assets/professions/video.webp';
import data from '../assets/professions/data.webp';
import arch from '../assets/professions/arch.webp';
import write from '../assets/professions/write.webp';
import game from '../assets/professions/game.webp';
import ui from '../assets/professions/ui.webp';

const BY_SLUG = {
  design,
  desenvolvimento: dev,
  mobile,
  video,
  '3d': game,
  conteudo: write,
  dados: data,
  arquitetura: arch,
};

export function fallbackForCategory(category) {
  const slug = String(category?.slug || category?.name || '').toLowerCase();
  if (BY_SLUG[slug]) return BY_SLUG[slug];
  if (slug.includes('design') || slug.includes('ui') || slug.includes('ux')) return ui;
  if (slug.includes('dev') || slug.includes('web')) return dev;
  if (slug.includes('arq')) return arch;
  if (slug.includes('dado') || slug.includes('data')) return data;
  if (slug.includes('video') || slug.includes('foto')) return video;
  if (slug.includes('mobile') || slug.includes('app')) return mobile;
  return design;
}

export const DEFAULT_SERVICE_FALLBACK = design;
