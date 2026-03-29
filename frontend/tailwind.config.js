/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Figtree', 'sans-serif'],
        heading: ['Cabinet Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        background: '#0F0F1A',
        surface: {
          DEFAULT: '#1A1A2E',
          hover: '#25253A',
        },
        primary: {
          DEFAULT: '#00C853',
          hover: '#00A040',
          foreground: '#0F0F1A',
        },
        secondary: {
          DEFAULT: '#1A1A2E',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#FFD600',
          hover: '#E6C200',
          foreground: '#0F0F1A',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#B0B0C0',
          muted: '#75758A',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.08)',
          focus: 'rgba(0, 200, 83, 0.5)',
        },
        glass: 'rgba(26, 26, 46, 0.6)',
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
        // Shadcn compatibility
        foreground: '#FFFFFF',
        card: {
          DEFAULT: '#1A1A2E',
          foreground: '#FFFFFF'
        },
        popover: {
          DEFAULT: '#1A1A2E',
          foreground: '#FFFFFF'
        },
        muted: {
          DEFAULT: '#75758A',
          foreground: '#B0B0C0'
        },
        input: 'rgba(255, 255, 255, 0.08)',
        ring: 'rgba(0, 200, 83, 0.5)',
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.25rem',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
