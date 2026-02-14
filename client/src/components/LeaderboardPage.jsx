import { useState, useEffect, useRef, useCallback } from 'react'

import Header              from './Header'
import ParallaxBackground  from './ParallaxBackground'
import ScrollToTop         from './ScrollToTop'
import HeroStatsModal      from './HeroStatsModal'
import { getLeaderboard }  from '../services/api'

// ─── Rank image mapping ─────────────────────────────────────────────────────
const RANK_IMAGES = ['Paragon', 'Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze']

function rankImage(rankTitle) {
  const t = (rankTitle || '').toLowerCase()
  const match = RANK_IMAGES.find((r) => t.includes(r.toLowerCase()))
  return match ? `/ranks/${match}.png` : null
}

// ─── Rank badge colour helpers ──────────────────────────────────────────────
function rankColor(rankTitle) {
  const t = (rankTitle || '').toLowerCase()
  if (t.includes('paragon'))  return { text: 'text-yellow-400',  bg: 'bg-yellow-400/10',  border: 'border-yellow-400/30' }
  if (t.includes('diamond'))  return { text: 'text-cyan-400',    bg: 'bg-cyan-400/10',    border: 'border-cyan-400/30' }
  if (t.includes('platinum')) return { text: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30' }
  if (t.includes('gold'))     return { text: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/30' }
  if (t.includes('silver'))   return { text: 'text-slate-300',   bg: 'bg-slate-300/10',   border: 'border-slate-300/30' }
  if (t.includes('bronze'))   return { text: 'text-slate-300',   bg: 'bg-slate-300/10',   border: 'border-slate-300/30' }
  return { text: 'text-theme-secondary', bg: 'bg-white/5', border: 'border-white/10' }
}

function positionStyle(pos) {
  if (pos === 1) return 'text-yellow-400 font-bold'
  if (pos === 2) return 'text-slate-300 font-semibold'
  if (pos === 3) return 'text-amber-600 font-semibold'
  return 'text-theme-secondary'
}

// ─── Flag pill ──────────────────────────────────────────────────────────────
function FlagPill({ flag }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
      style={{
        background: `${flag.color}18`,
        color: flag.color,
        border: `1px solid ${flag.color}30`,
      }}
    >
      {flag.text}
    </span>
  )
}

// ─── Row animation helpers ───────────────────────────────────────────────────
function landingClass(pos) {
  if (pos <= 3) return '' // top 3 handled by podium
  return 'row-land-normal'
}

// ─── Podium card config ──────────────────────────────────────────────────────
const PODIUM_CONFIG = {
  1: {
    label: '1st',
    gradient: 'from-yellow-400 via-amber-300 to-yellow-500',
    borderColor: 'rgba(255, 214, 10, 0.6)',
    glowColor: 'rgba(255, 214, 10, 0.25)',
    shimmerColor: 'rgba(255, 214, 10, 0.35)',
    textColor: 'text-yellow-400',
    bgTint: 'rgba(255, 214, 10, 0.06)',
    size: 'large',
    order: 'order-2',   // center
    crownColor: '#FFD700',
    animation: 'podium-land-gold',
    particleClass: 'podium-particles-gold',
  },
  2: {
    label: '2nd',
    gradient: 'from-slate-300 via-gray-200 to-slate-400',
    borderColor: 'rgba(203, 213, 225, 0.5)',
    glowColor: 'rgba(203, 213, 225, 0.15)',
    shimmerColor: 'rgba(203, 213, 225, 0.3)',
    textColor: 'text-slate-300',
    bgTint: 'rgba(203, 213, 225, 0.04)',
    size: 'medium',
    order: 'order-1',   // left
    crownColor: '#C0C0C0',
    animation: 'podium-land-silver',
    particleClass: 'podium-particles-silver',
  },
  3: {
    label: '3rd',
    gradient: 'from-amber-600 via-orange-500 to-amber-700',
    borderColor: 'rgba(180, 130, 70, 0.5)',
    glowColor: 'rgba(180, 130, 70, 0.15)',
    shimmerColor: 'rgba(180, 130, 70, 0.3)',
    textColor: 'text-amber-600',
    bgTint: 'rgba(180, 130, 70, 0.04)',
    size: 'medium',
    order: 'order-3',   // right
    crownColor: '#CD7F32',
    animation: 'podium-land-bronze',
    particleClass: 'podium-particles-bronze',
  },
}

// ─── Crown SVG ───────────────────────────────────────────────────────────────
function CrownIcon({ color, size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="drop-shadow-lg">
      <path
        d="M2 18L4.5 7L8.5 12L12 4L15.5 12L19.5 7L22 18H2Z"
        fill={color}
        stroke={color}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <circle cx="4.5" cy="6" r="1.5" fill={color} />
      <circle cx="12" cy="3" r="1.5" fill={color} />
      <circle cx="19.5" cy="6" r="1.5" fill={color} />
    </svg>
  )
}

// ─── Podium Card ─────────────────────────────────────────────────────────────
function PodiumCard({ player, position, visible, onSelect }) {
  const cfg = PODIUM_CONFIG[position]
  const rc = rankColor(player.rank_title)
  const isFirst = position === 1

  return (
    <div
      className={`${cfg.order} ${visible ? cfg.animation : 'podium-hidden'}`}
      style={{ animationFillMode: 'both' }}
    >
      <button
        onClick={() => onSelect(player)}
        className={`
          relative group cursor-pointer w-full
          ${isFirst ? 'podium-card-gold' : position === 2 ? 'podium-card-silver' : 'podium-card-bronze'}
        `}
      >
        {/* Animated gradient border */}
        <div
          className="absolute -inset-[1px] rounded-2xl podium-border-spin opacity-70 group-hover:opacity-100 btn-transition"
          style={{
            background: `conic-gradient(from var(--podium-angle, 0deg), transparent 0%, ${cfg.borderColor} 10%, transparent 20%, ${cfg.borderColor} 40%, transparent 60%, ${cfg.borderColor} 80%, transparent 100%)`,
          }}
        />

        {/* Card body */}
        <div
          className="relative rounded-2xl overflow-hidden backdrop-blur-xl"
          style={{
            background: `linear-gradient(160deg, ${cfg.bgTint}, rgba(0,0,0,0.4))`,
          }}
        >
          {/* Shimmer sweep */}
          <div className="podium-shimmer" style={{ '--shimmer-color': cfg.shimmerColor }} />

          {/* Floating particles (gold only) */}
          {isFirst && (
            <div className="podium-particles-gold">
              <span className="gold-particle gp-1" />
              <span className="gold-particle gp-2" />
              <span className="gold-particle gp-3" />
              <span className="gold-particle gp-4" />
              <span className="gold-particle gp-5" />
              <span className="gold-particle gp-6" />
              <span className="gold-particle gp-7" />
              <span className="gold-particle gp-8" />
              <span className="gold-particle gp-9" />
              <span className="gold-particle gp-10" />
              <span className="gold-particle gp-11" />
              <span className="gold-particle gp-12" />
            </div>
          )}

          {/* Content */}
          <div className={`relative z-10 flex flex-col items-center ${isFirst ? 'py-8 px-6' : 'py-6 px-5'}`}>
            {/* Crown / Medal */}
            <div className={`${isFirst ? 'mb-3 podium-crown-float' : 'mb-2'}`}>
              {isFirst ? (
                <CrownIcon color={cfg.crownColor} size={36} />
              ) : (
                <span className={`text-3xl ${position === 2 ? 'podium-medal-shine-silver' : 'podium-medal-shine-bronze'}`}>
                  {position === 2 ? '🥈' : '🥉'}
                </span>
              )}
            </div>

            {/* Position number */}
            <div className={`podium-position-number ${cfg.textColor} ${isFirst ? 'text-5xl' : 'text-4xl'} font-black tracking-tighter`}>
              {position}
            </div>
            <span className={`text-[10px] uppercase tracking-[0.25em] font-bold mt-1 ${cfg.textColor} opacity-60`}>
              {cfg.label} place
            </span>

            {/* Player name */}
            <h3 className={`${isFirst ? 'text-lg mt-4' : 'text-base mt-3'} font-bold text-theme-primary tracking-tight text-center`}>
              {player.display_name}
            </h3>

            {/* Region + flags */}
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[11px] text-theme-muted uppercase tracking-wide">
                {player.region}
              </span>
              {player.flags?.map((f, i) => (
                <FlagPill key={i} flag={f} />
              ))}
            </div>

            {/* Rank image + badge */}
            <div className="flex items-center gap-2 mt-4">
              {rankImage(player.rank_title) && (
                <img
                  src={rankImage(player.rank_title)}
                  alt={player.rank_title}
                  className={`${isFirst ? 'w-20 h-20' : 'w-16 h-16'} object-contain drop-shadow-lg`}
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              )}
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border mt-2 ${rc.text} ${rc.bg} ${rc.border}`}>
              {player.rank_title}
            </span>

            {/* VP Total */}
            <div className="mt-4 text-center">
              <span className={`${isFirst ? 'text-2xl' : 'text-xl'} font-black text-accent-blue tabular-nums`}>
                {player.vp_total.toLocaleString()}
              </span>
              <p className="text-[11px] text-theme-muted mt-0.5">Victory Points</p>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 mt-3">
              <div className="text-center">
                <span className="text-xs font-semibold text-accent-green">
                  Top {player.top_percentage}%
                </span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="text-center">
                {player.is_active ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-accent-green">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
                    Active
                  </span>
                ) : (
                  <span className="text-[11px] text-theme-muted">Inactive</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </button>
    </div>
  )
}

// ─── Player Row (4th+) ──────────────────────────────────────────────────────
function PlayerRow({ player, index, visible, onSelect }) {
  const pos = index + 1
  const rc = rankColor(player.rank_title)

  return (
    <tr
      onClick={() => onSelect(player)}
      className={`group border-b border-theme hover:bg-white/[0.03] btn-transition relative cursor-pointer
        ${visible ? landingClass(pos) : 'row-hidden'}`}
    >
      {/* Position */}
      <td className="py-3 px-4 text-center">
        <span className={`text-sm ${positionStyle(pos)}`}>
          #{pos}
        </span>
      </td>

      {/* Player */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-theme-primary truncate">
              {player.display_name}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-theme-muted uppercase tracking-wide">
                {player.region}
              </span>
              {player.flags?.map((f, i) => (
                <FlagPill key={i} flag={f} />
              ))}
            </div>
          </div>
        </div>
      </td>

      {/* Rank */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          {rankImage(player.rank_title) && (
            <img
              src={rankImage(player.rank_title)}
              alt={player.rank_title}
              className="w-16 h-16 object-contain"
              onError={(e) => { e.target.style.display = 'none' }}
            />
          )}
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${rc.text} ${rc.bg} ${rc.border}`}>
            {player.rank_title}
          </span>
        </div>
      </td>

      {/* VP */}
      <td className="py-3 px-4 text-right">
        <span className="text-sm font-semibold text-accent-blue">
          {player.vp_total.toLocaleString()}
        </span>
        <p className="text-[11px] text-theme-muted">
          {player.vp_current.toLocaleString()} current
        </p>
      </td>

      {/* Top % */}
      <td className="py-3 px-4 text-center">
        <span className="text-xs font-medium text-accent-green">
          Top {player.top_percentage}%
        </span>
      </td>

      {/* Status */}
      <td className="py-3 px-4 text-center">
        {player.is_active ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-accent-green">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
            Active
          </span>
        ) : (
          <span className="text-[11px] text-theme-muted">Inactive</span>
        )}
      </td>
    </tr>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function LeaderboardPage({ activePage, onNavigate }) {
  const [players, setPlayers]       = useState([])
  const [isLoading, setIsLoading]   = useState(true)
  const [error, setError]           = useState(null)
  const [visibleCount, setVisibleCount] = useState(0)
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const timers = useRef([])

  // Fetch data
  useEffect(() => {
    getLeaderboard()
      .then(setPlayers)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [])

  // Derived: top 3 podium players and the rest
  const podiumPlayers = players.slice(0, 3)
  const tablePlayers  = players.slice(3)

  // Staggered reveal — podium first, then table rows
  const revealRows = useCallback((total) => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setVisibleCount(0)

    // Podium: #1 at 400ms, #2 at 900ms, #3 at 1300ms
    // Table rows (4+): start at 1800ms, 80ms apart
    const getDelay = (i) => {
      if (i === 0) return 400
      if (i === 1) return 900
      if (i === 2) return 1300
      return 1800 + (i - 3) * 80
    }

    for (let i = 0; i < total; i++) {
      const id = setTimeout(() => setVisibleCount((c) => c + 1), getDelay(i))
      timers.current.push(id)
    }
  }, [])

  useEffect(() => {
    if (players.length > 0) revealRows(players.length)
    return () => timers.current.forEach(clearTimeout)
  }, [players, revealRows])

  return (
    <div className="min-h-screen bg-theme-primary gradient-radial relative">
      <ParallaxBackground />
      <Header activePage={activePage} onNavigate={onNavigate} />

      <main className="max-w-6xl mx-auto px-6 py-16 space-y-10 relative z-10">
        {/* Title */}
        <section className="text-center space-y-3 animate-fade-in">
          <h1 className="text-4xl font-semibold text-theme-primary tracking-tight">
            Leaderboard
          </h1>
          <p className="text-lg text-theme-secondary max-w-xl mx-auto">
            Top Predecessor players ranked by Victory Points.
          </p>
        </section>

        {/* Podium — Top 3 */}
        {!isLoading && !error && podiumPlayers.length >= 3 && (
          <section className="relative">
            {/* Decorative glow behind podium */}
            <div className="absolute inset-0 -top-10 flex items-center justify-center pointer-events-none">
              <div className="w-[600px] h-[400px] rounded-full bg-yellow-400/[0.03] blur-[100px]" />
            </div>

            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-end">
              {/* Order: 2nd (left), 1st (center, taller), 3rd (right) */}
              {[1, 0, 2].map((idx) => (
                <PodiumCard
                  key={podiumPlayers[idx].id}
                  player={podiumPlayers[idx]}
                  position={idx + 1}
                  visible={idx < visibleCount}
                  onSelect={setSelectedPlayer}
                />
              ))}
            </div>
          </section>
        )}

        {/* Table — 4th and beyond */}
        <section className="animate-slide-up">
          <div className="glass rounded-2xl overflow-hidden border border-theme">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-theme border-t-accent-blue rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-20 text-accent-pink">
                {error}
              </div>
            ) : (
              <div className="overflow-x-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-theme text-[11px] uppercase tracking-wider text-theme-muted">
                      <th className="py-3 px-4 text-center font-medium w-16">#</th>
                      <th className="py-3 px-4 text-left font-medium">Player</th>
                      <th className="py-3 px-4 text-left font-medium">Rank</th>
                      <th className="py-3 px-4 text-right font-medium">VP Total</th>
                      <th className="py-3 px-4 text-center font-medium">Percentile</th>
                      <th className="py-3 px-4 text-center font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tablePlayers.map((player, i) => (
                      <PlayerRow key={player.id} player={player} index={i + 3} visible={i + 3 < visibleCount} onSelect={setSelectedPlayer} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {!isLoading && !error && (
            <p className="text-center text-xs text-theme-muted mt-4">
              Data from omeda.city
            </p>
          )}
        </section>
      </main>

      <ScrollToTop />

      {selectedPlayer && (
        <HeroStatsModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  )
}
