import { ROLES } from '../data/mockData'

// Role-specific accent colors (Apple-inspired)
const ROLE_ACCENTS = {
  adc:      { bg: 'bg-accent-pink/20', text: 'text-accent-pink', border: 'border-accent-pink' },
  support:  { bg: 'bg-accent-green/20', text: 'text-accent-green', border: 'border-accent-green' },
  jungle:   { bg: 'bg-accent-teal/20', text: 'text-accent-teal', border: 'border-accent-teal' },
  mid:      { bg: 'bg-accent-purple/20', text: 'text-accent-purple', border: 'border-accent-purple' },
  offlane:  { bg: 'bg-accent-orange/20', text: 'text-accent-orange', border: 'border-accent-orange' },
}

export default function RoleSelector({ selectedRole, availableRoles, allowAnyRole = false, onChange }) {
  return (
    <div className="flex flex-wrap gap-3">
      {ROLES.map((role) => {
        const available = allowAnyRole || availableRoles.includes(role.id)
        const selected  = selectedRole === role.id
        const accent    = ROLE_ACCENTS[role.id]

        return (
          <button
            key={role.id}
            type="button"
            onClick={() => available && onChange(role.id)}
            disabled={!available}
            className={[
              'group relative px-6 py-3 rounded-xl border text-sm font-medium btn-transition focus-ring',
              selected
                ? `${accent.bg} ${accent.text} ${accent.border}`
                : available
                  ? 'glass text-theme-primary border-theme'
                  : 'glass opacity-40 text-theme-muted border-theme cursor-not-allowed',
            ].join(' ')}
          >
            <span className="block">{role.label}</span>
            <span className={`block text-xs mt-0.5 font-normal ${selected ? 'opacity-70' : 'text-theme-muted'}`}>
              {role.fullName}
            </span>

            {/* Selected indicator dot */}
            {selected && (
              <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${accent.text.replace('text-', 'bg-')} animate-scale-in`} />
            )}
          </button>
        )
      })}
    </div>
  )
}
