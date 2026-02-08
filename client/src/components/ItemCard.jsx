import React from 'react'

// ── Animations ──
const animations = `
  @keyframes cardPop {
    0% {
      opacity: 0;
      transform: scale(0.8) translateY(16px);
    }
    60% {
      transform: scale(1.05) translateY(-4px);
    }
    80% {
      transform: scale(0.98) translateY(2px);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @keyframes sparkle {
    0% {
      opacity: 1;
      transform: translate(-50%, -50%) translate(0, 0) scale(0);
    }
    50% {
      opacity: 1;
      transform: translate(-50%, -50%) translate(var(--sparkle-x), var(--sparkle-y)) scale(1.5);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) translate(calc(var(--sparkle-x) * 1.5), calc(var(--sparkle-y) * 1.5)) scale(0);
    }
  }
`

// Inject/update animations in head
if (typeof document !== 'undefined') {
  const styleId = 'item-card-animations'
  let styleEl = document.getElementById(styleId)
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = styleId
    document.head.appendChild(styleEl)
  }
  styleEl.textContent = animations
}

// ── colour tokens per item category (Apple-inspired) ─────────────────────────
const CAT = {
  physical: { bg: 'bg-accent-pink/15',   text: 'text-accent-pink',   dot: 'bg-accent-pink' },
  magic:    { bg: 'bg-accent-purple/15', text: 'text-accent-purple', dot: 'bg-accent-purple' },
  magical:  { bg: 'bg-accent-purple/15', text: 'text-accent-purple', dot: 'bg-accent-purple' },
  tank:     { bg: 'bg-accent-blue/15',   text: 'text-accent-blue',   dot: 'bg-accent-blue' },
  defense:  { bg: 'bg-accent-blue/15',   text: 'text-accent-blue',   dot: 'bg-accent-blue' },
  utility:  { bg: 'bg-accent-teal/15',   text: 'text-accent-teal',   dot: 'bg-accent-teal' },
  ability:  { bg: 'bg-accent-orange/15', text: 'text-accent-orange', dot: 'bg-accent-orange' },
  crest:    { bg: 'bg-accent-gold/15',   text: 'text-accent-gold',   dot: 'bg-accent-gold' },
  passive:  { bg: 'bg-accent-teal/15',   text: 'text-accent-teal',   dot: 'bg-accent-teal' },
  active:   { bg: 'bg-accent-orange/15', text: 'text-accent-orange', dot: 'bg-accent-orange' },
}

// gradient colours used for the item icon area (inline to survive purge)
const ICON_GRADS = [
  { from: '#0d0d0d', to: '#1a1a2e' },
  { from: '#0d0d0d', to: '#1a2e1a' },
  { from: '#0d0d0d', to: '#2e1a1a' },
  { from: '#0d0d0d', to: '#1a2e2e' },
  { from: '#0d0d0d', to: '#2e1a2e' },
]

function hashId(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h)
  return Math.abs(h)
}

export default function ItemCard({ item, index, shouldFlip = false }) {
  const styles   = CAT[item.category?.toLowerCase()] || CAT.utility
  const gradient = ICON_GRADS[hashId(item.id || item.name) % ICON_GRADS.length]
  const [tilt, setTilt] = React.useState({ x: 0, y: 0, mouseX: 0, mouseY: 0 })
  const [hasLanded, setHasLanded] = React.useState(false)
  const [isFlipped, setIsFlipped] = React.useState(false)
  const [sparkles, setSparkles] = React.useState([])
  const cardRef = React.useRef(null)

  // Step 1: after pop animation completes, trigger sparkles
  React.useEffect(() => {
    const popDuration = 500
    const stagger = (index || 0) * 100
    const timer = setTimeout(() => {
      setHasLanded(true)
      const newSparkles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        angle: (i / 12) * Math.PI * 2,
        distance: 40 + Math.random() * 20,
        size: 2 + Math.random() * 3,
        delay: Math.random() * 100
      }))
      setSparkles(newSparkles)
      setTimeout(() => setSparkles([]), 800)
    }, stagger + popDuration)
    return () => clearTimeout(timer)
  }, [index])

  // Step 2: flip after landing — 300ms pause so the logo is clearly visible first
  React.useEffect(() => {
    if (!hasLanded || !shouldFlip) return
    const timer = setTimeout(() => setIsFlipped(true), 300)
    return () => clearTimeout(timer)
  }, [hasLanded, shouldFlip])

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY
    const rotateY = (mouseX / rect.width) * 50
    const rotateX = -(mouseY / rect.height) * 50
    setTilt({ x: rotateX, y: rotateY, mouseX: (mouseX / rect.width) * 100, mouseY: (mouseY / rect.height) * 100 })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, mouseX: 0, mouseY: 0 })
  }

  const popDelay = (index || 0) * 100

  return (
    <div className="relative w-full" style={{ perspective: '1200px' }}>
      {/* Sparkle particles */}
      {sparkles.map(sparkle => (
        <div
          key={sparkle.id}
          className="absolute top-1/2 left-1/2 pointer-events-none"
          style={{
            animation: `sparkle 0.7s ease-out ${sparkle.delay}ms forwards`,
            transform: `translate(-50%, -50%) translate(${Math.cos(sparkle.angle) * 60}px, ${Math.sin(sparkle.angle) * 60}px)`,
            '--sparkle-x': `${Math.cos(sparkle.angle) * sparkle.distance}px`,
            '--sparkle-y': `${Math.sin(sparkle.angle) * sparkle.distance}px`,
          }}
        >
          <div
            className="rounded-full bg-accent-gold shadow-[0_0_8px_rgba(255,215,0,0.8)]"
            style={{ width: `${sparkle.size}px`, height: `${sparkle.size}px` }}
          />
        </div>
      ))}

      {/* ── LOGO CARD — the face shown during pop-up, fades when card flips ── */}
      <div
        className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
        style={{
          animation: isFlipped ? 'none' : `cardPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${popDelay}ms both`,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
          opacity: isFlipped ? 0 : hasLanded ? 1 : undefined,
          transition: 'opacity 0.35s ease',
          zIndex: 1,
        }}
      >
        <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#0a0a14] flex items-center justify-center p-6">
          <img
            src="/backgrounds/PredecessorLogoGold.webp"
            alt="Predecessor"
            className="w-full h-full object-contain opacity-70"
          />
        </div>
      </div>

      {/* ── ITEM CARD — revealed by the flip ── */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full transition-transform ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transitionDuration: isFlipped ? '1800ms' : '0ms',
          transform: `rotateX(${tilt.x}deg) rotateY(${(isFlipped ? 0 : 180) + tilt.y}deg) translateZ(${Math.abs(tilt.x) + Math.abs(tilt.y) > 0 ? '30px' : '0px'})`
        }}
      >
        {/* ── CARD FRONT (item details) ── */}
        <div
          className="glass rounded-2xl overflow-hidden group w-full relative"
          style={{
            backfaceVisibility: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
            transform: 'translateZ(1px)'
          }}
        >
          {/* Holographic shine overlay */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              opacity: Math.abs(tilt.x) + Math.abs(tilt.y) > 0 ? 0.3 : 0,
              background: `radial-gradient(circle at ${50 + (tilt.mouseX || 0)}% ${50 + (tilt.mouseY || 0)}%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 20%, transparent 60%)`
            }}
          />
          {/* ── icon area ── */}
          <div
            className="w-full h-24 relative flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})` }}
          >
            <span className="text-3xl font-light text-white/15 group-hover:text-white/25 btn-transition">
              {item.name[0]}
            </span>

            {/* step-number badge */}
            {index !== undefined && (
              <div className="absolute top-3 left-3 w-6 h-6 bg-[var(--tab-active-bg)] rounded-full flex items-center justify-center text-[var(--tab-active-text)] text-xs font-semibold shadow-lg">
                {index + 1}
              </div>
            )}
          </div>

          {/* ── info ── */}
          <div className="p-4">
            <h4 className="text-theme-primary text-sm font-medium leading-snug">{item.name}</h4>

            <div className="flex items-center gap-1.5 mt-2">
              <div className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
              <span className={`text-[10px] font-medium uppercase tracking-wider ${styles.text}`}>
                {item.category}
              </span>
            </div>

            <p className="text-theme-secondary text-xs leading-relaxed mt-2 line-clamp-2">{item.description}</p>
            {item.price && <p className="text-accent-orange text-xs font-medium mt-3">{item.price} gold</p>}
          </div>
        </div>

                {/* ── CARD BACK ── */}
        <div
          className="absolute inset-0 glass rounded-2xl overflow-hidden flex items-center justify-center"
          style={{
            backfaceVisibility: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
            transform: 'rotateY(180deg) translateZ(1px)'
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#0a0a14] flex items-center justify-center p-6">
            <img
              src="/backgrounds/PredecessorLogoGold.webp"
              alt="Predecessor"
              className="w-full h-full object-contain opacity-70"
            />
          </div>
        </div>
        

        {/* ── CARD EDGES (for 3D thickness) ── */}
        <div
          className="absolute top-0 left-0 w-full bg-gradient-to-b from-[#2a2a3e] to-[#1a1a2e] rounded-2xl"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateX(90deg) translateZ(-1px)', height: '2px', transformOrigin: 'top' }}
        />
        <div
          className="absolute bottom-0 left-0 w-full bg-gradient-to-b from-[#1a1a2e] to-[#0a0a0a] rounded-2xl"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateX(-90deg) translateZ(-1px)', height: '2px', transformOrigin: 'bottom' }}
        />
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#2a2a3e] to-[#1a1a2e] rounded-2xl"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(-90deg) translateZ(-1px)', width: '2px', transformOrigin: 'left' }}
        />
        <div
          className="absolute top-0 right-0 h-full bg-gradient-to-r from-[#1a1a2e] to-[#0a0a0a] rounded-2xl"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(90deg) translateZ(-1px)', width: '2px', transformOrigin: 'right' }}
        />
      </div>
    </div>
  )
}
