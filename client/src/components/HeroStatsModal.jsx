import { useState, useEffect, useRef } from 'react'
import { getPlayerHeroStats } from '../services/api'

// ─── Rank accent colours (raw hex for inline styles) ───────────────────────
function rankAccent(title) {
  const t = (title || '').toLowerCase()
  if (t.includes('paragon'))  return { h: '#facc15', g: 'rgba(250,204,21,0.15)' }
  if (t.includes('diamond'))  return { h: '#22d3ee', g: 'rgba(34,211,238,0.15)' }
  if (t.includes('platinum')) return { h: '#34d399', g: 'rgba(52,211,153,0.12)' }
  if (t.includes('gold'))     return { h: '#fbbf24', g: 'rgba(251,191,36,0.12)' }
  if (t.includes('silver'))   return { h: '#94a3b8', g: 'rgba(148,163,184,0.10)' }
  if (t.includes('bronze'))   return { h: '#b4826a', g: 'rgba(180,130,106,0.10)' }
  return { h: '#60a5fa', g: 'rgba(96,165,250,0.10)' }
}

function rankImageSrc(title) {
  const names = ['Paragon', 'Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze']
  const t = (title || '').toLowerCase()
  const match = names.find((r) => t.includes(r.toLowerCase()))
  return match ? `/ranks/${match}.png` : null
}

// ─── Win-rate ring (SVG) ───────────────────────────────────────────────────
function WinRateRing({ rate, size = 52, stroke = 4 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - rate)
  const color = rate >= 0.55 ? '#34d399' : rate >= 0.45 ? '#60a5fa' : '#f472b6'

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" className="transition-all duration-700 ease-out" />
    </svg>
  )
}

// ─── Featured hero card (top 3) ────────────────────────────────────────────
function FeaturedHero({ hero, rank, accent }) {
  const wr = (hero.winrate * 100).toFixed(1)
  const wrColor = hero.winrate >= 0.55 ? '#34d399' : hero.winrate >= 0.45 ? '#e2e8f0' : '#f472b6'
  const imgSrc = `/characters/${hero.display_name}.png`
  const medals = ['', '#FFD700', '#C0C0C0', '#CD7F32']

  return (
    <div className="relative flex-1 min-w-0 group">
      {/* Rank badge */}
      <div className="absolute -top-2 -left-1 z-10 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black"
        style={{ background: medals[rank] || '#475569', color: rank === 1 ? '#000' : '#fff',
          boxShadow: `0 0 8px ${medals[rank] || 'transparent'}40` }}>
        {rank}
      </div>

      <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03]
        hover:border-white/15 btn-transition h-full">
        {/* Glow strip at top */}
        <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, transparent, ${accent.h}60, transparent)` }} />

        <div className="p-4">
          {/* Hero portrait + name */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 ring-1 ring-white/10">
              <img src={imgSrc} alt={hero.display_name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none' }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{hero.display_name}</p>
              <p className="text-[11px] text-white/40">{hero.match_count} games</p>
            </div>
          </div>

          {/* Win rate ring + KDA */}
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <WinRateRing rate={hero.winrate} size={48} stroke={3} />
              <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold"
                style={{ color: wrColor }}>{wr}%</span>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-1 text-center">
              <div>
                <p className="text-sm font-bold text-emerald-400">{hero.avg_kills}</p>
                <p className="text-[9px] text-white/30 uppercase tracking-wider">K</p>
              </div>
              <div>
                <p className="text-sm font-bold text-rose-400">{hero.avg_deaths}</p>
                <p className="text-[9px] text-white/30 uppercase tracking-wider">D</p>
              </div>
              <div>
                <p className="text-sm font-bold text-sky-400">{hero.avg_assists}</p>
                <p className="text-[9px] text-white/30 uppercase tracking-wider">A</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sort options ──────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { key: 'match_count',           label: 'Games',  icon: 'G' },
  { key: 'winrate',               label: 'WR',     icon: 'W' },
  { key: 'avg_kdar',              label: 'KDA',    icon: 'K' },
  { key: 'avg_performance_score', label: 'Perf',   icon: 'P' },
  { key: 'gold_min',              label: 'GPM',    icon: '$' },
]

// ─── Table row ─────────────────────────────────────────────────────────────
function HeroRow({ hero, idx, accent }) {
  const wr = (hero.winrate * 100).toFixed(1)
  const wrColor = hero.winrate >= 0.6 ? '#34d399'
                : hero.winrate >= 0.5 ? '#60a5fa'
                : hero.winrate >= 0.45 ? '#fbbf24'
                : '#f472b6'
  const imgSrc = `/characters/${hero.display_name}.png`
  const wrPct = Math.min(hero.winrate * 100, 100)

  return (
    <tr className="group border-b border-white/[0.04] hover:bg-white/[0.03] btn-transition">
      {/* # */}
      <td className="py-2.5 pl-4 pr-2 text-center">
        <span className="text-[11px] font-medium text-white/25">{idx + 1}</span>
      </td>

      {/* Hero */}
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md overflow-hidden bg-white/5 flex-shrink-0 ring-1 ring-white/[0.06]">
            <img src={imgSrc} alt={hero.display_name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none' }} />
          </div>
          <span className="text-[13px] font-medium text-white/90 truncate">{hero.display_name}</span>
        </div>
      </td>

      {/* Games */}
      <td className="py-2.5 px-3 text-center">
        <span className="text-[13px] text-white/60 font-medium">{hero.match_count}</span>
      </td>

      {/* Win Rate */}
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden max-w-[60px]">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${wrPct}%`, background: wrColor }} />
          </div>
          <span className="text-[13px] font-semibold min-w-[42px] text-right" style={{ color: wrColor }}>
            {wr}%
          </span>
        </div>
      </td>

      {/* KDA */}
      <td className="py-2.5 px-3 text-center">
        <span className="text-[12px]">
          <span className="text-emerald-400 font-semibold">{hero.avg_kills}</span>
          <span className="text-white/20 mx-0.5">/</span>
          <span className="text-rose-400 font-semibold">{hero.avg_deaths}</span>
          <span className="text-white/20 mx-0.5">/</span>
          <span className="text-sky-400 font-semibold">{hero.avg_assists}</span>
        </span>
      </td>

      {/* KDA Ratio */}
      <td className="py-2.5 px-3 text-center">
        <span className="text-[13px] font-bold"
          style={{ color: hero.avg_kdar >= 3 ? '#34d399' : hero.avg_kdar >= 2 ? '#60a5fa' : '#fbbf24' }}>
          {hero.avg_kdar?.toFixed(2)}
        </span>
      </td>

      {/* CS/min */}
      <td className="py-2.5 px-3 text-center hidden lg:table-cell">
        <span className="text-[13px] text-white/50">{hero.cs_min?.toFixed(1) || '—'}</span>
      </td>

      {/* Gold/min */}
      <td className="py-2.5 px-3 text-center hidden lg:table-cell">
        <span className="text-[13px] text-amber-400/70">{Math.round(hero.gold_min || 0)}</span>
      </td>

      {/* Perf */}
      <td className="py-2.5 pr-4 pl-3 text-center">
        <span className="text-[13px] font-medium"
          style={{ color: accent.h + 'cc' }}>
          {hero.avg_performance_score?.toFixed(0) || '—'}
        </span>
      </td>
    </tr>
  )
}

// ─── Modal ─────────────────────────────────────────────────────────────────
export default function HeroStatsModal({ player, onClose }) {
  const [stats, setStats]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [sortBy, setSortBy]     = useState('match_count')
  const [sortDir, setSortDir]   = useState('desc')
  const [closing, setClosing]   = useState(false)
  const backdropRef = useRef(null)

  const accent = rankAccent(player?.rank_title)

  useEffect(() => {
    if (!player) return
    setLoading(true)
    setError(null)
    getPlayerHeroStats(player.id)
      .then((data) => setStats(data.hero_statistics || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [player])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  function handleClose() {
    setClosing(true)
    setTimeout(onClose, 200)
  }

  function handleBackdropClick(e) {
    if (e.target === backdropRef.current) handleClose()
  }

  function toggleSort(key) {
    if (sortBy === key) setSortDir((d) => d === 'desc' ? 'asc' : 'desc')
    else { setSortBy(key); setSortDir('desc') }
  }

  if (!player) return null

  const sorted = stats
    ? [...stats].sort((a, b) => sortDir === 'desc'
        ? (b[sortBy] || 0) - (a[sortBy] || 0)
        : (a[sortBy] || 0) - (b[sortBy] || 0))
    : []

  // Top 3 by games
  const top3 = stats ? [...stats].sort((a, b) => b.match_count - a.match_count).slice(0, 3) : []

  // Overview aggregates
  const totalGames = stats ? stats.reduce((s, h) => s + h.match_count, 0) : 0
  const totalWins  = stats ? stats.reduce((s, h) => s + Math.round(h.match_count * h.winrate), 0) : 0
  const overallWr  = totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(1) : '0.0'
  const bestKda    = stats ? Math.max(...stats.map((h) => h.avg_kdar || 0)).toFixed(2) : '0'
  const avgPerf    = stats && totalGames > 0
    ? (stats.reduce((s, h) => s + (h.avg_performance_score || 0) * h.match_count, 0) / totalGames).toFixed(0)
    : '0'

  const rImg = rankImageSrc(player.rank_title)

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6
        ${closing ? 'hero-modal-backdrop-out' : 'hero-modal-backdrop-in'}`}
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className={`relative w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden rounded-2xl
          border border-white/[0.08] ${closing ? 'hero-modal-out' : 'hero-modal-in'}`}
        style={{ background: 'linear-gradient(180deg, rgba(15,18,25,0.98) 0%, rgba(10,12,18,0.99) 100%)' }}
      >
        {/* ─── Top accent line ─────────────────────────────────────────── */}
        <div className="h-[2px] w-full flex-shrink-0"
          style={{ background: `linear-gradient(90deg, transparent 0%, ${accent.h}80 50%, transparent 100%)` }} />

        {/* ─── Header ──────────────────────────────────────────────────── */}
        <div className="relative flex-shrink-0 px-6 pt-5 pb-4 overflow-hidden">
          {/* Subtle radial glow behind header */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] pointer-events-none"
            style={{ background: `radial-gradient(ellipse, ${accent.g} 0%, transparent 70%)` }} />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              {rImg && (
                <img src={rImg} alt={player.rank_title}
                  className="w-14 h-14 object-contain flex-shrink-0 drop-shadow-lg" />
              )}
              <div className="min-w-0">
                <h2 className="text-2xl font-bold text-white tracking-tight truncate">
                  {player.display_name}
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full border"
                    style={{ color: accent.h, borderColor: accent.h + '40', background: accent.h + '12' }}>
                    {player.rank_title}
                  </span>
                  {player.region && (
                    <span className="text-[11px] text-white/30 uppercase tracking-wider">{player.region}</span>
                  )}
                </div>
              </div>
            </div>

            <button onClick={handleClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white/30
                hover:text-white hover:bg-white/10 btn-transition flex-shrink-0 mt-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Overview stats strip */}
          {stats && (
            <div className="relative flex items-center gap-6 mt-4 pt-4 border-t border-white/[0.06]">
              {[
                { label: 'GAMES',   value: totalGames, color: '#e2e8f0' },
                { label: 'WIN RATE', value: overallWr + '%', color: parseFloat(overallWr) >= 50 ? '#34d399' : '#f472b6' },
                { label: 'HEROES',  value: stats.length, color: '#e2e8f0' },
                { label: 'BEST KDA', value: bestKda, color: '#60a5fa' },
                { label: 'AVG PERF', value: avgPerf, color: accent.h },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-lg font-bold tracking-tight" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[9px] text-white/25 uppercase tracking-widest mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Content ─────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-10 h-10 border-2 border-white/10 rounded-full animate-spin"
                style={{ borderTopColor: accent.h }} />
            </div>
          ) : error ? (
            <div className="text-center py-24 text-rose-400 text-sm">{error}</div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-24 text-white/30 text-sm">No hero statistics found.</div>
          ) : (
            <>
              {/* ── Top 3 featured heroes ──────────────────────────────── */}
              {top3.length > 0 && (
                <div className="px-6 pt-2 pb-4">
                  <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-medium mb-3">
                    Most Played
                  </p>
                  <div className="flex gap-3">
                    {top3.map((hero, i) => (
                      <FeaturedHero key={hero.hero_id} hero={hero} rank={i + 1} accent={accent} />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Sort pills ─────────────────────────────────────────── */}
              <div className="flex items-center gap-1.5 px-6 py-3 border-t border-white/[0.04]">
                <span className="text-[9px] text-white/20 uppercase tracking-[0.15em] mr-2">Sort</span>
                {SORT_OPTIONS.map((opt) => (
                  <button key={opt.key} onClick={() => toggleSort(opt.key)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium btn-transition
                      ${sortBy === opt.key
                        ? 'text-white bg-white/10'
                        : 'text-white/30 hover:text-white/60 hover:bg-white/[0.04]'}`}>
                    {opt.label}
                    {sortBy === opt.key && (
                      <span className="ml-1 text-[9px]">{sortDir === 'desc' ? '▼' : '▲'}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* ── Stats table ─────────────────────────────────────────── */}
              <div className="px-4 pb-4">
                <table className="w-full">
                  <thead>
                    <tr className="text-[9px] uppercase tracking-[0.15em] text-white/20">
                      <th className="py-2 pl-4 pr-2 text-center font-medium w-8">#</th>
                      <th className="py-2 px-3 text-left font-medium">Hero</th>
                      <th className="py-2 px-3 text-center font-medium">Games</th>
                      <th className="py-2 px-3 text-left font-medium min-w-[110px]">Win Rate</th>
                      <th className="py-2 px-3 text-center font-medium">K/D/A</th>
                      <th className="py-2 px-3 text-center font-medium">KDA</th>
                      <th className="py-2 px-3 text-center font-medium hidden lg:table-cell">CS/m</th>
                      <th className="py-2 px-3 text-center font-medium hidden lg:table-cell">GPM</th>
                      <th className="py-2 pr-4 pl-3 text-center font-medium">Perf</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((hero, i) => (
                      <HeroRow key={hero.hero_id} hero={hero} idx={i} accent={accent} />
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* ─── Footer accent ───────────────────────────────────────────── */}
        <div className="h-[1px] w-full flex-shrink-0"
          style={{ background: `linear-gradient(90deg, transparent 10%, ${accent.h}20 50%, transparent 90%)` }} />
      </div>
    </div>
  )
}
