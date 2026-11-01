export type AvatarDecoration = {
  url: string; // mxc:// or preset id or data URI or https://
  animation?: 'none' | 'spin-slow' | 'pulse' | 'float' | 'glow';
  scale?: number; // default 1.18
  glowColor?: string; // hex color e.g. #7b2cbf
};

export type ProfileNameplate = {
  url?: string; // mxc:// or image URL
  gradient?: string; // CSS gradient string
  textColor?: string;
  preset?: string;
};

export type ProfileEffect = {
  url?: string; // mxc:// or video/APNG/SVG
  animation?: 'none' | 'pulse' | 'float' | 'glow';
  preset?: string;
};

export type ProfileCardFrame = {
  url?: string; // mxc:// or SVG/border image
  borderColor?: string;
  preset?: string;
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
  // The 4 Discord-style customizable layers:
  avatarDecoration?: AvatarDecoration; // 1. Avatar Decoration
  nameplate?: ProfileNameplate;       // 2. Custom Nameplate banner
  profileEffect?: ProfileEffect;       // 3. Profile Effect overlay
  profileFrame?: ProfileCardFrame;     // 4. Outer Profile Card Frame
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
    scale: 1.18,
    glowColor: '#a855f7',
  },
  nameplate: {
    preset: '',
  },
  profileEffect: {
    preset: '',
  },
  profileFrame: {
    preset: '',
  },
  banner: {
    type: 'gradient',
    gradient: 'linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)',
    themeColor: '#7b2cbf',
  },
  badges: [],
  boards: [],
};

// 1. Avatar Decoration Presets
export const PRESET_DECORATIONS = [
  {
    id: 'entity-claws',
    name: 'The Entity Claws',
    glowColor: '#ea580c',
    animation: 'pulse' as const,
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 4C52 14 58 18 64 12C60 22 66 26 76 22C68 30 74 36 86 36C76 42 80 50 92 52C80 56 82 64 92 70C80 72 80 82 86 90C76 86 72 94 72 100C68 92 60 96 56 100C54 90 46 92 42 100C40 92 34 94 28 90C34 82 28 78 18 78C26 72 22 64 10 62C22 56 18 48 10 44C22 40 20 32 14 26C24 28 26 20 28 12C32 20 38 18 42 10C44 18 48 16 50 4Z" stroke="#ea580c" stroke-width="2.5" fill="#7c2d12" fill-opacity="0.25"/>
      <circle cx="50" cy="50" r="46" stroke="#f97316" stroke-width="2" stroke-dasharray="16 8"/>
    </svg>`,
  },
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

// 2. Custom Nameplate Presets (Backgrounds for username bar in chat & member list)
export const PRESET_NAMEPLATES = [
  {
    id: 'scratch-marks-red',
    name: 'Scratch Marks (Red)',
    gradient: 'linear-gradient(90deg, rgba(80, 10, 10, 0.95) 0%, rgba(185, 28, 28, 0.85) 50%, rgba(80, 10, 10, 0.5) 100%)',
    textColor: '#fee2e2',
    border: '1px solid rgba(239, 68, 68, 0.5)',
  },
  {
    id: 'cyber-grid',
    name: 'Cyberpunk Neon',
    gradient: 'linear-gradient(90deg, rgba(8, 51, 68, 0.9) 0%, rgba(6, 182, 212, 0.6) 60%, rgba(244, 63, 94, 0.5) 100%)',
    textColor: '#cffafe',
    border: '1px solid rgba(6, 182, 212, 0.5)',
  },
  {
    id: 'cosmic-aurora',
    name: 'Cosmic Stardust',
    gradient: 'linear-gradient(90deg, rgba(46, 16, 101, 0.9) 0%, rgba(168, 85, 247, 0.6) 50%, rgba(236, 72, 153, 0.6) 100%)',
    textColor: '#f3e8ff',
    border: '1px solid rgba(168, 85, 247, 0.4)',
  },
  {
    id: 'matrix-stream',
    name: 'Matrix Code',
    gradient: 'linear-gradient(90deg, rgba(2, 44, 34, 0.9) 0%, rgba(16, 185, 129, 0.6) 70%, rgba(5, 150, 105, 0.3) 100%)',
    textColor: '#d1fae5',
    border: '1px solid rgba(16, 185, 129, 0.4)',
  },
  {
    id: 'golden-glory',
    name: 'Golden Vanguard',
    gradient: 'linear-gradient(90deg, rgba(66, 32, 6, 0.9) 0%, rgba(234, 179, 8, 0.7) 60%, rgba(202, 138, 4, 0.4) 100%)',
    textColor: '#fef9c3',
    border: '1px solid rgba(234, 179, 8, 0.5)',
  },
];

// 3. Profile Effect Presets (Large animated card overlays like Hook / Claws / Auras)
export const PRESET_EFFECTS = [
  {
    id: 'entity-hook',
    name: 'The Entity Tendrils',
    svg: `<svg viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
      <path d="M200 10 C180 80 150 140 120 220 C100 280 80 340 70 420 C120 380 160 320 180 260 C190 220 200 160 200 10 Z" fill="url(#ent-hook)" opacity="0.8"/>
      <path d="M220 10 C240 90 280 170 320 250 C340 300 350 360 360 440 C310 390 270 320 240 250 C230 200 220 120 220 10 Z" fill="url(#ent-hook)" opacity="0.8"/>
      <path d="M190 60 C170 120 100 160 30 180 C80 190 140 180 180 140 Z" fill="#b45309" opacity="0.7"/>
      <path d="M230 70 C260 130 330 170 390 190 C340 200 280 180 240 140 Z" fill="#b45309" opacity="0.7"/>
      <circle cx="200" cy="180" r="140" fill="radial-gradient(circle, rgba(234,88,12,0.3) 0%, transparent 70%)" opacity="0.6"/>
      <defs>
        <linearGradient id="ent-hook" x1="200" y1="0" x2="200" y2="500" gradientUnits="userSpaceOnUse">
          <stop stop-color="#ea580c"/>
          <stop offset="0.6" stop-color="#7c2d12"/>
          <stop offset="1" stop-color="#18181b"/>
        </linearGradient>
      </defs>
    </svg>`,
  },
  {
    id: 'cosmic-rift',
    name: 'Cosmic Nebula Rift',
    svg: `<svg viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
      <ellipse cx="200" cy="160" rx="190" ry="150" fill="url(#cosm-glow)" opacity="0.45"/>
      <path d="M50 20 Q200 120 350 20 Q250 200 50 20 Z" fill="#ec4899" opacity="0.3"/>
      <defs>
        <radialGradient id="cosm-glow" cx="0.5" cy="0.5" r="0.5">
          <stop stop-color="#a855f7"/>
          <stop offset="0.5" stop-color="#3b82f6"/>
          <stop offset="1" stop-color="transparent"/>
        </radialGradient>
      </defs>
    </svg>`,
  },
  {
    id: 'cyber-sparks',
    name: 'Cyberpunk Grid Lines',
    svg: `<svg viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
      <line x1="0" y1="100" x2="400" y2="100" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="10 15" opacity="0.5"/>
      <line x1="0" y1="200" x2="400" y2="200" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="5 25" opacity="0.5"/>
      <line x1="50" y1="0" x2="50" y2="500" stroke="#06b6d4" stroke-width="1" opacity="0.3"/>
      <line x1="350" y1="0" x2="350" y2="500" stroke="#06b6d4" stroke-width="1" opacity="0.3"/>
    </svg>`,
  },
];

// 4. Profile Card Frame Presets (Border and outer decorations around the modal)
export const PRESET_FRAMES = [
  {
    id: 'entity-frame',
    name: 'Entity Thorns',
    style: {
      border: '2px solid #ea580c',
      boxShadow: '0 0 20px rgba(234, 88, 12, 0.4), inset 0 0 15px rgba(234, 88, 12, 0.2)',
      borderRadius: '16px',
    },
  },
  {
    id: 'cyber-frame',
    name: 'Cyber Neon Border',
    style: {
      border: '2px solid #06b6d4',
      boxShadow: '0 0 25px rgba(6, 182, 212, 0.5), inset 0 0 10px rgba(244, 63, 94, 0.3)',
      borderRadius: '16px',
    },
  },
  {
    id: 'gold-filigree',
    name: 'Royal Gold Border',
    style: {
      border: '2px solid #eab308',
      boxShadow: '0 0 25px rgba(234, 179, 8, 0.4), inset 0 0 12px rgba(234, 179, 8, 0.2)',
      borderRadius: '16px',
    },
  },
  {
    id: 'matrix-emerald-frame',
    name: 'Matrix Pulse Frame',
    style: {
      border: '2px solid #10b981',
      boxShadow: '0 0 20px rgba(16, 185, 129, 0.5), inset 0 0 10px rgba(16, 185, 129, 0.3)',
      borderRadius: '16px',
    },
  },
];
