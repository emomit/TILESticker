import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        clay: {
          base: 'var(--clay-base, #f2f4f7)',
          text: '#0f172a',
        },
        type: {
          todo: '#c7f9cc',
          memo: '#fffbb5',
          url: '#a0c4ff',
        },
      },
      borderRadius: {
        clay: '1.25rem',
      },
      boxShadow: {
        clay: '10px 10px 20px rgba(0,0,0,0.10), -6px -6px 14px rgba(255,255,255,0.9) inset, 6px 6px 12px rgba(0,0,0,0.08) inset',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
      keyframes: {
        drift: {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-2px)' },
          '100%': { transform: 'translateY(0px)' },
        },
      },
      animation: {
        drift: 'drift 6s ease-in-out infinite',
      },
      backdropSaturate: {
        '300': '3',
      },
    },
  },
  plugins: [],
} satisfies Config

