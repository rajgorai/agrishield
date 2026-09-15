/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#1a3c2e',
          mid: '#2d6a4f',
          light: '#52b788',
          mint: '#d8f3dc',
          pale: '#f0fdf4',
        },
        amber: {
          DEFAULT: '#f4a261',
          dark: '#c2410c',
        },
        surface: {
          page: '#f9fafb',
          card: '#ffffff',
          'dark-page': '#0d1b2a',      // NEW: Night blue
          'dark-card': '#152d44',      // NEW: Slightly lighter navy
          'dark-elevated': '#1d3a55',  // NEW: For hover states
        },
        text: {
          primary: '#111827',
          secondary: '#374151',
          muted: '#6b7280',
          'dark-primary': '#f1f5f9',
          'dark-secondary': '#cbd5e1',
          'dark-muted': '#94a3b8',
        },
        border: {
          DEFAULT: '#e5e7eb',
          dark: '#2d4a63',              // NEW: Navy-tinted
        },
        severity: {
          low: '#16a34a',
          medium: '#f59e0b',
          high: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'medium': '0 4px 12px -2px rgb(0 0 0 / 0.08), 0 2px 6px -2px rgb(0 0 0 / 0.05)',
        'deep': '0 10px 30px -5px rgb(0 0 0 / 0.12), 0 6px 12px -6px rgb(0 0 0 / 0.08)',
        'glow-green': '0 0 0 3px rgb(82 183 136 / 0.15)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-4px)' },
          '40%, 80%': { transform: 'translateX(4px)' },
        },
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-badge': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.03)' },
        },
        'waveform': {
          '0%, 100%': { transform: 'scaleY(0.4)' },
          '50%': { transform: 'scaleY(1)' },
        },
        'draw-check': {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(120%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'shake': 'shake 0.3s ease-in-out',
        'bounce-slow': 'bounce-slow 2s ease-in-out infinite',
        'pulse-badge': 'pulse-badge 2s ease-in-out infinite',
        'waveform': 'waveform 0.8s ease-in-out infinite',
        'draw-check': 'draw-check 0.6s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.25s ease-out',
      },
    },
  },
  plugins: [],
}