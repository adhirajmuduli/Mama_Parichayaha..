import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],

  theme: {
    extend: {
      colors: {
        background: '#FDFCF8',

        surface: '#F7F2E8',

        primary: '#7C5C3A',

        secondary: '#D4A574',

        accent: '#C17A3A',

        muted: '#8B7355',
      },

      backgroundImage: {
        'hero-gradient': 'radial-gradient(circle at top, rgba(212,165,116,0.18), rgba(253,252,248,1))',
      },

      boxShadow: {
        glow: '0 0 40px rgba(193,122,58,0.22)',
      },

      backdropBlur: {
        xs: '2px',
      },
    },
  },

  plugins: [],
}

export default config
