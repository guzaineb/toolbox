/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}', // Important pour App Router
  ],
  theme: {
    extend: {
      colors: {
        accent: '#1D9E75',
        'accent-mid': '#0F6E56',
        'accent-light': '#E1F5EE',
        surface: '#ffffff',
        bg: '#F8F9FA',
        border: 'rgba(0,0,0,0.1)',
        text: '#1a1a1a',
        'text-2': '#6b7280',
        red: '#E24B4A',
        'red-light': '#FCEBEB',
        blue: '#378ADD',
        'blue-light': '#E6F1FB',
        amber: '#BA7517',
        'amber-light': '#FAEEDA',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        syne: ['Syne', 'sans-serif'],
      },
    },
  },
  plugins: [],
}