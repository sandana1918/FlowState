import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#f3efe6',
        surface: '#fffdf8',
        elevated: '#f6f1e7',
        primary: '#1f5f8b',
        secondary: '#597e9c',
        success: '#2f6f54',
        warning: '#b68132',
        critical: '#a5584a',
        high: '#c4793a',
        text: '#1f2933',
        muted: '#5f6c76',
        dim: '#8a96a0'
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['Inter', 'sans-serif']
      },
      boxShadow: {
        glass: '0 8px 24px rgba(68, 76, 84, 0.06), 0 1px 0 rgba(255,255,255,0.9) inset',
        critical: '0 8px 18px rgba(165, 88, 74, 0.08)'
      },
      animation: {
        pulseSoft: 'pulseSoft 2.4s ease-in-out infinite'
      },
      keyframes: {
        pulseSoft: {
          '0%,100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' }
        }
      }
    }
  },
  plugins: []
} satisfies Config;
