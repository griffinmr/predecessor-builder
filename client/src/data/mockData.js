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
  { id: 'akeron',     name: 'Akeron',        roles: ['jungle', 'offlane'] },
  { id: 'argus',      name: 'Argus',         roles: ['support', 'mid'] },
  { id: 'aurora',     name: 'Aurora',        roles: ['jungle', 'offlane'] },
  { id: 'bayle',      name: 'Bayle',         roles: ['jungle', 'offlane'] },
  { id: 'boris',      name: 'Boris',         roles: ['jungle'] },
  { id: 'countess',   name: 'Countess',      roles: ['jungle', 'mid', 'offlane'] },
  { id: 'crunch',     name: 'Crunch',        roles: ['jungle', 'offlane'] },
  { id: 'dekker',     name: 'Dekker',        roles: ['support'] },
  { id: 'drongo',     name: 'Drongo',        roles: ['adc'] },
  { id: 'eden',       name: 'Eden',          roles: ['adc', 'mid', 'offlane'] },
  { id: 'fengmao',    name: 'Feng Mao',      roles: ['jungle', 'offlane'] },
  { id: 'gadget',     name: 'Gadget',        roles: ['mid'] },
  { id: 'gideon',     name: 'Gideon',        roles: ['mid'] },
  { id: 'greystone',  name: 'Greystone',     roles: ['jungle', 'offlane'] },
  { id: 'grimexe',    name: 'GRIM.exe',      roles: ['adc'] },
  { id: 'grux',       name: 'Grux',          roles: ['jungle', 'offlane'] },
  { id: 'howitzer',   name: 'Howitzer',      roles: ['mid'] },
  { id: 'iggyscorch', name: 'Iggy & Scorch', roles: ['mid', 'offlane'] },
  { id: 'kallari',    name: 'Kallari',       roles: ['jungle'] },
  { id: 'khaimera',   name: 'Khaimera',      roles: ['jungle', 'offlane'] },
  { id: 'kira',       name: 'Kira',          roles: ['adc'] },
  { id: 'kwang',      name: 'Kwang',         roles: ['jungle', 'offlane'] },
  { id: 'ltbelica',   name: 'Lt. Belica',    roles: ['support', 'mid'] },
  { id: 'maco',       name: 'Maco',          roles: ['support', 'mid', 'offlane'] },
  { id: 'morigesh',   name: 'Morigesh',      roles: ['mid'] },
  { id: 'mourn',      name: 'Mourn',         roles: ['support'] },
  { id: 'murdock',    name: 'Murdock',       roles: ['adc', 'offlane'] },
  { id: 'muriel',     name: 'Muriel',        roles: ['support'] },
  { id: 'narbash',    name: 'Narbash',       roles: ['support'] },
  { id: 'phase',      name: 'Phase',         roles: ['support'] },
  { id: 'rampage',    name: 'Rampage',       roles: ['jungle'] },
  { id: 'renna',      name: 'Renna',         roles: ['mid'] },
  { id: 'revenant',   name: 'Revenant',      roles: ['adc'] },
  { id: 'riktor',     name: 'Riktor',        roles: ['support'] },
  { id: 'serath',     name: 'Serath',        roles: ['jungle', 'offlane'] },
  { id: 'sevarog',    name: 'Sevarog',       roles: ['jungle', 'offlane'] },
  { id: 'shinbi',     name: 'Shinbi',        roles: ['jungle', 'offlane'] },
  { id: 'skylar',     name: 'Skylar',        roles: ['adc'] },
  { id: 'sparrow',    name: 'Sparrow',       roles: ['adc'] },
  { id: 'steel',      name: 'Steel',         roles: ['support', 'offlane'] },
  { id: 'terra',      name: 'Terra',         roles: ['jungle', 'offlane'] },
  { id: 'thefey',     name: 'The Fey',       roles: ['support', 'mid'] },
  { id: 'twinblast',  name: 'TwinBlast',     roles: ['adc'] },
  { id: 'wraith',     name: 'Wraith',        roles: ['adc', 'mid'] },
  { id: 'wukong',     name: 'Wukong',        roles: ['jungle', 'offlane'] },
  { id: 'yin',        name: 'Yin',           roles: ['jungle', 'offlane'] },
  { id: 'yurei',      name: 'Yurei',         roles: ['jungle', 'offlane'] },
  { id: 'zarus',      name: 'Zarus',         roles: ['jungle', 'offlane'] },
  { id: 'zinx',       name: 'Zinx',          roles: ['support', 'mid'] },
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
