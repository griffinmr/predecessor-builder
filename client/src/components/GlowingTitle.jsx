import { useState, useEffect, useCallback } from 'react'

export default function GlowingTitle({ text = 'Build your champion.' }) {
  const [litCount, setLitCount] = useState(0)
  const [burstActive, setBurstActive] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState(-1)

  const letters = text.split('')
  const totalLetters = letters.length

  useEffect(() => {
    // Sequential letter lighting
    if (litCount < totalLetters) {
      const timer = setTimeout(() => {
        setLitCount(prev => prev + 1)
      }, 60) // 60ms per letter
      return () => clearTimeout(timer)
    } else if (!burstActive && !animationComplete) {
      // All letters lit, trigger the burst
      const burstTimer = setTimeout(() => {
        setBurstActive(true)
        // End burst after 600ms
        setTimeout(() => {
          setBurstActive(false)
          setAnimationComplete(true)
        }, 600)
      }, 100)
      return () => clearTimeout(burstTimer)
    }
  }, [litCount, totalLetters, burstActive, animationComplete])

  // Distance-based glow: letters near the hovered one also glow (dimmer)
  const getHoverClass = useCallback((index) => {
    if (hoveredIndex < 0 || !animationComplete) return ''
    const dist = Math.abs(index - hoveredIndex)
    if (dist === 0) return ' glowing-letter-hover'
    if (dist <= 2) return ' glowing-letter-hover-near'
    return ''
  }, [hoveredIndex, animationComplete])

  return (
    <h1
      className="text-5xl font-semibold tracking-tight glowing-title-container"
      onMouseLeave={() => setHoveredIndex(-1)}
    >
      {letters.map((letter, index) => {
        const isLit = index < litCount
        const isSpace = letter === ' '

        // Build class names
        let className = 'glowing-letter'
        if (isLit) className += ' glowing-letter-lit'
        if (burstActive) className += ' glowing-letter-burst'
        if (animationComplete) className += ' glowing-letter-final'
        className += getHoverClass(index)

        return (
          <span
            key={index}
            className={className}
            onMouseEnter={() => setHoveredIndex(index)}
            style={{
              animationDelay: burstActive ? `${index * 10}ms` : '0ms',
              cursor: animationComplete ? 'default' : undefined,
            }}
          >
            {isSpace ? '\u00A0' : letter}
          </span>
        )
      })}
    </h1>
  )
}
