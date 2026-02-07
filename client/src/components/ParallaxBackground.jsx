import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'

export default function ParallaxBackground() {
  const { theme } = useTheme()
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Cap scroll at a certain point (around the build button area)
  const maxScroll = 2500
  const clampedScroll = Math.min(scrollY, maxScroll)

  // Different parallax speeds for each element (slower, distinct tempos)
  const wraithOffset = clampedScroll * 0.08
  const kwangOffset = clampedScroll * 0.12
  const logoOffset = clampedScroll * 0.04

  return (
    <div className="parallax-container">
      {/* Wraith - Right side */}
      <div
        className="parallax-element parallax-right"
        style={{
          transform: `translateY(${wraithOffset}px)`,
        }}
      >
        <img
          src="/backgrounds/WraithBackground.webp"
          alt=""
          className="parallax-image parallax-image-right"
        />
      </div>

      {/* Kwang - Left side */}
      <div
        className="parallax-element parallax-left"
        style={{
          transform: `translateY(${kwangOffset}px)`,
        }}
      >
        <img
          src="/backgrounds/KwangBackground.png"
          alt=""
          className="parallax-image parallax-image-left"
        />
      </div>

      {/* Logo - Center (theme-dependent) */}
      <div
        className="parallax-element parallax-center"
        style={{
          transform: `translateY(${logoOffset}px)`,
        }}
      >
        <img
          src={theme === 'dark'
            ? '/backgrounds/PredecessorLogoBlack.png'
            : '/backgrounds/PredecessorLogoGold.webp'
          }
          alt=""
          className="parallax-logo"
        />
      </div>
    </div>
  )
}
