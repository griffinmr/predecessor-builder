import { useTheme } from '../context/ThemeContext'

export default function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 glass-dark">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Logo / Brand */}
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 flex items-center justify-center flex-shrink-0">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent-blue/20 to-accent-purple/20" />
            <div className="absolute inset-0 rounded-xl border border-white/10" />
            <svg className="w-[18px] h-[18px] relative z-10" viewBox="0 0 20 20" fill="none">
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

          <div className="flex flex-col justify-center">
            <span className="text-[15px] font-semibold text-theme-primary tracking-tight leading-none">
              Predecessor
            </span>
            <span className="text-[10px] font-medium text-theme-secondary tracking-[0.12em] uppercase mt-[3px]">
              Build Builder
            </span>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* AI-Powered pill badge */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-accent-green"
            style={{
              background: 'rgba(48, 209, 88, 0.08)',
              border: '1px solid rgba(48, 209, 88, 0.18)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
            AI-Powered
          </div>

          {/* Vertical divider */}
          <div className="w-px h-4 mx-1" style={{ background: 'var(--border-color)' }} />

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg btn-transition hover:scale-105 focus-ring"
            style={{ background: 'var(--hover-bg)' }}
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
        </div>
      </div>

      {/* Gradient accent line */}
      <div
        className="h-px w-full"
        style={{ background: 'linear-gradient(to right, transparent, rgba(0,113,227,0.35), rgba(191,90,242,0.25), transparent)' }}
      />
    </header>
  )
}
