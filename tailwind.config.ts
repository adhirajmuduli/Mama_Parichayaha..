import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],

  theme: {
    extend: {
      colors: {
        background: '#07020F',

        surface: '#12061F',

        primary: '#7C3AED',

        secondary: '#C084FC',

        accent: '#F97316',

        muted: '#A78BFA',
      },

      backgroundImage: {
        'hero-gradient': 'radial-gradient(circle at top, rgba(124,58,237,0.35), rgba(7,2,15,1))',
      },

      boxShadow: {
        glow: '0 0 40px rgba(192,132,252,0.35)',
      },

      backdropBlur: {
        xs: '2px',
      },
    },
  },

  plugins: [],
}

export default config
