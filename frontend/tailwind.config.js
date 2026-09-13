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
          white: '#ffffff',
          page: '#f9fafb',
          dark: '#0f1a15',
          'dark-card': '#1a2b22',
        },
        text: {
          primary: '#111827',
          secondary: '#374151',
          muted: '#6b7280',
        },
        border: {
          DEFAULT: '#e5e7eb',
        },
        severity: {
          low: '#16a34a',
          medium: '#f59e0b',
          high: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
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
          '0%, 100%': { transform: 'scaleY(0.5)' },
          '50%': { transform: 'scaleY(1)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.3s ease-out',
        'shake': 'shake 0.3s ease-in-out',
        'bounce-slow': 'bounce-slow 2s ease-in-out infinite',
        'pulse-badge': 'pulse-badge 2s ease-in-out infinite',
        'waveform': 'waveform 0.8s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
}