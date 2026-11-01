export type AvatarDecoration = {
  url: string; // mxc:// or data: or https://
  animation?: 'none' | 'spin-slow' | 'pulse' | 'float' | 'glow';
  scale?: number; // default 1.15
  glowColor?: string; // hex color e.g. #7b2cbf
};

export type ProfileBanner = {
  url?: string;
  type?: 'image' | 'video' | 'gradient';
  gradient?: string; // CSS gradient string
  themeColor?: string; // Hex color for theme accent
};

export type ProfileBadge = {
  id: string;
  label: string;
  iconUrl?: string; // mxc:// or emoji or svg
  emoji?: string;
  description?: string;
};

export type ShowcaseItem = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  tags?: string[];
  link?: string;
};

export type ShowcaseBoard = {
  id: string;
  title: string;
  type: 'grid' | 'cards' | 'badges';
  items: ShowcaseItem[];
};

export type ProfileFlare = {
  version: 1;
  bio?: string;
  headline?: string;
  pronouns?: string;
  avatarDecoration?: AvatarDecoration;
  banner?: ProfileBanner;
  badges?: ProfileBadge[];
  boards?: ShowcaseBoard[];
  updatedAt?: number;
};

export const DEFAULT_FLARE: ProfileFlare = {
  version: 1,
  bio: '',
  headline: '',
  pronouns: '',
  avatarDecoration: {
    url: '',
    animation: 'glow',
    scale: 1.15,
    glowColor: '#8a2be2',
  },
  banner: {
    type: 'gradient',
    gradient: 'linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)',
    themeColor: '#7b2cbf',
  },
  badges: [],
  boards: [],
};

// Built-in presets for quick user selection
export const PRESET_DECORATIONS = [
  {
    id: 'cosmic-orb',
    name: 'Cosmic Orb',
    glowColor: '#a855f7',
    animation: 'glow' as const,
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" stroke="url(#cosmic-grad)" stroke-width="4" stroke-dasharray="10 5"/>
      <circle cx="50" cy="50" r="49" stroke="#c084fc" stroke-width="1.5" opacity="0.8"/>
      <defs>
        <linearGradient id="cosmic-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stop-color="#a855f7"/>
          <stop offset="0.5" stop-color="#3b82f6"/>
          <stop offset="1" stop-color="#ec4899"/>
        </linearGradient>
      </defs>
    </svg>`,
  },
  {
    id: 'cyber-neon',
    name: 'Cyberpunk Ring',
    glowColor: '#06b6d4',
    animation: 'spin-slow' as const,
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" stroke="#06b6d4" stroke-width="3" stroke-dasharray="25 8 10 8"/>
      <circle cx="50" cy="50" r="48" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="5 20"/>
    </svg>`,
  },
  {
    id: 'golden-crown',
    name: 'Golden Radiance',
    glowColor: '#eab308',
    animation: 'pulse' as const,
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" stroke="url(#gold-grad)" stroke-width="4"/>
      <circle cx="50" cy="50" r="43" stroke="#fef08a" stroke-width="1" stroke-dasharray="4 4"/>
      <defs>
        <linearGradient id="gold-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stop-color="#eab308"/>
          <stop offset="1" stop-color="#ca8a04"/>
        </linearGradient>
      </defs>
    </svg>`,
  },
  {
    id: 'emerald-matrix',
    name: 'Matrix Pulse',
    glowColor: '#10b981',
    animation: 'pulse' as const,
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" stroke="#10b981" stroke-width="3" stroke-dasharray="12 6"/>
      <circle cx="50" cy="50" r="49" stroke="#34d399" stroke-width="1.5"/>
    </svg>`,
  },
  {
    id: 'void-darkness',
    name: 'Abyssal Void',
    glowColor: '#6366f1',
    animation: 'float' as const,
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" stroke="url(#void-grad)" stroke-width="4.5" stroke-dasharray="40 10"/>
      <defs>
        <linearGradient id="void-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stop-color="#6366f1"/>
          <stop offset="1" stop-color="#4338ca"/>
        </linearGradient>
      </defs>
    </svg>`,
  },
];
