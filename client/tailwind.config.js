/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  safelist: [
    // Accent colors used dynamically
    'bg-accent-blue', 'bg-accent-purple', 'bg-accent-pink', 'bg-accent-orange', 'bg-accent-green', 'bg-accent-teal', 'bg-accent-gold',
    'text-accent-blue', 'text-accent-purple', 'text-accent-pink', 'text-accent-orange', 'text-accent-green', 'text-accent-teal', 'text-accent-gold',
    'border-accent-blue', 'border-accent-purple', 'border-accent-pink', 'border-accent-orange', 'border-accent-green', 'border-accent-teal', 'border-accent-gold',
    'ring-accent-blue/30', 'ring-accent-pink/30',
    // Role color backgrounds with opacity
    'bg-accent-pink/15', 'bg-accent-pink/20', 'bg-accent-purple/15', 'bg-accent-purple/20',
    'bg-accent-blue/15', 'bg-accent-blue/20', 'bg-accent-teal/15', 'bg-accent-teal/20',
    'bg-accent-orange/15', 'bg-accent-orange/20', 'bg-accent-green/15', 'bg-accent-green/20',
    'bg-accent-gold/15', 'bg-accent-gold/20',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        // Apple-inspired neutral palette
        surface: {
          50: '#fafafa',
          100: '#f5f5f7',
          200: '#e8e8ed',
          300: '#d2d2d7',
          400: '#86868b',
          500: '#6e6e73',
          600: '#424245',
          700: '#1d1d1f',
          800: '#161617',
          900: '#0d0d0d',
          950: '#000000',
        },
        // Accent colors
        accent: {
          blue: '#0071e3',
          purple: '#bf5af2',
          pink: '#ff375f',
          orange: '#ff9f0a',
          green: '#30d158',
          teal: '#64d2ff',
          gold: '#ffd60a',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'card-reveal': 'cardReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        cardReveal: {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.9)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
