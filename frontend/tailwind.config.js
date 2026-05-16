/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        jangle: {
          bg: '#1a1614',
          surface: '#252019',
          border: '#3a3228',
          accent: '#c9a87c',
          sage: '#8faa8b',
          textPrimary: '#ede6d6',
          textMuted: '#9c8f7e',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
