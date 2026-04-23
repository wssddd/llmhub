/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'macos': {
          'bg': '#f5f5f7',
          'sidebar': '#e8e8ed',
          'card': '#ffffff',
          'border': '#d1d1d6',
          'text': '#1d1d1f',
          'text-secondary': '#86868b',
          'accent': '#007aff',
          'accent-hover': '#0056b3',
          'success': '#34c759',
          'warning': '#ff9500',
          'danger': '#ff3b30',
        }
      },
      fontFamily: {
        'sf': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Helvetica Neue', 'sans-serif']
      }
    },
  },
  plugins: [],
}
