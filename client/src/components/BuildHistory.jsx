import { useState, useEffect, useCallback } from 'react'
import ItemCard from './ItemCard'
import { ROLES } from '../data/mockData'
import { getBuilds, getSavedBuilds } from '../services/api'

export default function BuildHistory() {
  const [isOpen,     setIsOpen]     = useState(false)
  const [tab,        setTab]        = useState('all')
  const [history,    setHistory]    = useState([])
  const [saved,      setSaved]      = useState([])
  const [expandedId, setExpandedId] = useState(null)
  const [isLoading,  setIsLoading]  = useState(false)

  const fetchData = useCallback(() => {
    setIsLoading(true)
    const fn = tab === 'saved' ? getSavedBuilds : () => getBuilds(20)
    fn()
      .then((data) => (tab === 'saved' ? setSaved(data) : setHistory(data)))
      .catch((err) => console.error('History fetch failed:', err))
      .finally(() => setIsLoading(false))
  }, [tab])

  useEffect(() => {
    if (isOpen) fetchData()
  }, [isOpen, fetchData])

  const list = tab === 'saved' ? saved : history

  return (
    <section>
      {/* ── toggle heading ── */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-3 text-theme-secondary hover:text-theme-primary btn-transition group"
      >
        <svg
          className={`w-4 h-4 btn-transition ${isOpen ? 'rotate-90' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-sm font-medium">Build History</span>
        {(history.length > 0 || saved.length > 0) && (
          <span className="text-xs text-theme-muted glass px-2 py-0.5 rounded-full">
            {history.length || saved.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="mt-6 animate-fade-in">
          {/* ── tab bar ── */}
          <div className="inline-flex p-1 glass rounded-xl mb-6">
            {['all', 'saved'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={[
                  'px-5 py-2 rounded-lg text-sm font-medium btn-transition',
                  tab === t ? 'tab-active' : 'tab-inactive',
                ].join(' ')}
              >
                {t === 'all' ? 'All Builds' : 'Saved'}
              </button>
            ))}
          </div>

          {/* ── list ── */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-theme border-t-accent-blue rounded-full animate-spin" />
            </div>
          )}

          {!isLoading && list.length === 0 && (
            <div className="text-center py-12 text-theme-muted">
              {tab === 'saved' ? 'No saved builds yet.' : 'No builds generated yet.'}
            </div>
          )}

          {!isLoading && list.length > 0 && (
            <div className="flex flex-col gap-3">
              {list.map((entry) => {
                const id         = entry.build_history_id || entry.id
                const isExpanded = expandedId === id
                const role       = ROLES.find((r) => r.id === entry.role)

                return (
                  <div key={id} className="glass rounded-2xl overflow-hidden">
                    {/* ── summary row ── */}
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : id)}
                      className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-[var(--hover-bg)] btn-transition"
                    >
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-theme-primary font-medium">
                          {entry.character_name}
                        </span>
                        <span className="text-theme-muted text-sm">
                          {role?.label || entry.role}
                        </span>
                        {entry.enemy_names?.length > 0 && (
                          <span className="text-theme-muted text-sm">
                            vs {entry.enemy_names.join(', ')}
                          </span>
                        )}
                        {entry.saved && (
                          <span className="text-accent-green text-xs font-medium bg-accent-green/15 px-2 py-0.5 rounded-full">
                            Saved
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-theme-muted text-sm">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </span>
                        <svg
                          className={`w-4 h-4 text-theme-muted btn-transition ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {/* ── expanded detail ── */}
                    {isExpanded && (
                      <div className="px-5 pb-5 border-t border-theme pt-4 animate-fade-in">
                        <p className="text-theme-secondary text-sm leading-relaxed mb-4">{entry.strategy}</p>
                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                          {/* ── crest ── */}
                          {entry.crest && (
                            <div className="flex flex-col items-center shrink-0">
                              <span className="text-xs font-medium text-accent-gold uppercase tracking-wider mb-2">Crest</span>
                              <div className="w-32">
                                <ItemCard item={entry.crest} shouldFlip={true} />
                              </div>
                            </div>
                          )}
                          {/* ── items ── */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 flex-1">
                            {entry.items.map((item, i) => (
                              <ItemCard key={item.id || item.name} item={item} index={i} shouldFlip={true} />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
