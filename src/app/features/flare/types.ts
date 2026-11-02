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

export type DisplayNameEffect =
  | 'solid'
  | 'gradient'
  | 'neon'
  | 'toon'
  | 'pop'
  | 'gummy'
  | 'prism';

export type DisplayNameStyle = {
  fontId?: string; // id from DISCORD_FONTS (e.g. 'default', 'gothic', 'pixel'...)
  fontFamily?: string; // CSS font-family
  fontUrl?: string; // mxc:// or web URL for custom uploaded font file
  effect?: DisplayNameEffect;
  color?: string; // hex color e.g. #22c55e (toxic green from screenshot)
  gradient?: string; // CSS linear-gradient string
};

export type ProfileFont = {
  preset?: string;        // ID of preset font
  family?: string;        // Font family name (Google font or custom uploaded name)
  url?: string;           // mxc:// or web URL for custom uploaded font file
  textColor?: string;     // Custom text color
  textShadow?: string;    // CSS text-shadow or glow effect
  weight?: string;        // e.g. 'normal' | 'bold' | '700'
  letterSpacing?: string; // e.g. '0px' | '1px' | '2px'
  textTransform?: 'none' | 'uppercase' | 'capitalize' | 'lowercase';
};

export type ProfileCardTheme = {
  preset?: string;
  gradient?: string; // CSS linear-gradient string
  primaryColor?: string; // e.g. #420914 (Midnight Wine)
  accentColor?: string;  // e.g. #1a0206
};

export type ProfileFlare = {
  version: 1;
  bio?: string;
  headline?: string;
  pronouns?: string;
  // The Discord-style customizable layers:
  avatarDecoration?: AvatarDecoration; // 1. Avatar Decoration
  nameplate?: ProfileNameplate;       // 2. Custom Nameplate banner for the server member list!
  displayNameStyle?: DisplayNameStyle; // 3. Display Name Style (Font, Effect, Color)
  font?: ProfileFont;                  // Compatibility alias for typography
  profileEffect?: ProfileEffect;       // 4. Profile Effect overlay (runs 3.8s then rests)
  profileFrame?: ProfileCardFrame;     // 5. Outer Profile Card Frame
  banner?: ProfileBanner;              // Banner Color / Image
  cardTheme?: ProfileCardTheme;        // 6. Vesktop Profile Theme & Gradient
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
  displayNameStyle: {
    fontId: 'default',
    fontFamily: '',
    effect: 'neon',
    color: '#22c55e',
  },
  font: {
    preset: '',
    family: '',
    url: '',
    textColor: '',
    textShadow: '',
    weight: 'normal',
    letterSpacing: 'normal',
    textTransform: 'none',
  },
  profileEffect: {
    preset: '',
  },
  profileFrame: {
    preset: '',
  },
  banner: {
    type: 'gradient',
    gradient: 'linear-gradient(135deg, #76c800 0%, #4d8800 100%)',
    themeColor: '#76c800',
  },
  cardTheme: {
    preset: 'midnight-wine',
    gradient: 'linear-gradient(180deg, #420914 0%, #1a0206 100%)',
    primaryColor: '#420914',
    accentColor: '#1a0206',
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

// 5. Preset Fonts (Discord Nitro style presets + custom font loader)
export const PRESET_FONTS = [
  {
    id: 'unholy-gothic',
    name: 'Unholy Gothic',
    family: "'UnifrakturMaguntia', 'MedievalSharp', fantasy, serif",
    googleFont: 'UnifrakturMaguntia',
    sample: 'Unholy Gothic',
    category: 'Gothic',
    weight: 'normal',
    letterSpacing: '1px',
    textShadow: '0 0 6px rgba(185, 28, 28, 0.7)',
    description: 'Medieval blackletter gothic calligraphy (Discord Nitro style)',
  },
  {
    id: 'entity-horror',
    name: 'The Entity Spooky',
    family: "'Creepster', cursive",
    googleFont: 'Creepster',
    sample: 'Entity Horror',
    category: 'Horror',
    weight: 'normal',
    letterSpacing: '1.5px',
    textShadow: '0 0 8px rgba(234, 88, 12, 0.8), 0 0 15px rgba(124, 45, 18, 0.6)',
    description: 'Dripping horror entity typography for Dead by Daylight lovers',
  },
  {
    id: 'cursed-pirate',
    name: 'Cursed Relic',
    family: "'Pirata One', 'Cinzel Decorative', cursive",
    googleFont: 'Pirata One',
    sample: 'Cursed Relic',
    category: 'Gothic',
    weight: 'normal',
    letterSpacing: '1px',
    textShadow: '0 0 5px rgba(234, 179, 8, 0.6)',
    description: 'Swashbuckling dark fantasy serif',
  },
  {
    id: 'arcade-pixel',
    name: 'Arcade 8-Bit',
    family: "'Press Start 2P', monospace",
    googleFont: 'Press Start 2P',
    sample: '8-BIT PIXEL',
    category: 'Gaming',
    weight: 'normal',
    letterSpacing: '0px',
    textShadow: '2px 2px 0px #000, 0 0 8px rgba(16, 185, 129, 0.8)',
    description: 'Classic retro video game arcade pixel font',
  },
  {
    id: 'silkscreen-pixel',
    name: 'Silkscreen Retro',
    family: "'Silkscreen', monospace",
    googleFont: 'Silkscreen',
    sample: 'SILKSCREEN',
    category: 'Gaming',
    weight: '700',
    letterSpacing: '1px',
    textShadow: '0 0 5px rgba(6, 182, 212, 0.6)',
    description: 'Crisp futuristic micro-pixel font',
  },
  {
    id: 'cyber-orbitron',
    name: 'Cyberpunk Matrix',
    family: "'Orbitron', sans-serif",
    googleFont: 'Orbitron',
    sample: 'CYBERPUNK',
    category: 'Sci-Fi',
    weight: '700',
    letterSpacing: '1.5px',
    textShadow: '0 0 8px rgba(6, 182, 212, 0.9), 0 0 16px rgba(6, 182, 212, 0.4)',
    description: 'Futuristic sci-fi display font with neon glow',
  },
  {
    id: 'audiowide-tech',
    name: 'Audiowide Mecha',
    family: "'Audiowide', sans-serif",
    googleFont: 'Audiowide',
    sample: 'AUDIOWIDE',
    category: 'Sci-Fi',
    weight: 'normal',
    letterSpacing: '1px',
    textShadow: '0 0 6px rgba(168, 85, 247, 0.7)',
    description: 'High-tech robotic display font',
  },
  {
    id: 'neon-monoton',
    name: 'Electric Neon Wire',
    family: "'Monoton', cursive",
    googleFont: 'Monoton',
    sample: 'NEON',
    category: 'Neon',
    weight: 'normal',
    letterSpacing: '2px',
    textShadow: '0 0 10px rgba(244, 63, 94, 0.9), 0 0 20px rgba(244, 63, 94, 0.5)',
    description: 'Multi-line luminous glowing neon wire tubes',
  },
  {
    id: 'synthwave-righteous',
    name: 'Synthwave 80s',
    family: "'Righteous', cursive",
    googleFont: 'Righteous',
    sample: 'SYNTHWAVE',
    category: 'Neon',
    weight: 'normal',
    letterSpacing: '1px',
    textShadow: '0 0 6px rgba(236, 72, 153, 0.8)',
    description: 'Outrun 80s synthwave aesthetic',
  },
  {
    id: 'royal-script',
    name: 'Royal Calligraphy',
    family: "'Great Vibes', cursive",
    googleFont: 'Great Vibes',
    sample: 'Royal Calligraphy',
    category: 'Script',
    weight: 'normal',
    letterSpacing: '1.5px',
    textShadow: '0 0 8px rgba(234, 179, 8, 0.7)',
    description: 'Elegant golden cursive calligraphy',
  },
  {
    id: 'street-marker',
    name: 'Street Marker',
    family: "'Permanent Marker', cursive",
    googleFont: 'Permanent Marker',
    sample: 'STREET TAG',
    category: 'Street',
    weight: 'normal',
    letterSpacing: '1px',
    textShadow: '0 2px 4px rgba(0,0,0,0.8)',
    description: 'Bold urban graffiti marker tag',
  },
  {
    id: 'hacker-terminal',
    name: 'Hacker Terminal',
    family: "'Share Tech Mono', 'Fira Code', monospace",
    googleFont: 'Share Tech Mono',
    sample: '$ matrix.init()',
    category: 'Monospace',
    weight: 'normal',
    letterSpacing: '0.5px',
    textShadow: '0 0 6px rgba(16, 185, 129, 0.9)',
    description: 'Monospace cyber terminal console font',
  },
  {
    id: 'bungee-pop',
    name: 'Bungee Pop',
    family: "'Bungee', cursive",
    googleFont: 'Bungee',
    sample: 'BUNGEE POP',
    category: 'Playful',
    weight: 'normal',
    letterSpacing: '1px',
    textShadow: '2px 2px 0px rgba(0,0,0,0.7)',
    description: 'Thick billboard urban pop letters',
  },
  {
    id: 'imperial-gold',
    name: 'Imperial Gold',
    family: "'Cinzel Decorative', serif",
    googleFont: 'Cinzel Decorative',
    sample: 'IMPERIAL',
    category: 'Fantasy',
    weight: '700',
    letterSpacing: '1.5px',
    textShadow: '0 0 8px rgba(234, 179, 8, 0.8)',
    description: 'Ancient Roman imperial decorative serif',
  },
];

export const PRESET_TEXT_GLOWS = [
  { id: 'none', name: 'None', shadow: 'none' },
  { id: 'ember', name: 'Entity Ember', shadow: '0 0 8px rgba(234, 88, 12, 0.9), 0 0 16px rgba(185, 28, 28, 0.6)' },
  { id: 'neon-cyan', name: 'Cyber Neon Cyan', shadow: '0 0 8px rgba(6, 182, 212, 0.9), 0 0 16px rgba(6, 182, 212, 0.5)' },
  { id: 'void-purple', name: 'Void Purple', shadow: '0 0 8px rgba(168, 85, 247, 0.9), 0 0 16px rgba(126, 34, 206, 0.5)' },
  { id: 'matrix-green', name: 'Matrix Emerald', shadow: '0 0 8px rgba(16, 185, 129, 0.9), 0 0 16px rgba(5, 150, 105, 0.6)' },
  { id: 'royal-gold', name: 'Imperial Gold', shadow: '0 0 8px rgba(234, 179, 8, 0.9), 0 0 16px rgba(202, 138, 4, 0.5)' },
  { id: 'hot-pink', name: 'Synthwave Pink', shadow: '0 0 8px rgba(244, 63, 94, 0.9), 0 0 16px rgba(236, 72, 153, 0.6)' },
];

// 6. Vesktop Profile Theme & Gradient Presets
export const PRESET_CARD_THEMES = [
  {
    id: 'midnight-wine',
    name: 'Midnight Wine (Vesktop)',
    gradient: 'linear-gradient(180deg, #420914 0%, #1a0206 100%)',
    primaryColor: '#420914',
    accentColor: '#1a0206',
    description: 'Deep crimson wine burgundy gradient (from Vesktop plugin)',
  },
  {
    id: 'cyber-abyss',
    name: 'Cyberpunk Abyss',
    gradient: 'linear-gradient(180deg, #083344 0%, #030712 100%)',
    primaryColor: '#083344',
    accentColor: '#030712',
    description: 'Dark cyan tech gradient',
  },
  {
    id: 'entity-charcoal',
    name: 'Entity Charcoal',
    gradient: 'linear-gradient(180deg, #3f1a0a 0%, #140803 100%)',
    primaryColor: '#3f1a0a',
    accentColor: '#140803',
    description: 'Charred ember entity gradient',
  },
  {
    id: 'void-violet',
    name: 'Abyssal Violet',
    gradient: 'linear-gradient(180deg, #2e1065 0%, #090214 100%)',
    primaryColor: '#2e1065',
    accentColor: '#090214',
    description: 'Deep cosmic void purple',
  },
  {
    id: 'matrix-emerald',
    name: 'Matrix Emerald',
    gradient: 'linear-gradient(180deg, #022c22 0%, #02120e 100%)',
    primaryColor: '#022c22',
    accentColor: '#02120e',
    description: 'Dark phosphor green terminal',
  },
  {
    id: 'royal-obsidian',
    name: 'Royal Obsidian',
    gradient: 'linear-gradient(180deg, #362203 0%, #0f0901 100%)',
    primaryColor: '#362203',
    accentColor: '#0f0901',
    description: 'Burnished gold and deep obsidian',
  },
];

// 7. Discord 4x3 "Gg" Font Presets matching the "Change Display Name Style" modal
export const DISCORD_FONTS = [
  { id: 'default', name: 'Modern Sans', family: 'var(--font-secondary), sans-serif', sample: 'Gg' },
  { id: 'serif', name: 'Classic Serif', family: "'Cinzel Decorative', Georgia, serif", sample: 'Gg' },
  { id: 'chunky', name: 'Heavy Bold', family: "'Bungee', Impact, sans-serif", sample: 'Gg' },
  { id: 'gothic', name: 'Gothic Fraktur', family: "'UnifrakturMaguntia', 'MedievalSharp', fantasy", sample: 'Gg' },
  { id: 'script', name: 'Calligraphy', family: "'Great Vibes', 'Dancing Script', cursive", sample: 'Gg' },
  { id: 'comic', name: 'Cartoon Pop', family: "'Righteous', cursive", sample: 'Gg' },
  { id: 'pixel', name: 'Arcade 8-Bit', family: "'Press Start 2P', monospace", sample: 'Gg' },
  { id: 'cyber', name: 'Cyberpunk', family: "'Orbitron', sans-serif", sample: 'Gg' },
  { id: 'marker', name: 'Street Marker', family: "'Permanent Marker', cursive", sample: 'Gg' },
  { id: 'mono', name: 'Monospace', family: "'Share Tech Mono', monospace", sample: 'Gg' },
  { id: 'pirate', name: 'Old English', family: "'Pirata One', serif", sample: 'Gg' },
  { id: 'horror', name: 'Entity Horror', family: "'Creepster', cursive", sample: 'Gg' },
];

export const DISCORD_EFFECTS: { id: DisplayNameEffect; label: string }[] = [
  { id: 'solid', label: 'Solid' },
  { id: 'gradient', label: 'Gradient' },
  { id: 'neon', label: 'Neon' },
  { id: 'toon', label: 'Toon' },
  { id: 'pop', label: 'Pop' },
  { id: 'gummy', label: 'Gummy' },
  { id: 'prism', label: 'Prism' },
];

export const DISCORD_COLORS = [
  { id: 'green', hex: '#22c55e', name: 'Toxic Green' },
  { id: 'purple', hex: '#8b5cf6', name: 'Void Purple' },
  { id: 'cyan', hex: '#06b6d4', name: 'Cyber Cyan' },
  { id: 'magenta', hex: '#ec4899', name: 'Hot Pink' },
  { id: 'red', hex: '#ef4444', name: 'Blood Red' },
  { id: 'orange', hex: '#f97316', name: 'Entity Ember' },
  { id: 'yellow', hex: '#eab308', name: 'Imperial Gold' },
  { id: 'white', hex: '#ffffff', name: 'Pure White' },
];

export const DISCORD_GRADIENTS = [
  { id: 'grad-green-cyan', gradient: 'linear-gradient(90deg, #22c55e 0%, #06b6d4 100%)', name: 'Aurora' },
  { id: 'grad-purple-pink', gradient: 'linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%)', name: 'Synthwave' },
  { id: 'grad-sunset', gradient: 'linear-gradient(90deg, #f97316 0%, #eab308 100%)', name: 'Sunset' },
  { id: 'grad-crimson', gradient: 'linear-gradient(90deg, #ef4444 0%, #7f1d1d 100%)', name: 'Crimson Abyss' },
  { id: 'grad-prism', gradient: 'linear-gradient(90deg, #ff007f 0%, #7928ca 25%, #0070f3 50%, #00dfd8 75%, #ff4b4b 100%)', name: 'Prism Rainbow' },
];



