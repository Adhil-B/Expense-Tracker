import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './public/**/*.svg',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1', // vibrant indigo
          dark: '#4F46E5',
          light: '#A5B4FC',
        },
        accent: {
          DEFAULT: '#F59E42', // vibrant orange
          teal: '#10B981',
          purple: '#A78BFA',
          green: '#22D3EE',
          blue: '#3B82F6',
          yellow: '#FBBF24',
          pink: '#F472B6',
        },
        background: {
          DEFAULT: '#F5F7FA',
          dark: '#101322',
        },
        foreground: {
          DEFAULT: '#18181B',
          dark: '#F3F4F6',
        },
        card: '#FFFFFF',
        'card-dark': '#18181B',
        border: '#E5E7EB',
        'border-dark': '#23263B',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', ...defaultTheme.fontFamily.sans],
        mono: ['var(--font-geist-mono)', ...defaultTheme.fontFamily.mono],
      },
      boxShadow: {
        soft: '0 2px 16px 0 rgba(60,60,120,0.10)',
        premium: '0 4px 32px 0 rgba(80,80,180,0.13)',
      },
      borderRadius: {
        xl: '1.25rem',
        '2xl': '1.5rem',
        pill: '9999px',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
}; 