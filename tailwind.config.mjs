/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1F1726',
          soft: '#3A2C44',
        },
        // Morados tomados del logotipo oficial (public/brand/Logotipo-Asecon-SA.svg).
        plum: {
          DEFAULT: '#6B1F7E',
          deep: '#42134E',
          mid: '#8B3E9C',
          light: '#B78FC1',
          rose: '#AC5694',
        },
        brass: {
          DEFAULT: '#C79A4B',
          // #9C7635 medía 3,84:1 sobre papel (#F4F1F6): bajo el 4,5:1 de AA para
          // texto normal. #80602C sube a ~5,17:1 sin cambiar el matiz de latón.
          dark: '#80602C',
          light: '#E6C988',
        },
        paper: {
          DEFAULT: '#F4F1F6',
          dim: '#EAE4ED',
          line: '#D9D0DE',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        // Tahoma viene instalada en Windows y macOS, así que no se descarga nada.
        // Verdana es su pariente más cercano; en Android, donde no existe ninguna
        // de las dos, cae en la sans del sistema.
        body: ['Tahoma', 'Verdana', 'Geneva', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      maxWidth: {
        wrap: '1240px',
      },
      keyframes: {
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
        rise: {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'spin-slow': 'spin-slow 22s linear infinite',
        rise: 'rise 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};
