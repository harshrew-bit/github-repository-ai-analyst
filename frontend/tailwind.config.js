/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#090d16',
        surface: {
          50: '#0d121f',
          100: '#111726',
          200: '#161e31',
          300: '#1d273f',
          border: '#202a40',
          'border-highlight': '#334155',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
          900: '#064e3b',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
        sky: {
          400: '#38bdf8',
          500: '#0ea5e9',
        },
        github: {
          dark: '#090d16',
          card: '#111726',
          border: '#202a40',
          hover: '#161e31',
          text: '#f1f5f9',
          muted: '#94a3b8',
          accent: '#6366f1',
          success: '#10b981',
          successText: '#34d399',
          warning: '#f59e0b',
          danger: '#f43f5e'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      }
    },
  },
  plugins: [],
}
