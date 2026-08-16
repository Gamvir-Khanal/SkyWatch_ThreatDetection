export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        skywatch: {
          bg: '#050810',
          emerald: '#10b981',
          crimson: '#e11d48'
        }
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'glow': 'glow 2s infinite',
        'radar-spin': 'radarSpin 4s linear infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        glow: {
          '0%, 100%': { opacity: 1, textShadow: '0 0 10px rgba(16, 185, 129, 0.5)' },
          '50%': { opacity: 0.8, textShadow: '0 0 20px rgba(16, 185, 129, 0.8)' },
        },
        radarSpin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
