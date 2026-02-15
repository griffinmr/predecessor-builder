import { useRef, useEffect, useState, useCallback } from 'react'
import { useTheme } from '../context/ThemeContext'

/* ── Nav configuration ─────────────────────────────────────────────── */
const NAV_ITEMS = [
  {
    id: 'builder',
    label: 'Builder',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    id: 'heroes',
    label: 'Heroes',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    id: 'builds',
    label: 'Community Builds',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 'leaderboard',
    label: 'Leaderboard',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
]

/* ── Header ────────────────────────────────────────────────────────── */
export default function Header({ activePage = 'builder', onNavigate }) {
  const { theme, toggleTheme } = useTheme()

  /* sliding indicator state */
  const navRef = useRef(null)
  const btnRefs = useRef({})
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  const updateIndicator = useCallback(() => {
    const nav = navRef.current
    const btn = btnRefs.current[activePage]
    if (!nav || !btn) return
    const navRect = nav.getBoundingClientRect()
    const btnRect = btn.getBoundingClientRect()
    setIndicator({
      left: btnRect.left - navRect.left,
      width: btnRect.width,
    })
  }, [activePage])

  useEffect(() => {
    updateIndicator()
    window.addEventListener('resize', updateIndicator)
    return () => window.removeEventListener('resize', updateIndicator)
  }, [updateIndicator])

  /* mobile menu */
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 header-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">

          {/* ── Left: logo + nav ──────────────────────────── */}
          <div className="flex items-center gap-8">

            {/* Logo */}
            <button
              type="button"
              onClick={() => onNavigate?.('builder')}
              className="group flex items-center gap-3 focus-ring rounded-xl pr-2"
            >
              <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 group-hover:from-accent-blue/30 group-hover:to-accent-purple/30 btn-transition" />
                <div className="absolute inset-0 rounded-xl border border-white/10 group-hover:border-white/20 btn-transition" />
                <svg className="w-5 h-5 relative z-10" viewBox="0 0 20 20" fill="none">
                  <polygon
                    points="10,1.5 18,6.25 18,13.75 10,18.5 2,13.75 2,6.25"
                    stroke="url(#hGradStroke)"
                    strokeWidth="1.25"
                    fill="url(#hGradFill)"
                    strokeLinejoin="round"
                  />
                  <line x1="10" y1="1.5" x2="10" y2="18.5" stroke="url(#hGradInner)" strokeWidth="0.75" opacity="0.5" />
                  <line x1="2" y1="6.25" x2="18" y2="13.75" stroke="url(#hGradInner)" strokeWidth="0.75" opacity="0.3" />
                  <line x1="18" y1="6.25" x2="2" y2="13.75" stroke="url(#hGradInner)" strokeWidth="0.75" opacity="0.3" />
                  <defs>
                    <linearGradient id="hGradStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0071e3" />
                      <stop offset="100%" stopColor="#bf5af2" />
                    </linearGradient>
                    <linearGradient id="hGradFill" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0071e3" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#bf5af2" stopOpacity="0.1" />
                    </linearGradient>
                    <linearGradient id="hGradInner" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#64d2ff" />
                      <stop offset="100%" stopColor="#bf5af2" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div className="hidden sm:flex flex-col justify-center text-left">
                <span className="text-[15px] font-bold text-theme-primary tracking-tight leading-none">
                  Predecessor
                </span>
                <span className="text-[10px] font-semibold tracking-[0.14em] uppercase mt-[3px] bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
                  Build Crafter
                </span>
              </div>
            </button>

            {/* Desktop nav with sliding indicator */}
            <nav ref={navRef} className="hidden md:flex items-center gap-0.5 relative">
              {/* Animated background pill */}
              <div
                className="absolute top-0 h-full rounded-xl nav-indicator-glow btn-transition"
                style={{
                  left: indicator.left,
                  width: indicator.width,
                  opacity: indicator.width ? 1 : 0,
                }}
              />
              {NAV_ITEMS.map((item) => {
                const isActive = activePage === item.id
                return (
                  <button
                    key={item.id}
                    ref={(el) => { btnRefs.current[item.id] = el }}
                    type="button"
                    onClick={() => onNavigate?.(item.id)}
                    className={[
                      'relative z-10 flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold btn-transition select-none',
                      isActive
                        ? 'text-accent-blue'
                        : 'text-theme-secondary hover:text-theme-primary',
                    ].join(' ')}
                  >
                    <span className={[
                      'btn-transition',
                      isActive ? 'opacity-100' : 'opacity-50 group-hover:opacity-80',
                    ].join(' ')}>
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* ── Right: badge + controls ───────────────────── */}
          <div className="flex items-center gap-3">
            {/* AI pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide uppercase nav-ai-badge">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green" />
              </span>
              AI-Powered
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-5 bg-gradient-to-b from-transparent via-white/15 to-transparent" />

            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="relative p-2.5 rounded-xl btn-transition hover:scale-105 focus-ring nav-theme-toggle"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <svg className="w-[18px] h-[18px] text-theme-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-[18px] h-[18px] text-theme-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden p-2 rounded-xl btn-transition focus-ring nav-theme-toggle"
              aria-label="Toggle navigation"
            >
              <svg className="w-5 h-5 text-theme-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} strokeLinecap="round">
                {mobileOpen ? (
                  <path d="M6 6l12 12M6 18L18 6" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 nav-mobile-dropdown">
          <div className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activePage === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { onNavigate?.(item.id); setMobileOpen(false) }}
                  className={[
                    'flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-semibold btn-transition',
                    isActive
                      ? 'text-accent-blue nav-indicator-glow'
                      : 'text-theme-secondary hover:text-theme-primary hover:bg-white/[0.05]',
                  ].join(' ')}
                >
                  {item.icon}
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Gradient accent line */}
      <div className="h-px w-full nav-bottom-line" />
    </header>
  )
}
