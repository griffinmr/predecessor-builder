import React from 'react'

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
  const cardRef = React.useRef(null)

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY

    // Calculate tilt angles (max ±25 degrees) - increased for more dramatic effect
    const rotateY = (mouseX / rect.width) * 50
    const rotateX = -(mouseY / rect.height) * 50

    setTilt({ x: rotateX, y: rotateY, mouseX: (mouseX / rect.width) * 100, mouseY: (mouseY / rect.height) * 100 })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, mouseX: 0, mouseY: 0 })
  }

  return (
    <div className="relative w-full" style={{ perspective: '1200px' }}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`relative w-full ${shouldFlip ? 'duration-[1800ms]' : 'duration-200'} transition-transform ease-out`}
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${tilt.x}deg) rotateY(${(shouldFlip ? 0 : 180) + tilt.y}deg) translateZ(${Math.abs(tilt.x) + Math.abs(tilt.y) > 0 ? '30px' : '0px'})`
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
            className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-300"
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
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e]/90 to-[#0d0d0d]/90 flex items-center justify-center p-6">
            <img
              src="/backgrounds/PredecessorLogoGold.webp"
              alt="Predecessor"
              className="w-full h-full object-contain opacity-30"
            />
          </div>
        </div>

        {/* ── CARD EDGES (for 3D thickness) ── */}
        {/* Top edge */}
        <div
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#2a2a3e] to-[#1a1a2e] rounded-2xl"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateX(90deg) translateZ(-1px)',
            height: '2px',
            transformOrigin: 'top'
          }}
        />
        {/* Bottom edge */}
        <div
          className="absolute bottom-0 left-0 w-full bg-gradient-to-b from-[#1a1a2e] to-[#0a0a0a] rounded-2xl"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateX(-90deg) translateZ(-1px)',
            height: '2px',
            transformOrigin: 'bottom'
          }}
        />
        {/* Left edge */}
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#2a2a3e] to-[#1a1a2e] rounded-2xl"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(-90deg) translateZ(-1px)',
            width: '2px',
            transformOrigin: 'left'
          }}
        />
        {/* Right edge */}
        <div
          className="absolute top-0 right-0 h-full bg-gradient-to-r from-[#1a1a2e] to-[#0a0a0a] rounded-2xl"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(90deg) translateZ(-1px)',
            width: '2px',
            transformOrigin: 'right'
          }}
        />
      </div>
    </div>
  )
}
