import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Deep blacks like Spotify/Discord
        dark: {
          bg: '#0A0A0B',      // Primary background
          surface: '#141416',  // Elevated surfaces
          card: '#1C1C1F',    // Card backgrounds
          elevated: '#242428', // Further elevated
          border: 'rgba(255, 255, 255, 0.1)',
        },
        // Neon accents
        neon: {
          green: '#00FF88',   // Primary CTA
          blue: '#00D9FF',    // Secondary accent
          coral: '#FF6B6B',   // Warning/urgent
          purple: '#9B59FF',  // Premium/special
        },
        // Difficulty levels (LeetCode inspired)
        difficulty: {
          beginner: '#00FF88',     // Green
          intermediate: '#FFD93D', // Yellow
          advanced: '#FF6B6B',     // Orange-red
          expert: '#9B59FF',       // Purple
        },
        // Match quality
        match: {
          perfect: '#00FF88',
          strong: '#00D9FF',
          good: '#FFD93D',
          stretch: '#FF6B6B',
          reach: '#9B59FF',
        },
        // Semantic colors
        success: '#00FF88',
        warning: '#FFD93D',
        error: '#FF6B6B',
        info: '#00D9FF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Clash Display', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'glow-conic': 'conic-gradient(from 180deg at 50% 50%, #00FF88 0deg, #00D9FF 90deg, #9B59FF 180deg, #FF6B6B 270deg, #00FF88 360deg)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(0, 255, 136, 0.3)',
        'glow': '0 0 20px rgba(0, 255, 136, 0.4)',
        'glow-lg': '0 0 30px rgba(0, 255, 136, 0.5)',
        'glow-blue': '0 0 20px rgba(0, 217, 255, 0.4)',
        'glow-purple': '0 0 20px rgba(155, 89, 255, 0.4)',
        'dark': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'dark-lg': '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-out': 'fadeOut 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-in',
        'scale-in': 'scaleIn 0.2s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      screens: {
        'xs': '475px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}

export default config;