import { useState, useEffect } from 'react'

export default function SparkButton({ onClick, disabled, isGenerating, canGenerate }) {
  const [sparks, setSparks] = useState([])
  const [sparkId, setSparkId] = useState(0)

  // Generate sparks while building
  useEffect(() => {
    if (!isGenerating) {
      setSparks([])
      return
    }

    // Create sparks at intervals while generating
    const interval = setInterval(() => {
      const newSparks = []
      const sparkCount = Math.floor(Math.random() * 3) + 2 // 2-4 sparks per burst

      // Button dimensions (approximate for the rounded pill shape)
      const buttonWidth = 180
      const buttonHeight = 56

      for (let i = 0; i < sparkCount; i++) {
        const angle = Math.random() * 360
        const radians = (angle * Math.PI) / 180

        // Start position on button edge (ellipse)
        const startX = Math.cos(radians) * (buttonWidth / 2)
        const startY = Math.sin(radians) * (buttonHeight / 2)

        // Fly outward distance
        const flyDistance = 40 + Math.random() * 50
        const endX = startX + Math.cos(radians) * flyDistance
        const endY = startY + Math.sin(radians) * flyDistance

        const size = 4 + Math.random() * 6
        const duration = 0.6 + Math.random() * 0.4

        newSparks.push({
          id: sparkId + i,
          size,
          duration,
          startX,
          startY,
          flyX: endX - startX,
          flyY: endY - startY,
        })
      }

      setSparkId(prev => prev + sparkCount)
      setSparks(prev => [...prev.slice(-20), ...newSparks]) // Keep max 20 sparks
    }, 150)

    return () => clearInterval(interval)
  }, [isGenerating, sparkId])

  // Initial burst on click
  const handleClick = () => {
    if (!canGenerate || isGenerating) return

    // Button dimensions (approximate for the rounded pill shape)
    const buttonWidth = 180
    const buttonHeight = 56

    // Create initial burst of sparks from edges
    const burstSparks = []
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * 360
      const radians = (angle * Math.PI) / 180

      // Start position on button edge (ellipse)
      const startX = Math.cos(radians) * (buttonWidth / 2)
      const startY = Math.sin(radians) * (buttonHeight / 2)

      // Fly outward distance
      const flyDistance = 50 + Math.random() * 40
      const endX = startX + Math.cos(radians) * flyDistance
      const endY = startY + Math.sin(radians) * flyDistance

      const size = 6 + Math.random() * 4
      const duration = 0.5 + Math.random() * 0.3

      burstSparks.push({
        id: sparkId + i,
        size,
        duration,
        startX,
        startY,
        flyX: endX - startX,
        flyY: endY - startY,
      })
    }

    setSparkId(prev => prev + 16)
    setSparks(burstSparks)
    onClick()
  }

  return (
    <div className="spark-button-container">
      <button
        type="button"
        onClick={handleClick}
        disabled={!canGenerate || isGenerating}
        className={[
          'spark-button px-12 py-4 rounded-full text-base font-semibold btn-transition focus-ring relative overflow-visible',
          canGenerate && !isGenerating
            ? 'bg-accent-blue hover:bg-accent-blue/90 text-white shadow-lg shadow-accent-blue/25'
            : 'glass text-theme-muted cursor-not-allowed',
          isGenerating ? 'spark-button-generating' : '',
        ].join(' ')}
      >
        {/* Glow effect behind button */}
        {(isGenerating || canGenerate) && (
          <span className={`spark-glow ${isGenerating ? 'spark-glow-active' : ''}`} />
        )}

        {/* Button content */}
        <span className="relative z-10">
          {isGenerating ? (
            <span className="flex items-center gap-3">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
              </svg>
              Generating...
            </span>
          ) : (
            'Generate Build'
          )}
        </span>

        {/* Spark particles */}
        {sparks.map(spark => (
          <span
            key={spark.id}
            className="spark-particle"
            style={{
              '--spark-start-x': `${spark.startX}px`,
              '--spark-start-y': `${spark.startY}px`,
              '--spark-fly-x': `${spark.flyX}px`,
              '--spark-fly-y': `${spark.flyY}px`,
              '--spark-size': `${spark.size}px`,
              '--spark-duration': `${spark.duration}s`,
            }}
          />
        ))}
      </button>
    </div>
  )
}
