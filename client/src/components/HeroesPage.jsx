import { useState, useEffect, useMemo, useCallback } from 'react'

import Header             from './Header'
import ParallaxBackground from './ParallaxBackground'
import ScrollToTop        from './ScrollToTop'
import GlowingTitle       from './GlowingTitle'
import { getHeroes, getAllHeroStats, getHeroStats } from '../services/api'
import { ROLE_COLORS }    from '../data/mockData'

// ─── Role config (omeda.city uses "carry" / "midlane") ─────────────────────
const ROLES = [
  { id: 'carry',   label: 'ADC' },
  { id: 'support', label: 'Support' },
  { id: 'jungle',  label: 'Jungle' },
  { id: 'midlane', label: 'Mid' },
  { id: 'offlane', label: 'Offlane' },
]

const ROLE_COLOR_MAP = {
  carry:   'adc',
  support: 'support',
  jungle:  'jungle',
  midlane: 'mid',
  offlane: 'offlane',
}

const ROLE_LABEL_MAP = {
  carry: 'ADC', support: 'Support', jungle: 'Jungle', midlane: 'Mid', offlane: 'Offlane',
}

// ─── Compare slot colours (up to 5) ─────────────────────────────────────────
const COMPARE_COLORS = [
  { fill: 'rgba(0,113,227,0.25)',  stroke: '#0071e3', name: 'text-accent-blue',   bg: 'bg-accent-blue/15',   border: 'border-accent-blue/40',  ring: 'ring-accent-blue/40' },
  { fill: 'rgba(255,55,95,0.25)',  stroke: '#ff375f', name: 'text-accent-pink',   bg: 'bg-accent-pink/15',   border: 'border-accent-pink/40',  ring: 'ring-accent-pink/40' },
  { fill: 'rgba(191,90,242,0.25)', stroke: '#bf5af2', name: 'text-accent-purple', bg: 'bg-accent-purple/15', border: 'border-accent-purple/40', ring: 'ring-accent-purple/40' },
  { fill: 'rgba(255,159,10,0.25)', stroke: '#ff9f0a', name: 'text-accent-orange', bg: 'bg-accent-orange/15', border: 'border-accent-orange/40', ring: 'ring-accent-orange/40' },
  { fill: 'rgba(48,209,88,0.25)',  stroke: '#30d158', name: 'text-accent-green',  bg: 'bg-accent-green/15',  border: 'border-accent-green/40',  ring: 'ring-accent-green/40' },
]
const MAX_COMPARE = 5

// ─── Radar chart axes ───────────────────────────────────────────────────────
const RADAR_AXES = [
  { key: 'winrate',                     label: 'Win Rate',   unit: '%',  format: (v) => v?.toFixed(1) },
  { key: 'pickrate',                    label: 'Pick Rate',  unit: '%',  format: (v) => v?.toFixed(1) },
  { key: 'avg_kdar',                    label: 'KDA',        unit: '',   format: (v) => v?.toFixed(2) },
  { key: 'avg_cs',                      label: 'CS/min',     unit: '',   format: (v) => v?.toFixed(1) },
  { key: 'avg_gold',                    label: 'Gold/min',   unit: '',   format: (v) => Math.round(v || 0) },
  { key: 'avg_performance_score',       label: 'Perf Score', unit: '',   format: (v) => v?.toFixed(0) },
]

// ─── SVG Radar Chart ────────────────────────────────────────────────────────
function RadarChart({ heroes, allStats }) {
  const size = 280
  const cx = size / 2
  const cy = size / 2
  const radius = size / 2 - 40
  const levels = 4
  const axes = RADAR_AXES.length

  // Compute min/max for normalisation across all heroes
  const ranges = useMemo(() => {
    if (!allStats || allStats.length === 0) return null
    const r = {}
    RADAR_AXES.forEach(({ key }) => {
      const vals = allStats.map((s) => s[key]).filter((v) => v != null && !isNaN(v))
      r[key] = { min: Math.min(...vals), max: Math.max(...vals) }
    })
    return r
  }, [allStats])

  if (!ranges) return null

  // Helper: angle for axis i
  const angle = (i) => (Math.PI * 2 * i) / axes - Math.PI / 2

  // Helper: point on axis i at fraction f (0-1)
  const point = (i, f) => ({
    x: cx + radius * f * Math.cos(angle(i)),
    y: cy + radius * f * Math.sin(angle(i)),
  })

  // Normalise a value to 0-1 range
  const normalise = (key, val) => {
    if (val == null || isNaN(val)) return 0
    const { min, max } = ranges[key]
    if (max === min) return 0.5
    return (val - min) / (max - min)
  }

  // Build polygon path for a hero's stats
  const heroPath = (stats) => {
    return RADAR_AXES.map((axis, i) => {
      const f = Math.max(0.05, normalise(axis.key, stats[axis.key]))
      const p = point(i, f)
      return `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    }).join(' ') + ' Z'
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[320px] mx-auto">
      {/* Grid rings */}
      {Array.from({ length: levels }, (_, l) => {
        const f = (l + 1) / levels
        const pts = Array.from({ length: axes }, (_, i) => point(i, f))
        return (
          <polygon
            key={l}
            points={pts.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={1}
          />
        )
      })}

      {/* Axis lines */}
      {Array.from({ length: axes }, (_, i) => {
        const p = point(i, 1)
        return (
          <line
            key={i}
            x1={cx} y1={cy} x2={p.x} y2={p.y}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />
        )
      })}

      {/* Hero polygons */}
      {heroes.map((hero, idx) => {
        if (!hero.stats) return null
        return (
          <polygon
            key={hero.id}
            points={RADAR_AXES.map((axis, i) => {
              const f = Math.max(0.05, normalise(axis.key, hero.stats[axis.key]))
              const p = point(i, f)
              return `${p.x},${p.y}`
            }).join(' ')}
            fill={COMPARE_COLORS[idx].fill}
            stroke={COMPARE_COLORS[idx].stroke}
            strokeWidth={2}
            className="btn-transition"
          />
        )
      })}

      {/* Axis labels */}
      {RADAR_AXES.map((axis, i) => {
        const p = point(i, 1.22)
        return (
          <text
            key={axis.key}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-current text-theme-muted"
            style={{ fontSize: '9px', fontWeight: 600 }}
          >
            {axis.label}
          </text>
        )
      })}
    </svg>
  )
}

// ─── WinRateBar (reused from BuildsPage pattern) ───────────────────────────
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

// ─── Hero Detail Modal ──────────────────────────────────────────────────────
function HeroDetailModal({ hero, onClose }) {
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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in" onClick={onClose} />
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
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 hover:bg-black/70 btn-transition text-white/60 hover:text-white backdrop-blur-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="absolute bottom-0 inset-x-0 px-5 pb-4">
            <h3 className="text-xl font-bold text-white tracking-tight leading-tight drop-shadow-lg">{hero.name}</h3>
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
              {/* Win Rate + Pick Rate */}
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
                  <div className="px-3 py-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-theme-secondary">Win Rate</span>
                    </div>
                    <WinRateBar rate={stats.winrate} />
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span className="text-xs text-theme-secondary">Pick Rate</span>
                    <span className="text-xs font-bold text-accent-blue">{stats.pickrate.toFixed(1)}%</span>
                  </div>
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
        </div>

        <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(96,165,250,0.3), transparent)' }} />
      </div>
    </div>
  )
}

// ─── Hero Card ──────────────────────────────────────────────────────────────
function HeroCard({ hero, compareIndex, compareMode, compareFull, onCompare, onClick, stats }) {
  const isCompared = compareIndex >= 0
  const cColor   = isCompared ? COMPARE_COLORS[compareIndex] : null

  const handleClick = () => {
    if (compareMode) {
      onCompare(hero)
    } else {
      onClick()
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={[
        'group relative flex flex-col rounded-2xl overflow-hidden w-full text-left',
        'border btn-transition focus-ring glass',
        isCompared
          ? `${cColor.border} ring-2 ${cColor.ring} scale-[1.02]`
          : compareMode && !compareFull
            ? 'border-theme hover:scale-[1.02] hover:border-accent-blue/40'
            : compareMode && compareFull
              ? 'border-theme opacity-50 cursor-not-allowed'
              : 'border-theme hover:scale-[1.02]',
        'cursor-pointer',
      ].join(' ')}
    >
      {/* Hero image */}
      <div className="w-full aspect-square relative bg-gradient-to-br from-[#1a1a2e] to-[#0a0a14]">
        {hero.image ? (
          <img
            src={hero.image}
            alt={hero.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 btn-transition"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-light text-white/10">{hero.name?.charAt(0)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Compare checkbox — always visible in compare mode */}
        {compareMode && (
          <div className={[
            'absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center shadow-lg btn-transition',
            isCompared
              ? 'animate-scale-in'
              : 'bg-black/50 border border-white/20 backdrop-blur-sm',
          ].join(' ')}
            style={isCompared ? { background: cColor.stroke } : undefined}
          >
            {isCompared ? (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <span className="w-3.5 h-3.5 rounded-sm border-2 border-white/40" />
            )}
          </div>
        )}

        {/* Compare number badge (when not in compare mode but still selected) */}
        {!compareMode && isCompared && (
          <div
            className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center shadow-lg animate-scale-in"
            style={{ background: cColor.stroke }}
          >
            <span className="text-white text-[10px] font-black">{compareIndex + 1}</span>
          </div>
        )}

        {/* Win rate micro-badge */}
        {stats?.winrate != null && (
          <div className="absolute top-2.5 left-2.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold backdrop-blur-sm"
            style={{
              background: 'rgba(0,0,0,0.6)',
              color: stats.winrate >= 55 ? '#34d399' : stats.winrate >= 50 ? '#60a5fa' : stats.winrate >= 45 ? '#fbbf24' : '#f472b6',
            }}
          >
            {stats.winrate.toFixed(1)}%
          </div>
        )}
      </div>

      {/* Name + role */}
      <div className="p-3 text-center">
        <p className="text-theme-primary text-sm font-medium truncate">{hero.name}</p>
        <div className="flex items-center justify-center gap-1 mt-1.5">
          {hero.roles?.map((r) => {
            const ck = ROLE_COLOR_MAP[r] || 'support'
            const c  = ROLE_COLORS[ck] || ROLE_COLORS.support
            return (
              <span key={r} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${c.bg} ${c.text}`}>
                {ROLE_LABEL_MAP[r] || r}
              </span>
            )
          })}
        </div>
      </div>
    </button>
  )
}

// ─── Compare Section ────────────────────────────────────────────────────────
function CompareSection({ compared, allStats, onRemove, onClear }) {
  if (compared.length === 0) return null

  return (
    <section className="animate-fade-in" id="compare-section">
      <div className="glass rounded-2xl border border-theme overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-theme">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-base font-semibold text-theme-primary">Hero Comparison</h3>
            <span className="text-xs text-theme-muted">({compared.length}/{MAX_COMPARE})</span>
          </div>
          <button
            onClick={onClear}
            className="text-xs text-theme-muted hover:text-accent-pink btn-transition px-3 py-1.5 rounded-lg hover:bg-accent-pink/10"
          >
            Clear All
          </button>
        </div>

        <div className="p-5">
          {/* Hero chips + radar */}
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Left: selected hero chips */}
            <div className="flex flex-col gap-2 lg:w-52 w-full">
              {compared.map((hero, idx) => (
                <div
                  key={hero.id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl border ${COMPARE_COLORS[idx].border} ${COMPARE_COLORS[idx].bg}`}
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border" style={{ borderColor: COMPARE_COLORS[idx].stroke }}>
                    {hero.image ? (
                      <img src={hero.image} alt={hero.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center text-xs text-white/30">{hero.name?.charAt(0)}</div>
                    )}
                  </div>
                  <span className={`text-sm font-semibold flex-1 truncate ${COMPARE_COLORS[idx].name}`}>{hero.name}</span>
                  <button
                    onClick={() => onRemove(hero.id)}
                    className="p-1 rounded-md hover:bg-white/10 btn-transition text-white/40 hover:text-white"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Center: Radar chart */}
            <div className="flex-1 flex justify-center">
              <RadarChart heroes={compared} allStats={allStats} />
            </div>
          </div>

          {/* Stats comparison table */}
          {compared.length >= 2 && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-theme">
                    <th className="text-left text-[10px] font-bold uppercase tracking-widest text-theme-muted py-2 pr-4">Stat</th>
                    {compared.map((hero, idx) => (
                      <th key={hero.id} className={`text-center text-[10px] font-bold uppercase tracking-widest py-2 px-2 ${COMPARE_COLORS[idx].name}`}>
                        {hero.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RADAR_AXES.map((axis) => {
                    const values = compared.map((h) => h.stats?.[axis.key])
                    const best = Math.max(...values.filter((v) => v != null))
                    return (
                      <tr key={axis.key} className="border-b border-white/[0.03]">
                        <td className="text-xs text-theme-secondary py-2.5 pr-4 whitespace-nowrap">{axis.label}</td>
                        {compared.map((hero, idx) => {
                          const val = hero.stats?.[axis.key]
                          const isBest = val != null && val === best && compared.length > 1
                          return (
                            <td key={hero.id} className="text-center py-2.5 px-2">
                              <span className={`text-xs font-bold ${isBest ? COMPARE_COLORS[idx].name : 'text-theme-primary'}`}>
                                {val != null ? `${axis.format(val)}${axis.unit}` : '—'}
                              </span>
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                  <tr className="border-b border-white/[0.03]">
                    <td className="text-xs text-theme-secondary py-2.5 pr-4">Matches</td>
                    {compared.map((hero) => (
                      <td key={hero.id} className="text-center py-2.5 px-2">
                        <span className="text-xs font-bold text-theme-primary">
                          {hero.stats?.match_count != null ? Math.round(hero.stats.match_count).toLocaleString() : '—'}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-white/[0.03]">
                    <td className="text-xs text-theme-secondary py-2.5 pr-4">Dmg Dealt</td>
                    {compared.map((hero) => (
                      <td key={hero.id} className="text-center py-2.5 px-2">
                        <span className="text-xs font-bold text-accent-orange">
                          {hero.stats?.avg_damage_dealt_to_heroes != null ? Math.round(hero.stats.avg_damage_dealt_to_heroes).toLocaleString() : '—'}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="text-xs text-theme-secondary py-2.5 pr-4">Dmg Taken</td>
                    {compared.map((hero) => (
                      <td key={hero.id} className="text-center py-2.5 px-2">
                        <span className="text-xs font-bold text-accent-pink">
                          {hero.stats?.avg_damage_taken_from_heroes != null ? Math.round(hero.stats.avg_damage_taken_from_heroes).toLocaleString() : '—'}
                        </span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Sticky Compare Bar (bottom of screen) ─────────────────────────────────
function StickyCompareBar({ compared, compareMode, onToggleMode, onClear }) {
  const scrollToCompare = () => {
    document.getElementById('compare-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className={[
      'fixed bottom-0 inset-x-0 z-40 btn-transition',
      (compareMode || compared.length > 0) ? 'translate-y-0' : 'translate-y-full',
    ].join(' ')}>
      <div className="max-w-6xl mx-auto px-6 pb-4">
        <div
          className="flex items-center justify-between gap-4 px-5 py-3 rounded-2xl border border-accent-blue/30"
          style={{
            background: 'rgba(10,10,20,0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 -4px 30px rgba(0,0,0,0.4), 0 0 20px rgba(0,113,227,0.1)',
          }}
        >
          {/* Left: toggle + selected avatars */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMode}
              className={[
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold btn-transition',
                compareMode
                  ? 'bg-accent-blue text-white shadow-lg shadow-accent-blue/25'
                  : 'glass border border-theme text-theme-secondary hover:text-accent-blue hover:border-accent-blue/40',
              ].join(' ')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {compareMode ? 'Selecting...' : 'Compare'}
            </button>

            {/* Selected hero avatars */}
            {compared.length > 0 && (
              <div className="flex items-center -space-x-2">
                {compared.map((hero, idx) => (
                  <div
                    key={hero.id}
                    className="w-9 h-9 rounded-full overflow-hidden border-2 bg-white/5"
                    style={{ borderColor: COMPARE_COLORS[idx].stroke, zIndex: compared.length - idx }}
                  >
                    {hero.image ? (
                      <img src={hero.image} alt={hero.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-white/30">{hero.name?.charAt(0)}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {compared.length > 0 && (
              <span className="text-xs text-theme-muted hidden sm:block">
                {compared.length}/{MAX_COMPARE} selected
              </span>
            )}
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            {compared.length >= 2 && (
              <button
                onClick={scrollToCompare}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-accent-blue/15 text-accent-blue border border-accent-blue/30 hover:bg-accent-blue/25 btn-transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                View Chart
              </button>
            )}
            {compared.length > 0 && (
              <button
                onClick={onClear}
                className="p-2 rounded-xl text-theme-muted hover:text-accent-pink hover:bg-accent-pink/10 btn-transition"
                title="Clear all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Search Input ───────────────────────────────────────────────────────────
function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full input-theme rounded-xl pl-11 pr-4 py-3 text-sm btn-transition focus:outline-none"
      />
    </div>
  )
}

// ─── Main page ──────────────────────────────────────────────────────────────
export default function HeroesPage({ activePage, onNavigate }) {
  const [heroes, setHeroes]         = useState([])
  const [allStats, setAllStats]     = useState([])
  const [isLoading, setIsLoading]   = useState(true)
  const [roleFilter, setRoleFilter] = useState('all')
  const [search, setSearch]         = useState('')
  const [compared, setCompared]       = useState([])      // up to MAX_COMPARE heroes with stats
  const [compareMode, setCompareMode] = useState(false)  // toggle: cards act as selectors
  const [detailHero, setDetailHero]   = useState(null)   // for modal

  // Fetch heroes + all stats on mount
  useEffect(() => {
    setIsLoading(true)
    Promise.all([getHeroes(), getAllHeroStats()])
      .then(([heroList, stats]) => {
        setHeroes(heroList)
        setAllStats(Array.isArray(stats) ? stats : [])
      })
      .catch((err) => console.error('Failed to load heroes:', err))
      .finally(() => setIsLoading(false))
  }, [])

  // Build a map of heroId → stats for quick lookup
  const statsMap = useMemo(() => {
    const m = new Map()
    allStats.forEach((s) => m.set(s.hero_id, s))
    return m
  }, [allStats])

  // Role counts
  const roleCounts = useMemo(() => {
    const counts = { all: heroes.length }
    ROLES.forEach((r) => {
      counts[r.id] = heroes.filter((h) => h.roles?.includes(r.id)).length
    })
    return counts
  }, [heroes])

  // Filtered heroes
  const filtered = useMemo(() => {
    let list = heroes
    if (roleFilter !== 'all') {
      list = list.filter((h) => h.roles?.includes(roleFilter))
    }
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((h) => h.name.toLowerCase().includes(q))
    }
    // Sort by win rate (descending) if stats available, else alphabetical
    list = [...list].sort((a, b) => {
      const sa = statsMap.get(a.id)
      const sb = statsMap.get(b.id)
      if (sa && sb) return (sb.winrate || 0) - (sa.winrate || 0)
      return a.name.localeCompare(b.name)
    })
    return list
  }, [heroes, roleFilter, search, statsMap])

  // Compare handlers
  const handleCompare = useCallback((hero) => {
    setCompared((prev) => {
      const existing = prev.findIndex((h) => h.id === hero.id)
      if (existing >= 0) return prev.filter((h) => h.id !== hero.id)
      if (prev.length >= MAX_COMPARE) return prev
      const heroStats = allStats.find((s) => s.hero_id === hero.id) || null
      return [...prev, { ...hero, stats: heroStats }]
    })
  }, [allStats])

  const handleRemoveCompare = useCallback((heroId) => {
    setCompared((prev) => prev.filter((h) => h.id !== heroId))
  }, [])

  const handleClearCompare = useCallback(() => {
    setCompared([])
    setCompareMode(false)
  }, [])

  const handleToggleCompareMode = useCallback(() => {
    setCompareMode((prev) => !prev)
  }, [])

  return (
    <div className="min-h-screen bg-theme-primary gradient-radial relative">
      <ParallaxBackground />
      <Header activePage={activePage} onNavigate={onNavigate} />
      <ScrollToTop />

      <main className="max-w-6xl mx-auto px-6 py-16 space-y-12 relative z-10">

        {/* ═══ Title ═══ */}
        <section className="text-center space-y-4 animate-fade-in">
          <GlowingTitle text="Hero Roster." />
          <p className="text-xl text-theme-secondary max-w-2xl mx-auto leading-relaxed">
            Explore every hero, compare stats side by side, and find your next main.
          </p>
        </section>

        {/* ═══ Compare section ═══ */}
        <CompareSection
          compared={compared}
          allStats={allStats}
          onRemove={handleRemoveCompare}
          onClear={handleClearCompare}
        />

        {/* ═══ Hero Grid ═══ */}
        <section className="animate-slide-up">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-theme-primary tracking-tight">All Heroes</h2>
              <p className="text-theme-secondary text-sm mt-1">
                {compareMode
                  ? `Click heroes to select them for comparison (${compared.length}/${MAX_COMPARE})`
                  : `${heroes.length} heroes — sorted by win rate`
                }
              </p>
            </div>
            <button
              onClick={handleToggleCompareMode}
              className={[
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold btn-transition',
                compareMode
                  ? 'bg-accent-blue text-white shadow-lg shadow-accent-blue/25'
                  : 'glass border border-theme text-theme-secondary hover:text-accent-blue hover:border-accent-blue/40',
              ].join(' ')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {compareMode ? 'Done' : 'Compare'}
            </button>
          </div>

          {/* Role tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-6 p-1.5 glass rounded-2xl w-fit">
            <button
              type="button"
              onClick={() => setRoleFilter('all')}
              className={[
                'px-5 py-2.5 rounded-full text-sm font-medium btn-transition focus-ring',
                roleFilter === 'all' ? 'tab-active' : 'tab-inactive',
              ].join(' ')}
            >
              All
              <span className="ml-2 text-xs opacity-60">{roleCounts.all}</span>
            </button>
            {ROLES.map((role) => {
              const colorKey = ROLE_COLOR_MAP[role.id] || 'support'
              const colors   = ROLE_COLORS[colorKey] || ROLE_COLORS.support
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setRoleFilter(role.id)}
                  className={[
                    'px-5 py-2.5 rounded-full text-sm font-medium btn-transition focus-ring',
                    roleFilter === role.id
                      ? `${colors.bg} ${colors.text} ${colors.border} border`
                      : 'tab-inactive',
                  ].join(' ')}
                >
                  {role.label}
                  <span className="ml-2 text-xs opacity-60">{roleCounts[role.id] || 0}</span>
                </button>
              )
            })}
          </div>

          {/* Search */}
          <div className="max-w-sm mb-6">
            <SearchInput value={search} onChange={setSearch} placeholder="Search heroes..." />
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-theme border-t-accent-blue rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-theme-muted">
              No heroes found
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
              {filtered.map((hero) => (
                <HeroCard
                  key={hero.id}
                  hero={hero}
                  stats={statsMap.get(hero.id)}
                  compareMode={compareMode}
                  compareFull={compared.length >= MAX_COMPARE}
                  compareIndex={compared.findIndex((c) => c.id === hero.id)}
                  onCompare={handleCompare}
                  onClick={() => setDetailHero(hero)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Bottom spacer for sticky bar */}
      {(compareMode || compared.length > 0) && <div className="h-20" />}

      {/* Sticky compare bar */}
      <StickyCompareBar
        compared={compared}
        compareMode={compareMode}
        onToggleMode={handleToggleCompareMode}
        onClear={handleClearCompare}
      />

      {/* Detail modal */}
      {detailHero && (
        <HeroDetailModal
          hero={detailHero}
          onClose={() => setDetailHero(null)}
        />
      )}
    </div>
  )
}
