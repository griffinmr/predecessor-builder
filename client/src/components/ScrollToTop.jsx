import { useState, useEffect } from 'react'

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 400px
      if (window.scrollY > 400) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)

    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <button
      onClick={scrollToTop}
      className={[
        'fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full glass border border-accent-blue/30',
        'hover:border-accent-blue btn-transition shadow-lg hover:shadow-accent-blue/20',
        'group focus-ring flex items-center gap-2',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none',
      ].join(' ')}
      aria-label="Scroll to top"
    >
      <svg
        className="w-5 h-5 text-accent-blue group-hover:text-white btn-transition"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
      <span className="text-sm font-medium text-accent-blue group-hover:text-white btn-transition">
        Ascend
      </span>
    </button>
  )
}
