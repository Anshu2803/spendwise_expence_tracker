/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'surface': '#101415',
        'surface-dim': '#101415',
        'surface-bright': '#363a3b',
        'surface-container': '#1d2022',
        'surface-container-low': '#191c1e',
        'surface-container-high': '#272a2c',
        'surface-container-highest': '#323537',
        'on-surface': '#e0e3e5',
        'on-surface-variant': '#c7c4d7',
        'outline': '#908fa0',
        'outline-variant': '#464554',
        'primary': '#c0c1ff',
        'on-primary': '#1000a9',
        'primary-container': '#8083ff',
        'secondary': '#4edea3',
        'on-secondary': '#003824',
        'secondary-container': '#00a572',
        'error': '#ffb4ab',
        'background': '#101415',
        'on-background': '#e0e3e5'
      },
      fontFamily: {
        'h1': ['Syne', 'sans-serif'],
        'h2': ['Syne', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}