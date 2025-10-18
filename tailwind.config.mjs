/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  theme: {
    extend: {
      colors: {
        cosmic: {
          dark: '#0A0A14',
          darker: '#1A1A2C',
          navy: '#16213E',
          purple: '#2D1B69',
          indigo: '#4C1D95',
          violet: '#6B21A8',
        },
        ethereal: {
          purple: '#A78BFA',
          blue: '#60A5FA',
          pink: '#F472B6',
          gold: '#FBBF24',
          silver: '#E5E7EB',
        },
        mystical: {
          glow: '#C084FC',
          aura: '#818CF8',
        }
      },
      backgroundImage: {
        'cosmic-gradient': 'linear-gradient(135deg, #1A1A2C 0%, #16213E 50%, #2D1B69 100%)',
        'ethereal-glow': 'radial-gradient(circle at center, rgba(192, 132, 252, 0.15) 0%, transparent 70%)',
        'constellation': "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" xmlns=\"http://www.w3.org/2000/svg\"%%3E%3Ccircle cx=\"2\" cy=\"2\" r=\"1\" fill=\"%23A78BFA\" opacity=\"0.3\"/%3E%3Ccircle cx=\"50\" cy=\"75\" r=\"1\" fill=\"%23A78BFA\" opacity=\"0.3\"/%3E%3Ccircle cx=\"80\" cy=\"30\" r=\"1\" fill=\"%23A78BFA\" opacity=\"0.3\"/%3E%3C/svg%3E')",
      },
      animation: {
        'float': 'float 6s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'float-smooth': 'float-smooth 8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'glow': 'glow 3s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate',
        'pulse-glow': 'pulse-glow 4s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'shimmer': 'shimmer-slow 4s linear infinite',
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in-up': 'fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slide-in-right 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'float-smooth': {
          '0%, 100%': { 
            transform: 'translateY(0px) translateX(0px)',
          },
          '33%': { 
            transform: 'translateY(-15px) translateX(10px)',
          },
          '66%': { 
            transform: 'translateY(-5px) translateX(-10px)',
          },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(192, 132, 252, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(192, 132, 252, 0.6)' },
        },
        'pulse-glow': {
          '0%, 100%': { 
            opacity: '0.5',
            transform: 'scale(1)',
          },
          '50%': { 
            opacity: '0.8',
            transform: 'scale(1.05)',
          },
        },
        'shimmer-slow': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(30px)',
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'scale-in': {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.95)',
          },
          '100%': { 
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        'slide-in-right': {
          '0%': { 
            opacity: '0',
            transform: 'translateX(20px)',
          },
          '100%': { 
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      fontFamily: {
        mystical: ['Cinzel', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 30px rgba(192, 132, 252, 0.5)',
        'glow-lg': '0 0 60px rgba(192, 132, 252, 0.6)',
        'glow-soft': '0 4px 24px rgba(192, 132, 252, 0.25)',
        'ethereal': '0 8px 32px rgba(192, 132, 252, 0.2)',
        'cosmic': '0 4px 16px rgba(76, 29, 149, 0.4)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
