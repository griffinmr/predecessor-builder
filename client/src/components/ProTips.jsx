import { useState } from 'react'

// Role-specific pro tips data
const ROLE_TIPS = {
  adc: {
    emoji: '🏹',
    title: 'Carry',
    subtitle: 'ADC / Duo Lane DPS',
    tagline: 'Scale, survive, melt objectives and heroes late game.',
    tips: [
      'Farm > fighting early — gold is your real power spike.',
      'Last-hit consistently; missed minions hurt more than missed kills.',
      'Let your Support initiate — you follow up, not lead.',
      'Always track the enemy jungler before pushing past river.',
      'Position behind your frontline in fights, never beside it.',
      'Hit the closest safe target, not always the backline.',
      'Use terrain height to break line-of-sight against divers.',
      'Buy lifesteal/on-hit earlier if you\'re being poked out of lane.',
      'After winning a fight, help take towers or Fangtooth, not jungle camps.',
      'Late game: dying once can lose the match — play patiently.',
    ],
  },
  support: {
    emoji: '🛡️',
    title: 'Support',
    subtitle: 'Duo Lane Utility / Engage',
    tagline: 'Enable carries, control vision, start or stop fights.',
    tips: [
      'Protect your Carry early — their farm matters more than yours.',
      'Trade health so your Carry doesn\'t have to.',
      'Use fog walls and jungle entrances to threaten engages.',
      'Don\'t randomly push waves — control the lane pace.',
      'Save peel abilities for enemy divers, not tanks.',
      'Rotate mid after lane phase to create numbers advantages.',
      'Ping constantly — information is half your value.',
      'Zone enemies away from objectives, don\'t chase kills.',
      'Stand between threats and your Carry during fights.',
      'A good disengage wins more games than flashy engages.',
    ],
  },
  mid: {
    emoji: '🔥',
    title: 'Mid',
    subtitle: 'Mage / Assassin / Burst',
    tagline: 'Control tempo, pressure the map, win team fights.',
    tips: [
      'Clear waves fast so you can rotate first.',
      'Watch side lanes — your rotations decide early skirmishes.',
      'Don\'t overcommit your escape unless you see the jungler.',
      'Play around vision control near river and objectives.',
      'Save burst for priority targets, not tanks.',
      'Use verticality to land skillshots safely.',
      'Help secure Fangtooth whenever possible.',
      'If behind, wave-clear and stall — don\'t force fights.',
      'Coordinate ultimates with jungle or support engages.',
      'Late game, positioning > damage numbers.',
    ],
  },
  offlane: {
    emoji: '🪓',
    title: 'Offlane',
    subtitle: 'Solo / Bruiser / Tank',
    tagline: 'Absorb pressure, threaten flanks, control side lanes.',
    tips: [
      'Learn when to trade and when to farm safely.',
      'Use lane freezes near your tower to deny farm.',
      'Don\'t chase kills — lane advantage matters more.',
      'Ward deep to spot jungle pressure early.',
      'Build defensively if you\'re being camped.',
      'Rotate only when it leads to objectives, not random fights.',
      'Split push when your teleport or escape is ready.',
      'In team fights, pressure carries without dying.',
      'Peel if your backline is being dove.',
      'You create space — even without kills.',
    ],
  },
  jungle: {
    emoji: '🌲',
    title: 'Jungle',
    subtitle: 'Map Control / Objective Control',
    tagline: 'Control objectives, pressure lanes, dictate pace.',
    tips: [
      'Efficient clears matter more than forced ganks.',
      'Track enemy jungler by watching lane behavior.',
      'Gank lanes with setup (CC), not just low health.',
      'Secure Fangtooth whenever you have numbers advantage.',
      'Don\'t show on the map unnecessarily.',
      'Counter-gank wins more games than blind aggression.',
      'Ping before ganking — coordination is everything.',
      'Give buffs to teammates when appropriate.',
      'Smite timing decides objectives — don\'t rush it.',
      'Late game: protect carries, don\'t chase solo kills.',
    ],
  },
}

// Role accent colors (matching RoleSelector)
const ROLE_ACCENTS = {
  adc:      { bg: 'bg-accent-pink/10', border: 'border-accent-pink/30', text: 'text-accent-pink', bullet: 'bg-accent-pink' },
  support:  { bg: 'bg-accent-green/10', border: 'border-accent-green/30', text: 'text-accent-green', bullet: 'bg-accent-green' },
  jungle:   { bg: 'bg-accent-teal/10', border: 'border-accent-teal/30', text: 'text-accent-teal', bullet: 'bg-accent-teal' },
  mid:      { bg: 'bg-accent-purple/10', border: 'border-accent-purple/30', text: 'text-accent-purple', bullet: 'bg-accent-purple' },
  offlane:  { bg: 'bg-accent-orange/10', border: 'border-accent-orange/30', text: 'text-accent-orange', bullet: 'bg-accent-orange' },
}

export default function ProTips({ role }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!role || !ROLE_TIPS[role]) return null

  const data = ROLE_TIPS[role]
  const accent = ROLE_ACCENTS[role]
  const visibleTips = isExpanded ? data.tips : data.tips.slice(0, 3)

  return (
    <div className={`mt-6 rounded-2xl border ${accent.border} ${accent.bg} overflow-hidden animate-fade-in`}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3">
        <span className="text-2xl">{data.emoji}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold ${accent.text}`}>{data.title} Pro Tips</h3>
            <span className="text-xs text-theme-muted">• {data.subtitle}</span>
          </div>
          <p className="text-sm text-theme-secondary mt-0.5">{data.tagline}</p>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium btn-transition ${accent.text} hover:${accent.bg}`}
        >
          {isExpanded ? 'Show less' : `+${data.tips.length - 3} more`}
        </button>
      </div>

      {/* Tips List */}
      <div className="px-5 pb-4">
        <ul className="space-y-2">
          {visibleTips.map((tip, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-sm text-theme-primary"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${accent.bullet} mt-1.5 flex-shrink-0`} />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
