import { CHARACTER_GRADIENTS, CHARACTERS, ROLE_COLORS, ROLES } from '../data/mockData'

// Map character names to image file names (handles special cases)
function getImageName(name) {
  if (name === 'GRIM.exe') return 'Grim'
  return name
}

export default function CharacterCard({ character, isSelected, onClick, disabled, variant = 'default' }) {
  const index    = CHARACTERS.findIndex((c) => c.id === character.id)
  const gradient = CHARACTER_GRADIENTS[index % CHARACTER_GRADIENTS.length]
  const roleId   = character.roles[0]
  const roleColor = ROLE_COLORS[roleId]
  const role      = ROLES.find((r) => r.id === roleId)

  // Different accent colors for enemy variant
  const isEnemy = variant === 'enemy' && isSelected

  // Character image path
  const imageName = getImageName(character.name)
  const imagePath = `/characters/${imageName}.png`

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'group relative flex flex-col rounded-2xl overflow-hidden',
        'border btn-transition focus-ring glass',
        isSelected
          ? isEnemy
            ? 'border-accent-pink ring-2 ring-accent-pink/30 scale-[1.02]'
            : 'border-accent-blue ring-2 ring-accent-blue/30 scale-[1.02]'
          : 'border-theme hover:scale-[1.02]',
        disabled
          ? 'opacity-30 cursor-not-allowed hover:scale-100'
          : 'cursor-pointer',
      ].join(' ')}
    >
      {/* ── character image ── */}
      <div
        className="w-full aspect-square relative"
        style={{ background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})` }}
      >
        <img
          src={imagePath}
          alt={character.name}
          className="absolute inset-0 w-full h-full object-cover object-[center_1%] group-hover:scale-105 btn-transition"
        />

        {/* subtle inner glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* selected check badge */}
        {isSelected && (
          <div className={[
            'absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center shadow-lg animate-scale-in',
            isEnemy ? 'bg-accent-pink' : 'bg-accent-blue'
          ].join(' ')}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>

      {/* ── name + role badge ── */}
      <div className="p-3 text-center">
        <p className="text-theme-primary text-sm font-medium truncate">{character.name}</p>
        <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-1.5 ${roleColor.bg} ${roleColor.text}`}>
          {role?.label}
        </span>
      </div>
    </button>
  )
}
