// ─── Roles ──────────────────────────────────────────────────────────────────
export const ROLES = [
  { id: 'adc',      label: 'ADC',      fullName: 'Attack Damage Carry' },
  { id: 'support', label: 'Support', fullName: 'Support' },
  { id: 'jungle',  label: 'Jungle',  fullName: 'Jungle' },
  { id: 'mid',     label: 'Mid',     fullName: 'Mid Lane' },
  { id: 'offlane', label: 'Offlane', fullName: 'Off Lane' },
]

// Tailwind colour tokens per role – Apple-inspired accent colors
export const ROLE_COLORS = {
  adc:      { text: 'text-accent-pink',   bg: 'bg-accent-pink/20',   border: 'border-accent-pink',   ring: 'ring-accent-pink' },
  support:  { text: 'text-accent-green',  bg: 'bg-accent-green/20',  border: 'border-accent-green',  ring: 'ring-accent-green' },
  jungle:   { text: 'text-accent-teal',   bg: 'bg-accent-teal/20',   border: 'border-accent-teal',   ring: 'ring-accent-teal' },
  mid:      { text: 'text-accent-purple', bg: 'bg-accent-purple/20', border: 'border-accent-purple', ring: 'ring-accent-purple' },
  offlane:  { text: 'text-accent-orange', bg: 'bg-accent-orange/20', border: 'border-accent-orange', ring: 'ring-accent-orange' },
}

// ─── Characters ─────────────────────────────────────────────────────────────
// Each character lists every role they can viably fill.
// Character images will eventually live in /public/assets/characters/<id>.png
export const CHARACTERS = [
  { id: 'akeron',     name: 'Akeron',        roles: ['jungle', 'offlane'], heroId: 47 },
  { id: 'argus',      name: 'Argus',         roles: ['support', 'mid'], heroId: 34 },
  { id: 'aurora',     name: 'Aurora',        roles: ['jungle', 'offlane'], heroId: 36 },
  { id: 'bayle',      name: 'Bayle',         roles: ['jungle', 'offlane'], heroId: 48 },
  { id: 'boris',      name: 'Boris',         roles: ['jungle'], heroId: 42 },
  { id: 'countess',   name: 'Countess',      roles: ['jungle', 'mid', 'offlane'], heroId: 21 },
  { id: 'crunch',     name: 'Crunch',        roles: ['jungle', 'offlane'], heroId: 1 },
  { id: 'dekker',     name: 'Dekker',        roles: ['support'], heroId: 2 },
  { id: 'drongo',     name: 'Drongo',        roles: ['adc'], heroId: 3 },
  { id: 'eden',       name: 'Eden',          roles: ['adc', 'mid', 'offlane'], heroId: 49 },
  { id: 'fengmao',    name: 'Feng Mao',      roles: ['jungle', 'offlane'], heroId: 4 },
  { id: 'gadget',     name: 'Gadget',        roles: ['mid'], heroId: 6 },
  { id: 'gideon',     name: 'Gideon',        roles: ['mid'], heroId: 7 },
  { id: 'greystone',  name: 'Greystone',     roles: ['jungle', 'offlane'], heroId: 27 },
  { id: 'grimexe',    name: 'GRIM.exe',      roles: ['adc'], heroId: 35 },
  { id: 'grux',       name: 'Grux',          roles: ['jungle', 'offlane'], heroId: 8 },
  { id: 'howitzer',   name: 'Howitzer',      roles: ['mid'], heroId: 9 },
  { id: 'iggyscorch', name: 'Iggy & Scorch', roles: ['mid', 'offlane'], heroId: 32 },
  { id: 'kallari',    name: 'Kallari',       roles: ['jungle'], heroId: 10 },
  { id: 'khaimera',   name: 'Khaimera',      roles: ['jungle', 'offlane'], heroId: 11 },
  { id: 'kira',       name: 'Kira',          roles: ['adc'], heroId: 24 },
  { id: 'kwang',      name: 'Kwang',         roles: ['jungle', 'offlane'], heroId: 33 },
  { id: 'ltbelica',   name: 'Lt. Belica',    roles: ['support', 'mid'], heroId: 12 },
  { id: 'maco',       name: 'Maco',          roles: ['support', 'mid', 'offlane'], heroId: 50 },
  { id: 'morigesh',   name: 'Morigesh',      roles: ['mid'], heroId: 26 },
  { id: 'mourn',      name: 'Mourn',         roles: ['support'], heroId: 41 },
  { id: 'murdock',    name: 'Murdock',       roles: ['adc', 'offlane'], heroId: 13 },
  { id: 'muriel',     name: 'Muriel',        roles: ['support'], heroId: 14 },
  { id: 'narbash',    name: 'Narbash',       roles: ['support'], heroId: 15 },
  { id: 'phase',      name: 'Phase',         roles: ['support'], heroId: 25 },
  { id: 'rampage',    name: 'Rampage',       roles: ['jungle'], heroId: 16 },
  { id: 'renna',      name: 'Renna',         roles: ['mid'], heroId: 46 },
  { id: 'revenant',   name: 'Revenant',      roles: ['adc'], heroId: 22 },
  { id: 'riktor',     name: 'Riktor',        roles: ['support'], heroId: 17 },
  { id: 'serath',     name: 'Serath',        roles: ['jungle', 'offlane'], heroId: 30 },
  { id: 'sevarog',    name: 'Sevarog',       roles: ['jungle', 'offlane'], heroId: 18 },
  { id: 'shinbi',     name: 'Shinbi',        roles: ['jungle', 'offlane'], heroId: 23 },
  { id: 'skylar',     name: 'Skylar',        roles: ['adc'], heroId: 39 },
  { id: 'sparrow',    name: 'Sparrow',       roles: ['adc'], heroId: 19 },
  { id: 'steel',      name: 'Steel',         roles: ['support', 'offlane'], heroId: 20 },
  { id: 'terra',      name: 'Terra',         roles: ['jungle', 'offlane'], heroId: 37 },
  { id: 'thefey',     name: 'The Fey',       roles: ['support', 'mid'], heroId: 5 },
  { id: 'twinblast',  name: 'TwinBlast',     roles: ['adc'], heroId: 28 },
  { id: 'wraith',     name: 'Wraith',        roles: ['adc', 'mid'], heroId: 31 },
  { id: 'wukong',     name: 'Wukong',        roles: ['jungle', 'offlane'], heroId: 43 },
  { id: 'yin',        name: 'Yin',           roles: ['jungle', 'offlane'], heroId: 40 },
  { id: 'yurei',      name: 'Yurei',         roles: ['jungle', 'offlane'], heroId: 44 },
  { id: 'zarus',      name: 'Zarus',         roles: ['jungle', 'offlane'], heroId: 29 },
  { id: 'zinx',       name: 'Zinx',          roles: ['support', 'mid'], heroId: 38 },
]

// ─── Character card gradients ───────────────────────────────────────────────
// Inline-style gradients so Tailwind's purge step can't strip them.
// Swap in <img> when real character art is available.
export const CHARACTER_GRADIENTS = [
  { from: '#0f0505', to: '#7f1d1d' }, // deep red
  { from: '#050f1a', to: '#1e3a5f' }, // navy
  { from: '#150512', to: '#4c1d95' }, // violet
  { from: '#051510', to: '#14532d' }, // forest
  { from: '#1a0f05', to: '#7f2d1d' }, // burnt orange
  { from: '#051a17', to: '#134e4a' }, // teal
  { from: '#1a0510', to: '#831843' }, // magenta
  { from: '#050f1a', to: '#312e81' }, // indigo
  { from: '#1a1005', to: '#713f12' }, // amber
  { from: '#051a1a', to: '#164e63' }, // cyan
  { from: '#1a0508', to: '#881337' }, // rose
  { from: '#0a051a', to: '#4c1d95' }, // purple
  { from: '#0a1a05', to: '#365314' }, // lime
  { from: '#1a051a', to: '#701a75' }, // fuchsia
]
