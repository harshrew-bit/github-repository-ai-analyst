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
        // Warm ivory / soft-white canvas
        canvas: '#FAFAF8',
        'canvas-subtle': '#F4F3EF',
        'canvas-muted': '#EDECEA',

        // Ink typography
        ink: {
          DEFAULT: '#1A1917',
          secondary: '#3D3B38',
          tertiary: '#6B6860',
          placeholder: '#9B9892',
          disabled: '#C4C2BC',
        },

        // Cobalt / electric-blue accent
        cobalt: {
          50:  '#EFF5FF',
          100: '#DAEAFF',
          200: '#B5D5FF',
          300: '#7BB8FF',
          400: '#3D96FF',
          500: '#1570EF', // primary accent
          600: '#1054C8',
          700: '#0D3F9C',
          800: '#0A2E72',
          900: '#071E4A',
        },

        // Warm neutrals for dividers, surfaces
        stone: {
          50:  '#FAFAF8',
          100: '#F4F3EF',
          200: '#EDECEA',
          300: '#D8D6D0',
          400: '#BAB8B0',
          500: '#9B9892',
          600: '#7A7870',
          700: '#5A5850',
          800: '#3D3B38',
          900: '#1A1917',
        },

        // Semantic colors
        success: {
          light: '#DCFCE7',
          DEFAULT: '#16A34A',
          dark: '#15803D',
          text: '#166534',
        },
        warning: {
          light: '#FEF3C7',
          DEFAULT: '#D97706',
          dark: '#B45309',
          text: '#92400E',
        },
        error: {
          light: '#FEE2E2',
          DEFAULT: '#DC2626',
          dark: '#B91C1C',
          text: '#991B1B',
        },

        // Warm mesh gradient tokens (coral, peach, blush, cream)
        coral: {
          50:  '#FFF5F2',
          100: '#FFE8E2',
          200: '#FFD4C9',
          300: '#FFAF9E',
          400: '#FF8066',
          500: '#FF6347',
          600: '#E64A2E',
        },
        peach: {
          50:  '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
        },
        blush: {
          50:  '#FFF1F2',
          100: '#FFE4E6',
          200: '#FECDD3',
          300: '#FDA4AF',
          400: '#FB7185',
        },
        cream: {
          warm: '#FBF9F5',
          canvas: '#FAF7F2',
        },

        // Cinematic charcoal scale for dark atmospheric surfaces & code blocks
        charcoal: {
          950: '#0B0B0A',
          900: '#111110', // primary dark background
          850: '#161615',
          800: '#1C1C1A',
          750: '#232321',
          700: '#282826',
          600: '#363633',
          500: '#48474A',
        },
      },

      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace'],
      },

      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
        '3xs': ['9px', { lineHeight: '12px' }],
      },

      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
        normal: '-0.01em',
        wide: '0.04em',
        wider: '0.08em',
        widest: '0.12em',
      },

      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },

      boxShadow: {
        'subtle': '0 1px 3px rgba(26, 25, 23, 0.06), 0 1px 2px rgba(26, 25, 23, 0.04)',
        'lifted': '0 4px 12px rgba(26, 25, 23, 0.08), 0 2px 4px rgba(26, 25, 23, 0.04)',
        'floated': '0 8px 24px rgba(26, 25, 23, 0.10), 0 4px 8px rgba(26, 25, 23, 0.05)',
        'deep': '0 20px 48px rgba(26, 25, 23, 0.14), 0 8px 16px rgba(26, 25, 23, 0.08)',
        'cobalt-sm': '0 2px 8px rgba(21, 112, 239, 0.20)',
        'cobalt': '0 4px 20px rgba(21, 112, 239, 0.30)',
        'cobalt-glow': '0 0 32px rgba(21, 112, 239, 0.18)',
        'warm-glow': '0 0 50px rgba(255, 128, 102, 0.16)',
        'glass': '0 8px 30px rgba(26, 25, 23, 0.05), 0 1px 2px rgba(26, 25, 23, 0.03)',
        'glass-hover': '0 12px 36px rgba(26, 25, 23, 0.08), 0 2px 4px rgba(26, 25, 23, 0.04)',
        'inner-subtle': 'inset 0 1px 2px rgba(26, 25, 23, 0.04)',
        'dark-lifted': '0 8px 32px rgba(0, 0, 0, 0.45), 0 1px 2px rgba(255, 255, 255, 0.05) inset',
      },

      animation: {
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-up': 'fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan-line': 'scanLine 3s linear infinite',
        'beam-flow': 'beamFlow 2.5s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.85)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        scanLine: {
          '0%': { transform: 'translateY(0%)' },
          '100%': { transform: 'translateY(400%)' },
        },
        beamFlow: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '30%': { opacity: '1' },
          '70%': { opacity: '1' },
          '100%': { transform: 'translateX(200%)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
