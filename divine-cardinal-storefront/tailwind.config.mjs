/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        luxury: {
          cream: '#FAF9F6',
          charcoal: '#1A1A1A',
          dark: '#0c0c0c',
          gold: '#C5A059'
        }
      }
    },
  },
  plugins: [],
}
