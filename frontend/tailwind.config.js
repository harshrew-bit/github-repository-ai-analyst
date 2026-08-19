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
        github: {
          dark: '#0d1117',
          card: '#161b22',
          border: '#30363d',
          hover: '#21262d',
          text: '#f0f6fc',
          muted: '#8b949e',
          accent: '#58a6ff',
          success: '#238636',
          successText: '#3fb950',
          warning: '#d29922',
          danger: '#f85149'
        }
      }
    },
  },
  plugins: [],
}
