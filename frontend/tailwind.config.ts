import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#f5f7fb',
        surface: '#ffffff',
        elevated: '#eef3fb',
        primary: '#1a73e8',
        secondary: '#5f86f2',
        success: '#1e8e3e',
        warning: '#f9ab00',
        critical: '#d93025',
        high: '#f29900',
        text: '#202124',
        muted: '#5f6368',
        dim: '#80868b'
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['Inter', 'sans-serif']
      },
      boxShadow: {
        glass: '0 1px 2px rgba(60,64,67,.08), 0 1px 3px 1px rgba(60,64,67,.16)',
        critical: '0 8px 24px rgba(217, 48, 37, 0.12)'
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
