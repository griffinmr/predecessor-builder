import { useState, useEffect } from 'react'

export default function GlowingTitle({ text = 'Build your champion.' }) {
  const [litCount, setLitCount] = useState(0)
  const [burstActive, setBurstActive] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)

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

  return (
    <h1 className="text-5xl font-semibold tracking-tight glowing-title-container">
      {letters.map((letter, index) => {
        const isLit = index < litCount
        const isSpace = letter === ' '

        // Build class names
        let className = 'glowing-letter'
        if (isLit) className += ' glowing-letter-lit'
        if (burstActive) className += ' glowing-letter-burst'
        if (animationComplete) className += ' glowing-letter-final'

        return (
          <span
            key={index}
            className={className}
            style={{
              // Stagger the burst animation slightly for each letter
              animationDelay: burstActive ? `${index * 10}ms` : '0ms',
            }}
          >
            {isSpace ? '\u00A0' : letter}
          </span>
        )
      })}
    </h1>
  )
}
