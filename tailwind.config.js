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
        // Light Mode (60-30-10)
        background: {
          light: '#F7F7F8',
          dark: '#1E1F22',        // Soft graphite, not pure black
        },
        surface: {
          light: '#FFFFFF',
          dark: '#26272B',         // Card/Editor surface
        },
        sidebar: {
          light: '#FFFFFF',
          dark: '#232427',         // Sidebar background
        },
        editor: {
          light: '#FFFFFF',
          dark: '#2C2D31',         // Writing area (lighter than card)
        },
        text: {
          primary: {
            light: '#2E2E2E',
            dark: '#EAEAEA',       // Primary text in dark mode
          },
          secondary: {
            light: '#6E6E6E',
            dark: '#A9A9A9',       // Secondary text in dark mode
          },
        },
        accent: '#3A82F7',         // Sky blue for buttons/highlights
        hover: {
          light: '#EDEDF0',
          dark: 'rgba(255, 255, 255, 0.08)',
        },
        border: {
          light: '#E5E5E5',
          dark: 'rgba(255, 255, 255, 0.06)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'SF Pro Display', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'notion': '10px',
        'button': '8px',
      },
      boxShadow: {
        'notion': '0 1px 3px rgba(0, 0, 0, 0.08)',
        'notion-hover': '0 2px 8px rgba(0, 0, 0, 0.12)',
        'dark-notion': '0 1px 3px rgba(0, 0, 0, 0.4)',
        'dark-hover': '0 2px 8px rgba(0, 0, 0, 0.6)',
      },
      letterSpacing: {
        'tight': '-0.01em',
        'tighter': '-0.02em',
      },
      lineHeight: {
        'relaxed': '1.6',
      },
    },
  },
  plugins: [],
}