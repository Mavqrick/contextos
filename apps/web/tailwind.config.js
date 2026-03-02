/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#080b12',
        surface: '#0d1526',
        surface2: '#111827',
        border: 'rgba(255,255,255,0.07)',
        blue: {
          DEFAULT: '#3b82f6',
          glow: 'rgba(59,130,246,0.15)',
          dark: '#1d4ed8',
        },
        purple: {
          DEFAULT: '#8b5cf6',
          glow: 'rgba(139,92,246,0.15)',
        },
        green: {
          DEFAULT: '#10b981',
          glow: 'rgba(16,185,129,0.15)',
        },
        orange: {
          DEFAULT: '#f59e0b',
          glow: 'rgba(245,158,11,0.15)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(59,130,246,0.15)',
        'glow-purple': '0 0 20px rgba(139,92,246,0.15)',
        'glow-green': '0 0 20px rgba(16,185,129,0.15)',
        card: '0 4px 24px rgba(0,0,0,0.4)',
      },
      backgroundImage: {
        'gradient-blue': 'linear-gradient(135deg, #1e3a5f 0%, #1e1b4b 100%)',
        'gradient-purple': 'linear-gradient(135deg, #2e1065 0%, #1e1b4b 100%)',
        'gradient-green': 'linear-gradient(135deg, #064e3b 0%, #0d1526 100%)',
        'accent-gradient': 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}