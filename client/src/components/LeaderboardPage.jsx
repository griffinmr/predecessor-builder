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

function positionBadge(pos) {
  if (pos === 1) return '🥇'
  if (pos === 2) return '🥈'
  if (pos === 3) return '🥉'
  return `#${pos}`
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
  if (pos === 1) return 'row-land-gold'
  if (pos === 2) return 'row-land-silver'
  if (pos === 3) return 'row-land-bronze'
  return 'row-land-normal'
}

function glowClass(pos) {
  if (pos === 1) return 'row-gold-glow'
  if (pos === 2) return 'row-silver-glow'
  if (pos === 3) return 'row-bronze-glow'
  return ''
}

// ─── Player Row ─────────────────────────────────────────────────────────────
function PlayerRow({ player, index, visible, onSelect }) {
  const pos = index + 1
  const rc = rankColor(player.rank_title)

  return (
    <tr
      onClick={() => onSelect(player)}
      className={`group border-b border-theme hover:bg-white/[0.03] btn-transition relative cursor-pointer
        ${visible ? `${landingClass(pos)} ${glowClass(pos)}` : 'row-hidden'}`}
    >
      {/* Position */}
      <td className="py-3 px-4 text-center">
        <span className={`text-sm ${positionStyle(pos)}`}>
          {positionBadge(pos)}
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

  // Staggered row reveal once players are loaded
  const revealRows = useCallback((total) => {
    // Clear any previous timers
    timers.current.forEach(clearTimeout)
    timers.current = []
    setVisibleCount(0)

    // Delays: 1st at 300ms, 2nd at 900ms, 3rd at 1400ms, then 80ms apart
    const getDelay = (i) => {
      if (i === 0) return 300   // dramatic pause before #1
      if (i === 1) return 900   // let #1 breathe
      if (i === 2) return 1400  // let #2 settle
      return 1700 + (i - 3) * 80 // rapid-fire for the rest
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

        {/* Table */}
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
                    {players.map((player, i) => (
                      <PlayerRow key={player.id} player={player} index={i} visible={i < visibleCount} onSelect={setSelectedPlayer} />
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
