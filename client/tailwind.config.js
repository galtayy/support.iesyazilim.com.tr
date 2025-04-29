/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#3A7BD5', // Ana mavi renk
        'success': '#61C28C', // Yeşil
        'warning': '#FFA84B', // Turuncu
        'danger': '#E05A5A',  // Kırmızı
        'dark': '#2E2E2E',    // Koyu gri
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'roboto': ['Roboto', 'sans-serif'],
      },
      // Aspect ratio özellikleri
      aspectRatio: {
        '1/1': '1 / 1',
        '4/3': '4 / 3',
        '16/9': '16 / 9',
      },
      // Duyarlı (responsive) boyutlar
      spacing: {
        '72': '18rem',
        '80': '20rem',
        '96': '24rem',
      },
      // Mobil breakpoint için özel özellikler
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    function ({ addUtilities }) {
      const newUtilities = {
        '.btn-sm': {
          padding: '0.375rem 0.75rem',
          fontSize: '0.75rem',
          lineHeight: '1rem',
          borderRadius: '0.25rem',
        },
        '.truncate-2-lines': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-line-clamp': '2',
          '-webkit-box-orient': 'vertical',
        },
        '.truncate-3-lines': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-line-clamp': '3',
          '-webkit-box-orient': 'vertical',
        },
      };
      addUtilities(newUtilities, ['responsive', 'hover']);
    },
  ],
  // Aspect ratio ile ilgili yardımcı sınıfların varsayılan olarak dahil edilmesi
  corePlugins: {
    aspectRatio: false,
  },
}