import { useState, useEffect, useCallback, useRef } from 'react'

import Header             from './Header'
import ParallaxBackground from './ParallaxBackground'
import ScrollToTop        from './ScrollToTop'
import GlowingTitle       from './GlowingTitle'
import { getCommunityBuilds, getHeroes, getHeroStats } from '../services/api'
import { ROLE_COLORS }    from '../data/mockData'

// ─── Role config for omeda.city API ──────────────────────────────────────────
// Omeda uses "carry" / "midlane"; our UI shows "ADC" / "Mid"
const ROLES = [
  { id: 'carry',   label: 'Carry',   uiLabel: 'ADC' },
  { id: 'support', label: 'Support', uiLabel: 'Support' },
  { id: 'jungle',  label: 'Jungle',  uiLabel: 'Jungle' },
  { id: 'midlane', label: 'Midlane', uiLabel: 'Mid' },
  { id: 'offlane', label: 'Offlane', uiLabel: 'Offlane' },
]

// Map omeda role ids to our ROLE_COLORS keys
const ROLE_COLOR_MAP = {
  carry:   'adc',
  support: 'support',
  jungle:  'jungle',
  midlane: 'mid',
  offlane: 'offlane',
}

const SORT_OPTIONS = [
  {
    id: 'trending', label: 'Trending',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    color: 'from-accent-orange to-accent-pink',
    glow: 'shadow-accent-orange/25',
    text: 'text-accent-orange',
    bg: 'bg-accent-orange/10',
    border: 'border-accent-orange/40',
  },
  {
    id: 'popular', label: 'Popular',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
      </svg>
    ),
    color: 'from-accent-pink to-accent-purple',
    glow: 'shadow-accent-pink/25',
    text: 'text-accent-pink',
    bg: 'bg-accent-pink/10',
    border: 'border-accent-pink/40',
  },
  {
    id: 'latest', label: 'Latest',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'from-accent-blue to-accent-teal',
    glow: 'shadow-accent-blue/25',
    text: 'text-accent-blue',
    bg: 'bg-accent-blue/10',
    border: 'border-accent-blue/40',
  },
]

// ─── Hero Picker Modal ───────────────────────────────────────────────────────
function HeroPickerModal({ heroes, onSelect, onClose }) {
  const [search, setSearch] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const filtered = search
    ? heroes.filter((h) => h.name.toLowerCase().includes(search.toLowerCase()))
    : heroes

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl max-h-[80vh] flex flex-col glass rounded-2xl border border-theme overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-theme">
          <h3 className="text-lg font-semibold text-theme-primary">Select Hero</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 btn-transition text-theme-secondary"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-theme">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search heroes..."
            className="w-full px-4 py-2.5 rounded-xl input-theme text-sm focus-ring"
          />
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <p className="text-center text-theme-muted py-8 text-sm">No heroes found</p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
              {filtered.map((hero) => (
                <button
                  key={hero.id}
                  onClick={() => { onSelect(hero); onClose() }}
                  className="group flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/[0.08] btn-transition focus-ring"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 border border-white/10 group-hover:border-accent-blue/40 btn-transition">
                    {hero.image ? (
                      <img
                        src={hero.image}
                        alt={hero.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-theme-muted text-xs">
                        {hero.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-theme-secondary group-hover:text-theme-primary btn-transition text-center leading-tight truncate w-full">
                    {hero.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Role Chip ───────────────────────────────────────────────────────────────
function RoleChip({ role, active, onClick }) {
  const colorKey = ROLE_COLOR_MAP[role.id] || 'support'
  const colors   = ROLE_COLORS[colorKey] || ROLE_COLORS.support

  return (
    <button
      onClick={onClick}
      className={[
        'px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide btn-transition border',
        active
          ? `${colors.text} ${colors.bg} ${colors.border}`
          : 'text-theme-secondary border-transparent hover:text-theme-primary hover:bg-white/[0.05]',
      ].join(' ')}
    >
      {role.uiLabel}
    </button>
  )
}

// ─── Item Detail Modal ──────────────────────────────────────────────────────
const RARITY_THEME = {
  Common:    { color: '#86868b', glow: 'rgba(134,134,139,0.3)',  text: 'text-theme-secondary', bg: 'bg-white/5',           border: 'border-white/10' },
  Uncommon:  { color: '#30d158', glow: 'rgba(48,209,88,0.35)',   text: 'text-accent-green',    bg: 'bg-accent-green/10',    border: 'border-accent-green/25' },
  Rare:      { color: '#0071e3', glow: 'rgba(0,113,227,0.35)',   text: 'text-accent-blue',     bg: 'bg-accent-blue/10',     border: 'border-accent-blue/25' },
  Epic:      { color: '#bf5af2', glow: 'rgba(191,90,242,0.35)',  text: 'text-accent-purple',   bg: 'bg-accent-purple/10',   border: 'border-accent-purple/25' },
  Legendary: { color: '#ff9f0a', glow: 'rgba(255,159,10,0.35)',  text: 'text-accent-orange',   bg: 'bg-accent-orange/10',   border: 'border-accent-orange/25' },
}

function ItemDetailModal({ item, onClose }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!item) return null

  const theme = RARITY_THEME[item.rarity] || RARITY_THEME.Common

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-sm rounded-2xl overflow-hidden animate-scale-in"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: `1px solid ${theme.color}33`,
          boxShadow: `0 0 40px ${theme.glow}, 0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)`,
        }}
      >
        {/* ── Image hero area ── */}
        <div className="relative h-52 overflow-hidden">
          {/* Background image */}
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#0a0a14] flex items-center justify-center">
              <span className="text-6xl font-light text-white/10">{item.name?.charAt(0)}</span>
            </div>
          )}

          {/* Bottom gradient fade into content */}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

          {/* Rarity-tinted top edge */}
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${theme.color}80, transparent)` }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 hover:bg-black/70 btn-transition text-white/60 hover:text-white backdrop-blur-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Item name + rarity overlay on image */}
          <div className="absolute bottom-0 inset-x-0 px-5 pb-4">
            <h3 className="text-xl font-bold text-white tracking-tight leading-tight drop-shadow-lg">
              {item.name}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              {/* Rarity badge */}
              {item.rarity && (
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                  style={{
                    background: `${theme.color}18`,
                    color: theme.color,
                    border: `1px solid ${theme.color}40`,
                    boxShadow: `0 0 8px ${theme.color}15`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: theme.color, boxShadow: `0 0 4px ${theme.color}` }}
                  />
                  {item.rarity}
                </span>
              )}

              {/* Slot type */}
              {item.slot_type && (
                <span className="text-[10px] font-medium text-white/50 uppercase tracking-wider">
                  {item.slot_type}
                </span>
              )}

              {/* Spacer */}
              <div className="flex-1" />

              {/* Price */}
              {item.price && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent-gold">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2" />
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                    <text x="12" y="16" textAnchor="middle" fontSize="12" fontWeight="bold" fill="currentColor">G</text>
                  </svg>
                  {item.price.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Content area ── */}
        <div className="px-5 pb-5 pt-3 space-y-4 max-h-[50vh] overflow-y-auto">
          {/* Stats grid */}
          {item.stats && item.stats.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: `${theme.color}20` }}>
                  <svg className="w-2.5 h-2.5" fill="none" stroke={theme.color} viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h2v8H3zM9 9h2v12H9zM15 5h2v16h-2zM21 1h2v20h-2z" />
                  </svg>
                </div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-theme-muted">Stats</h4>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {item.stats.map((stat, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 py-2 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <span className="text-xs text-theme-secondary capitalize">{stat.label}</span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: theme.color }}
                    >
                      +{stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Effects */}
          {item.effects && item.effects.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: 'rgba(255,214,10,0.15)' }}>
                  <svg className="w-2.5 h-2.5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-theme-muted">Effects</h4>
              </div>
              <div className="space-y-2">
                {item.effects.map((effect, i) => (
                  <div
                    key={i}
                    className="px-3 py-2.5 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    {effect.name && (
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-1 h-1 rounded-full bg-accent-gold" />
                        <span className="text-[11px] font-bold text-accent-gold">{effect.name}</span>
                      </div>
                    )}
                    <p className="text-[11px] text-theme-secondary leading-relaxed">
                      {effect.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fallback if no stats or effects */}
          {(!item.stats || item.stats.length === 0) && (!item.effects || item.effects.length === 0) && (
            <div className="text-center py-6">
              <p className="text-xs text-theme-muted italic">No detailed stats available for this item.</p>
            </div>
          )}
        </div>

        {/* Bottom rarity accent line */}
        <div
          className="h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${theme.color}50, transparent)` }}
        />
      </div>
    </div>
  )
}

// ─── Hero Detail Modal ──────────────────────────────────────────────────
const ROLE_LABEL_MAP = {
  carry: 'ADC', support: 'Support', jungle: 'Jungle', midlane: 'Mid', offlane: 'Offlane',
}

function WinRateBar({ rate }) {
  const pct = rate.toFixed(1)
  const color = rate >= 55 ? '#34d399' : rate >= 50 ? '#60a5fa' : rate >= 45 ? '#fbbf24' : '#f472b6'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(rate, 100)}%`, background: color }} />
      </div>
      <span className="text-xs font-bold min-w-[40px] text-right" style={{ color }}>{pct}%</span>
    </div>
  )
}

function HeroDetailModal({ hero, onClose, onFilterByHero }) {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    if (!hero?.id) return
    setLoading(true)
    setError(null)
    getHeroStats(hero.id)
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [hero?.id])

  if (!hero) return null

  const avgGameMin = stats?.avg_game_duration ? (stats.avg_game_duration / 60).toFixed(0) : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-sm rounded-2xl overflow-hidden animate-scale-in"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(96,165,250,0.25)',
          boxShadow: '0 0 40px rgba(96,165,250,0.15), 0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Hero image */}
        <div className="relative h-52 overflow-hidden">
          {hero.image ? (
            <img src={hero.image} alt={hero.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#0a0a14] flex items-center justify-center">
              <span className="text-6xl font-light text-white/10">{hero.name?.charAt(0)}</span>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(96,165,250,0.5), transparent)' }} />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 hover:bg-black/70 btn-transition text-white/60 hover:text-white backdrop-blur-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Hero name + roles overlay */}
          <div className="absolute bottom-0 inset-x-0 px-5 pb-4">
            <h3 className="text-xl font-bold text-white tracking-tight leading-tight drop-shadow-lg">
              {hero.name}
            </h3>
            {hero.roles && hero.roles.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                {hero.roles.map((role) => {
                  const colorKey = ROLE_COLOR_MAP[role] || 'support'
                  const colors   = ROLE_COLORS[colorKey] || ROLE_COLORS.support
                  return (
                    <span key={role} className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${colors.text} ${colors.bg}`}>
                      {ROLE_LABEL_MAP[role] || role}
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Stats content */}
        <div className="px-5 pb-5 pt-3 space-y-4 max-h-[50vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-white/10 border-t-accent-blue rounded-full animate-spin" />
            </div>
          ) : error ? (
            <p className="text-center text-accent-pink text-xs py-4">{error}</p>
          ) : stats ? (
            <>
              {/* Win Rate + Pick Rate row */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 rounded flex items-center justify-center bg-accent-blue/20">
                    <svg className="w-2.5 h-2.5 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h2v8H3zM9 9h2v12H9zM15 5h2v16h-2zM21 1h2v20h-2z" />
                    </svg>
                  </div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-theme-muted">Ranked Stats (Last Month)</h4>
                </div>

                <div className="space-y-2.5">
                  {/* Win Rate */}
                  <div className="px-3 py-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-theme-secondary">Win Rate</span>
                    </div>
                    <WinRateBar rate={stats.winrate} />
                  </div>

                  {/* Pick Rate */}
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span className="text-xs text-theme-secondary">Pick Rate</span>
                    <span className="text-xs font-bold text-accent-blue">{stats.pickrate.toFixed(1)}%</span>
                  </div>

                  {/* Match Count */}
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span className="text-xs text-theme-secondary">Matches</span>
                    <span className="text-xs font-bold text-theme-primary">{Math.round(stats.match_count).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* KDA */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.15)' }}>
                    <svg className="w-2.5 h-2.5 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-theme-muted">Combat Averages</h4>
                </div>

                {/* KDA display */}
                <div className="px-3 py-3 rounded-lg mb-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="flex items-center justify-center gap-1 text-lg">
                    <span className="font-bold text-emerald-400">{stats.kills ? (stats.kills / stats.match_count).toFixed(1) : '—'}</span>
                    <span className="text-white/20">/</span>
                    <span className="font-bold text-rose-400">{stats.deaths ? (stats.deaths / stats.match_count).toFixed(1) : '—'}</span>
                    <span className="text-white/20">/</span>
                    <span className="font-bold text-sky-400">{stats.assists ? (stats.assists / stats.match_count).toFixed(1) : '—'}</span>
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-1">
                    <span className="text-[9px] text-white/30 uppercase tracking-wider">K / D / A</span>
                    <span className="text-[9px] text-white/10">|</span>
                    <span className="text-xs font-bold" style={{ color: stats.avg_kdar >= 3 ? '#34d399' : stats.avg_kdar >= 2 ? '#60a5fa' : '#fbbf24' }}>
                      {stats.avg_kdar.toFixed(2)} KDA
                    </span>
                  </div>
                </div>

                {/* Other combat stats */}
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span className="text-[11px] text-theme-secondary">CS/min</span>
                    <span className="text-[11px] font-bold text-theme-primary">{stats.avg_cs?.toFixed(1) || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span className="text-[11px] text-theme-secondary">Gold/min</span>
                    <span className="text-[11px] font-bold text-amber-400">{Math.round(stats.avg_gold || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span className="text-[11px] text-theme-secondary">Dmg Dealt</span>
                    <span className="text-[11px] font-bold text-accent-orange">{Math.round(stats.avg_damage_dealt_to_heroes || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span className="text-[11px] text-theme-secondary">Dmg Taken</span>
                    <span className="text-[11px] font-bold text-accent-pink">{Math.round(stats.avg_damage_taken_from_heroes || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span className="text-[11px] text-theme-secondary">Perf Score</span>
                    <span className="text-[11px] font-bold text-accent-purple">{stats.avg_performance_score?.toFixed(0) || '—'}</span>
                  </div>
                  {avgGameMin && (
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <span className="text-[11px] text-theme-secondary">Avg Game</span>
                      <span className="text-[11px] font-bold text-theme-primary">{avgGameMin}m</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-xs text-theme-muted italic py-4">No statistics available for this hero.</p>
          )}

          {/* Filter builds button */}
          <button
            onClick={() => { onFilterByHero(hero); onClose() }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
              text-accent-blue bg-accent-blue/10 border border-accent-blue/30
              hover:bg-accent-blue/20 btn-transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            View {hero.name} Builds
          </button>
        </div>

        {/* Bottom accent */}
        <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(96,165,250,0.3), transparent)' }} />
      </div>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const SKILL_COLORS = {
  1: { bg: 'bg-accent-blue/20',   text: 'text-accent-blue',   dot: 'bg-accent-blue',   label: 'Q' },
  2: { bg: 'bg-accent-green/20',  text: 'text-accent-green',  dot: 'bg-accent-green',  label: 'W' },
  3: { bg: 'bg-accent-orange/20', text: 'text-accent-orange', dot: 'bg-accent-orange', label: 'E' },
  4: { bg: 'bg-accent-purple/20', text: 'text-accent-purple', dot: 'bg-accent-purple', label: 'R' },
}

const ITEM_RARITY_BORDER = {
  Common:    'border-white/10',
  Uncommon:  'border-accent-green/30',
  Rare:      'border-accent-blue/30',
  Epic:      'border-accent-purple/30',
  Legendary: 'border-accent-orange/30',
}

function timeAgo(dateStr) {
  if (!dateStr) return null
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

// ─── Skill Order Row ─────────────────────────────────────────────────────────
function SkillOrderRow({ skillOrder }) {
  if (!skillOrder || skillOrder.length === 0) return null
  return (
    <div className="flex items-center gap-0.5">
      {skillOrder.map((skill, i) => {
        const s = SKILL_COLORS[skill] || SKILL_COLORS[1]
        return (
          <div
            key={i}
            className={`w-4 h-4 rounded-sm flex items-center justify-center text-[7px] font-black ${s.bg} ${s.text}`}
            title={`Level ${i + 1}: ${s.label}`}
          >
            {s.label}
          </div>
        )
      })}
    </div>
  )
}

// ─── Build Card ──────────────────────────────────────────────────────────────
const DESC_CHAR_LIMIT = 200

function BuildCard({ build, index, visible, onItemClick, onHeroClick }) {
  const [expanded, setExpanded] = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)
  const colorKey = ROLE_COLOR_MAP[build.role] || 'support'
  const colors   = ROLE_COLORS[colorKey] || ROLE_COLORS.support
  const net      = build.upvotes - build.downvotes
  const roleLabel = ROLES.find((r) => r.id === build.role)?.uiLabel || build.role

  // Pick a role-specific border color for the card accent
  const roleBorderColor = {
    adc:     'border-accent-pink/30',
    support: 'border-accent-green/30',
    jungle:  'border-accent-teal/30',
    mid:     'border-accent-purple/30',
    offlane: 'border-accent-orange/30',
  }[colorKey] || 'border-accent-blue/30'

  const roleGlowColor = {
    adc:     'hover:shadow-accent-pink/8',
    support: 'hover:shadow-accent-green/8',
    jungle:  'hover:shadow-accent-teal/8',
    mid:     'hover:shadow-accent-purple/8',
    offlane: 'hover:shadow-accent-orange/8',
  }[colorKey] || 'hover:shadow-accent-blue/8'

  const roleAccentLine = {
    adc:     'from-transparent via-accent-pink/50 to-transparent',
    support: 'from-transparent via-accent-green/50 to-transparent',
    jungle:  'from-transparent via-accent-teal/50 to-transparent',
    mid:     'from-transparent via-accent-purple/50 to-transparent',
    offlane: 'from-transparent via-accent-orange/50 to-transparent',
  }[colorKey] || 'from-transparent via-accent-blue/50 to-transparent'

  return (
    <div
      className={[
        'glass rounded-2xl border overflow-hidden btn-transition group relative',
        roleBorderColor,
        `hover:shadow-xl ${roleGlowColor}`,
        visible ? 'animate-slide-up opacity-100' : 'opacity-0 translate-y-4',
      ].join(' ')}
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
    >
      {/* Role-colored top accent line */}
      <div className={`h-px bg-gradient-to-r ${roleAccentLine}`} />

      {/* ── Main card content ── */}
      <div className="p-4">
        {/* Top section: Hero + Info */}
        <div className="flex gap-4">
          {/* Hero portrait — larger with role-colored ring */}
          <div className="flex-shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onHeroClick?.(build.hero) }}
              className={`relative w-20 h-20 rounded-xl overflow-hidden bg-white/5 border-2 ${roleBorderColor} hover:scale-105 btn-transition cursor-pointer`}
              title={build.hero?.name || 'Unknown hero'}
            >
              {build.hero?.image ? (
                <img
                  src={build.hero.image}
                  alt={build.hero.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-theme-muted text-xl font-bold">
                  ?
                </div>
              )}
              {/* Role badge overlay on portrait */}
              <div className="absolute bottom-0 inset-x-0 flex justify-center pb-0.5">
                <span className={`px-1.5 py-px rounded text-[8px] font-black uppercase tracking-wider ${colors.text} backdrop-blur-sm`}
                  style={{ background: 'rgba(0,0,0,0.6)' }}
                >
                  {roleLabel}
                </span>
              </div>
            </button>
          </div>

          {/* Title + meta */}
          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-bold text-theme-primary leading-tight line-clamp-1">
                {build.title}
              </h3>
              {/* Vote score pill */}
              <div
                className={[
                  'flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold',
                  net > 0
                    ? 'text-accent-green bg-accent-green/10'
                    : net < 0
                      ? 'text-accent-pink bg-accent-pink/10'
                      : 'text-theme-muted bg-white/5',
                ].join(' ')}
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  {net >= 0 ? (
                    <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
                  )}
                </svg>
                {net > 0 ? `+${net}` : net}
              </div>
            </div>

            {/* Author + timestamp */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-theme-secondary font-medium">
                {build.hero?.name || 'Unknown'}
              </span>
              <span className="text-white/10">·</span>
              <span className="text-[11px] text-theme-muted">
                by {build.author || 'Anonymous'}
              </span>
              {build.updated_at && (
                <>
                  <span className="text-white/10">·</span>
                  <span className="text-[11px] text-theme-muted">
                    {timeAgo(build.updated_at)}
                  </span>
                </>
              )}
            </div>

            {/* Description preview */}
            {build.description && (
              <p className="text-[11px] text-theme-muted leading-relaxed mt-1.5 line-clamp-2">
                {build.description}
              </p>
            )}
          </div>
        </div>

        {/* ── Items row ── */}
        <div className="flex items-center gap-1.5 mt-3.5">
          {/* Crest */}
          {build.crest && (
            <>
              <button
                onClick={() => onItemClick?.(build.crest)}
                className="relative w-11 h-11 rounded-lg overflow-hidden border-2 border-accent-gold/40 bg-accent-gold/5 flex-shrink-0 hover:border-accent-gold/70 hover:scale-110 btn-transition cursor-pointer group/item"
                title={build.crest.name}
              >
                {build.crest.image ? (
                  <img src={build.crest.image} alt={build.crest.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[9px] text-accent-gold font-bold">C</div>
                )}
              </button>
              {/* Arrow separator */}
              <svg className="w-3.5 h-3.5 text-white/15 flex-shrink-0 mx-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}

          {/* Items with rarity-colored borders */}
          {build.items?.filter(Boolean).map((item, i) => {
            const rarityBorder = ITEM_RARITY_BORDER[item.rarity] || 'border-white/10'
            return (
              <button
                key={i}
                onClick={() => onItemClick?.(item)}
                className={`w-11 h-11 rounded-lg overflow-hidden border ${rarityBorder} bg-white/5 flex-shrink-0 hover:scale-110 btn-transition cursor-pointer`}
                title={`${item.name}${item.rarity ? ` (${item.rarity})` : ''}`}
              >
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[9px] text-theme-muted">{i + 1}</div>
                )}
              </button>
            )
          })}
        </div>

        {/* ── Footer: version, badges, expand button ── */}
        <div className="flex items-center gap-2 mt-3">
          {build.version && (
            <span className="text-[10px] font-medium text-theme-muted px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
              {build.version}
            </span>
          )}
          {build.skill_order && build.skill_order.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-accent-teal px-2 py-0.5 rounded-md bg-accent-teal/10 border border-accent-teal/20">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h2v8H3zM9 9h2v12H9zM15 5h2v16h-2zM21 1h2v20h-2z" />
              </svg>
              Skills
            </span>
          )}
          {build.has_modules && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-accent-purple px-2 py-0.5 rounded-md bg-accent-purple/10 border border-accent-purple/20">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Modules
            </span>
          )}

          <div className="flex-1" />

          {/* Expand/collapse button */}
          {(build.skill_order?.length > 0 || build.modules?.length > 0 || build.description) && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-[10px] font-medium text-theme-muted hover:text-theme-primary btn-transition px-2 py-1 rounded-lg hover:bg-white/[0.05]"
            >
              {expanded ? 'Less' : 'More'}
              <svg className={`w-3 h-3 btn-transition ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Expanded detail section ── */}
      {expanded && (
        <div className="border-t border-white/[0.06] px-4 pb-4 pt-3 space-y-3 animate-fade-in">
          {/* Full description */}
          {build.description && (() => {
            const isLong = build.description.length > DESC_CHAR_LIMIT
            const displayText = isLong && !descExpanded
              ? build.description.slice(0, DESC_CHAR_LIMIT).trimEnd() + '...'
              : build.description
            return (
              <div className="px-3 py-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <p className="text-[11px] text-theme-secondary leading-relaxed whitespace-pre-line">
                  {displayText}
                </p>
                {isLong && (
                  <button
                    onClick={() => setDescExpanded(!descExpanded)}
                    className="mt-1.5 text-[11px] font-medium text-accent-blue hover:text-accent-blue/80 btn-transition"
                  >
                    {descExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            )
          })()}

          {/* Skill order visualization */}
          {build.skill_order && build.skill_order.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-theme-muted">Skill Order</h4>
                <div className="flex items-center gap-2 ml-auto">
                  {[1, 2, 3, 4].map((s) => (
                    <div key={s} className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-sm ${SKILL_COLORS[s].dot}`} />
                      <span className={`text-[9px] font-bold ${SKILL_COLORS[s].text}`}>{SKILL_COLORS[s].label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <SkillOrderRow skillOrder={build.skill_order} />
            </div>
          )}

          {/* Modules */}
          {build.modules && build.modules.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-2">
                Modules
              </h4>
              <div className="space-y-2">
                {build.modules.map((mod, mi) => (
                  <div key={mi} className="px-3 py-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span className="text-[11px] font-semibold text-accent-purple mb-2 block">{mod.title}</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {mod.items?.filter(Boolean).map((item, ii) => {
                        const rb = ITEM_RARITY_BORDER[item.rarity] || 'border-white/10'
                        return (
                          <button
                            key={ii}
                            onClick={() => onItemClick?.(item)}
                            className={`w-9 h-9 rounded-md overflow-hidden border ${rb} bg-white/5 hover:scale-110 btn-transition cursor-pointer`}
                            title={`${item.name}${item.rarity ? ` (${item.rarity})` : ''}`}
                          >
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[8px] text-theme-muted">{ii + 1}</div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function BuildsPage({ activePage, onNavigate }) {
  const [builds, setBuilds]             = useState([])
  const [heroes, setHeroes]             = useState([])
  const [isLoading, setIsLoading]       = useState(true)
  const [error, setError]               = useState(null)
  const [visibleCount, setVisibleCount] = useState(0)
  const [selectedItem, setSelectedItem]         = useState(null)
  const [selectedHeroInfo, setSelectedHeroInfo] = useState(null)
  const timers = useRef([])

  // Filters
  const [selectedHero, setSelectedHero]       = useState(null)
  const [selectedRole, setSelectedRole]       = useState(null)
  const [sortOrder, setSortOrder]             = useState('trending')
  const [currentVersion, setCurrentVersion]   = useState(false)
  const [searchName, setSearchName]           = useState('')
  const [page, setPage]                       = useState(1)
  const [showHeroPicker, setShowHeroPicker]   = useState(false)

  // Debounce timer for search
  const searchTimer = useRef(null)
  const [debouncedName, setDebouncedName] = useState('')

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => setDebouncedName(searchName), 400)
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current) }
  }, [searchName])

  // Load heroes list on mount
  useEffect(() => {
    getHeroes()
      .then(setHeroes)
      .catch((err) => console.error('Failed to load heroes:', err))
  }, [])

  // Build filter object
  const buildFilters = useCallback(() => {
    const f = { order: sortOrder }
    if (selectedHero) f.hero_id = selectedHero.id
    if (selectedRole) f.role = selectedRole
    if (currentVersion) f.current_version = '1'
    if (debouncedName) f.name = debouncedName
    if (page > 1) f.page = page
    return f
  }, [selectedHero, selectedRole, sortOrder, currentVersion, debouncedName, page])

  // Fetch builds when filters change
  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    getCommunityBuilds(buildFilters())
      .then((data) => {
        if (cancelled) return
        setBuilds(data)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [buildFilters])

  // Staggered card reveal
  const revealCards = useCallback((total) => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setVisibleCount(0)

    for (let i = 0; i < total; i++) {
      const id = setTimeout(() => setVisibleCount((c) => c + 1), 100 + i * 50)
      timers.current.push(id)
    }
  }, [])

  useEffect(() => {
    if (builds.length > 0 && !isLoading) revealCards(builds.length)
    return () => timers.current.forEach(clearTimeout)
  }, [builds, isLoading, revealCards])

  // Reset page when filters change (except page itself)
  useEffect(() => {
    setPage(1)
  }, [selectedHero, selectedRole, sortOrder, currentVersion, debouncedName])

  return (
    <div className="min-h-screen bg-theme-primary gradient-radial relative">
      <ParallaxBackground />
      <Header activePage={activePage} onNavigate={onNavigate} />

      <main className="max-w-6xl mx-auto px-6 py-16 space-y-8 relative z-10">
        {/* Title */}
        <section className="text-center space-y-4 animate-fade-in">
          <GlowingTitle text="Community Builds." />
          <p className="text-lg text-theme-secondary max-w-xl mx-auto leading-relaxed">
            Browse and explore top builds from the Predecessor community.
          </p>
        </section>

        {/* Filter Bar */}
        <section className="animate-slide-up">
          <div className="glass rounded-2xl border border-theme p-5 space-y-4">
            {/* Row 1: Hero picker + Role chips + Sort */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Hero picker button */}
              <button
                onClick={() => setShowHeroPicker(true)}
                className={[
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium btn-transition border',
                  selectedHero
                    ? 'text-accent-blue bg-accent-blue/10 border-accent-blue/30'
                    : 'text-theme-secondary border-theme hover:text-theme-primary hover:bg-white/[0.05]',
                ].join(' ')}
              >
                {selectedHero?.image && (
                  <img src={selectedHero.image} alt="" className="w-5 h-5 rounded object-cover" />
                )}
                <span>{selectedHero ? selectedHero.name : 'All Heroes'}</span>
                <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Clear hero */}
              {selectedHero && (
                <button
                  onClick={() => setSelectedHero(null)}
                  className="p-1.5 rounded-lg text-theme-muted hover:text-accent-pink hover:bg-accent-pink/10 btn-transition"
                  title="Clear hero filter"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              {/* Divider */}
              <div className="w-px h-6" style={{ background: 'var(--border-color)' }} />

              {/* Role chips */}
              {ROLES.map((role) => (
                <RoleChip
                  key={role.id}
                  role={role}
                  active={selectedRole === role.id}
                  onClick={() => setSelectedRole(selectedRole === role.id ? null : role.id)}
                />
              ))}

              {/* Spacer */}
              <div className="flex-1" />

              {/* Sort segmented control */}
              <div className="flex items-center rounded-xl border border-theme overflow-hidden" style={{ background: 'var(--input-bg)' }}>
                {SORT_OPTIONS.map((opt) => {
                  const active = sortOrder === opt.id
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSortOrder(opt.id)}
                      className={[
                        'relative flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold uppercase tracking-wide btn-transition',
                        active
                          ? `${opt.text} ${opt.bg} shadow-lg ${opt.glow}`
                          : 'text-theme-muted hover:text-theme-secondary',
                      ].join(' ')}
                    >
                      {/* Active indicator gradient bar */}
                      {active && (
                        <div className={`absolute bottom-0 left-1 right-1 h-0.5 rounded-full bg-gradient-to-r ${opt.color}`} />
                      )}
                      {opt.icon}
                      <span>{opt.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Row 2: Search + Current Version */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Search builds by name..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm input-theme focus-ring"
                />
              </div>

              {/* Current Version toggle */}
              <button
                onClick={() => setCurrentVersion(!currentVersion)}
                className={[
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wide btn-transition border whitespace-nowrap',
                  currentVersion
                    ? 'text-accent-green bg-accent-green/10 border-accent-green/30'
                    : 'text-theme-secondary border-theme hover:text-theme-primary hover:bg-white/[0.05]',
                ].join(' ')}
              >
                <span className={`w-2 h-2 rounded-full ${currentVersion ? 'bg-accent-green animate-pulse' : 'bg-theme-muted'}`} />
                Current Patch
              </button>
            </div>
          </div>
        </section>

        {/* Build Grid */}
        <section>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="relative">
                <div className="w-10 h-10 border-2 border-white/5 border-t-accent-blue rounded-full animate-spin" />
                <div className="absolute inset-0 w-10 h-10 border-2 border-transparent border-b-accent-purple/30 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              </div>
              <p className="text-sm text-theme-muted animate-pulse">Loading builds...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-pink/10 border border-accent-pink/20 mb-4">
                <svg className="w-7 h-7 text-accent-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <p className="text-accent-pink font-medium">{error}</p>
              <button
                onClick={() => setPage(page)}
                className="mt-4 text-sm font-medium text-accent-blue hover:text-accent-blue/80 btn-transition"
              >
                Try again
              </button>
            </div>
          ) : builds.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mb-4">
                <svg className="w-7 h-7 text-theme-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <p className="text-theme-secondary text-lg font-medium">No builds found</p>
              <p className="text-theme-muted text-sm mt-2">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <>
              {/* Results count */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-theme-muted">
                  Showing <span className="font-semibold text-theme-secondary">{builds.length}</span> builds
                  {page > 1 && <span> — page {page}</span>}
                </p>
                {(selectedHero || selectedRole || debouncedName || currentVersion) && (
                  <button
                    onClick={() => { setSelectedHero(null); setSelectedRole(null); setSearchName(''); setCurrentVersion(false) }}
                    className="text-[11px] font-medium text-accent-pink hover:text-accent-pink/80 btn-transition"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {builds.map((build, i) => (
                  <BuildCard key={build.id} build={build} index={i} visible={i < visibleCount} onItemClick={setSelectedItem} onHeroClick={setSelectedHeroInfo} />
                ))}
              </div>
            </>
          )}
        </section>

        {/* Pagination */}
        {!isLoading && !error && builds.length > 0 && (
          <section className="flex items-center justify-center pt-4">
            <div className="glass rounded-2xl border border-theme flex items-center overflow-hidden">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className={[
                  'flex items-center gap-2 px-5 py-3 text-sm font-medium btn-transition border-r border-theme',
                  page <= 1
                    ? 'text-theme-muted cursor-not-allowed opacity-40'
                    : 'text-theme-secondary hover:text-theme-primary hover:bg-white/[0.05]',
                ].join(' ')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              <span className="text-sm font-bold text-theme-primary px-6 py-3 bg-white/[0.03]">
                {page}
              </span>

              <button
                onClick={() => setPage(page + 1)}
                disabled={builds.length < 20}
                className={[
                  'flex items-center gap-2 px-5 py-3 text-sm font-medium btn-transition border-l border-theme',
                  builds.length < 20
                    ? 'text-theme-muted cursor-not-allowed opacity-40'
                    : 'text-theme-secondary hover:text-theme-primary hover:bg-white/[0.05]',
                ].join(' ')}
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </section>
        )}
      </main>

      <ScrollToTop />

      {/* Hero Picker Modal */}
      {showHeroPicker && (
        <HeroPickerModal
          heroes={heroes}
          onSelect={setSelectedHero}
          onClose={() => setShowHeroPicker(false)}
        />
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {/* Hero Detail Modal */}
      {selectedHeroInfo && (
        <HeroDetailModal
          hero={selectedHeroInfo}
          onClose={() => setSelectedHeroInfo(null)}
          onFilterByHero={(hero) => {
            setSelectedHero({ id: hero.id, name: hero.name, image: hero.image })
          }}
        />
      )}
    </div>
  )
}
