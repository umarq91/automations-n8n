/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ds: {
          bg:          '#0B0F14',
          surface:     '#111823',
          surface2:    '#182230',
          hover:       '#202C3D',
          border:      '#263244',
          borderSoft:  '#1B2533',
          text:        '#E6EDF3',
          text2:       '#9AA4B2',
          muted:       '#6B7686',
          accent:      '#4DA3FF',
          accentGlow:  '#2B6FFF',
          accentHover: '#6BB6FF',
        },
      },
      boxShadow: {
        'card':        '0 10px 30px rgba(0,0,0,0.35)',
        'accent-glow': '0 0 25px rgba(77,163,255,0.20)',
      },
      backgroundImage: {
        'glass': 'linear-gradient(135deg, rgba(17,24,35,0.6), rgba(24,34,48,0.4))',
      },
    },
  },
  plugins: [],
};
