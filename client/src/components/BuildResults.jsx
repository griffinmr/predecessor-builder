import { useEffect, useRef, useState } from 'react'
import ItemCard from './ItemCard'
import { ROLES } from '../data/mockData'

export default function BuildResults({ result, historyId, isSaved, onSave }) {
  const role = ROLES.find((r) => r.id === result.role)
  const sectionRef = useRef(null)
  const [visibleCards, setVisibleCards] = useState(0)
  const [isStrategyExpanded, setIsStrategyExpanded] = useState(true)
  const [isTipsExpanded, setIsTipsExpanded] = useState(true)

  // Auto-scroll to build results when they appear
  useEffect(() => {
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  // Staggered card reveal animation
  useEffect(() => {
    const totalCards = (result.crest ? 1 : 0) + result.items.length
    let count = 0
    const interval = setInterval(() => {
      count++
      setVisibleCards(count)
      if (count >= totalCards) {
        clearInterval(interval)
      }
    }, 120)
    return () => clearInterval(interval)
  }, [result.crest, result.items.length])

  return (
    <section ref={sectionRef} className="animate-slide-up scroll-mt-8">
      {/* ── divider ── */}
      <div className="h-px bg-gradient-to-r from-transparent via-[var(--border-color)] to-transparent mb-16" />

      {/* ── heading ── */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-semibold text-theme-primary tracking-tight mb-3">
          Your Build
        </h2>
        <p className="text-theme-secondary">
          Optimized item recommendations for{' '}
          <span className="text-theme-primary font-medium">{result.character.name}</span>
          {' '}as{' '}
          <span className="text-theme-primary font-medium">{role?.label}</span>
        </p>
      </div>

      {/* ── context badges ── */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        <span className="glass px-4 py-2 rounded-full text-sm text-theme-secondary">
          <span className="text-theme-muted">Character:</span>{' '}
          <span className="text-theme-primary font-medium">{result.character.name}</span>
        </span>

        <span className="glass px-4 py-2 rounded-full text-sm text-theme-secondary">
          <span className="text-theme-muted">Role:</span>{' '}
          <span className="text-theme-primary font-medium">{role?.label}</span>
        </span>

        {result.enemies.length > 0 && (
          <span className="glass px-4 py-2 rounded-full text-sm text-theme-secondary">
            <span className="text-theme-muted">vs</span>{' '}
            <span className="text-accent-pink font-medium">
              {result.enemies.map((e) => e.name).join(', ')}
            </span>
          </span>
        )}
      </div>

      {/* ── strategy box ── */}
      <div className="rounded-2xl border border-accent-blue/30 bg-accent-blue/10 overflow-hidden mb-4 max-w-3xl mx-auto animate-fade-in">
        <div className="px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-2 h-2 rounded-full bg-accent-blue" />
            <h3 className="font-semibold text-accent-blue">Strategy</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsStrategyExpanded(!isStrategyExpanded)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium btn-transition text-accent-blue hover:bg-accent-blue/10"
          >
            {isStrategyExpanded ? 'Show less' : 'Show more'}
          </button>
        </div>
        <div className="px-5 pb-4">
          <p className={`text-sm text-theme-primary leading-relaxed ${isStrategyExpanded ? '' : 'line-clamp-2'}`}>
            {result.strategy}
          </p>
        </div>
      </div>

      {/* ── tips box ── */}
      {result.tips && (
        <div className="rounded-2xl border border-accent-green/30 bg-accent-green/10 overflow-hidden mb-4 max-w-3xl mx-auto animate-fade-in">
          <div className="px-5 py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-2 h-2 rounded-full bg-accent-green" />
              <h3 className="font-semibold text-accent-green">Tips</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsTipsExpanded(!isTipsExpanded)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium btn-transition text-accent-green hover:bg-accent-green/10"
            >
              {isTipsExpanded ? 'Show less' : 'Show more'}
            </button>
          </div>
          <div className="px-5 pb-4">
            <p className={`text-sm text-theme-primary leading-relaxed ${isTipsExpanded ? '' : 'line-clamp-2'}`}>
              {result.tips}
            </p>
          </div>
        </div>
      )}

      {/* ── crest + build order ── */}
      <div className="mt-12">
        <h3 className="text-center text-sm font-medium text-theme-secondary uppercase tracking-wider mb-6">
          Build Order
        </h3>
        <div className="flex flex-col lg:flex-row gap-6 max-w-5xl mx-auto items-center justify-center">
          {/* ── crest card ── */}
          {result.crest && (
            <div className="flex flex-col items-center">
              <span className="text-xs font-medium text-accent-gold uppercase tracking-wider mb-3">Crest</span>
              <div className="w-40">
                <ItemCard item={result.crest} shouldFlip={visibleCards >= 1} />
              </div>
            </div>
          )}

          {/* ── separator ── */}
          {result.crest && (
            <div
              className={`hidden lg:flex items-center transition-all duration-300 ${
                visibleCards >= 1 ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="w-px h-32 bg-gradient-to-b from-transparent via-[var(--border-color)] to-transparent" />
              <svg className="w-4 h-4 text-theme-muted mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}

          {/* ── items grid ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {result.items.map((item, i) => {
              const cardIndex = (result.crest ? 1 : 0) + i
              return (
                <div key={item.id || item.name}>
                  <ItemCard item={item} index={i} shouldFlip={visibleCards > cardIndex} />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── save button ── */}
      {historyId && (
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={onSave}
            disabled={isSaved}
            style={isSaved ? {} : {
              background: 'var(--bg-tertiary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
            className={[
              'px-8 py-3 rounded-full text-sm font-medium btn-transition focus-ring border',
              isSaved
                ? 'bg-accent-green/20 text-accent-green border-accent-green/30 cursor-default'
                : 'hover:opacity-90',
            ].join(' ')}
          >
            {isSaved ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved
              </span>
            ) : (
              'Save Build'
            )}
          </button>
        </div>
      )}
    </section>
  )
}
