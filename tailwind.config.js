/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/screens/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/components/features/**/*.{js,jsx,ts,tsx}",
    "./src/components/forms/**/*.{js,jsx,ts,tsx}",
    "./src/components/modals/**/*.{js,jsx,ts,tsx}",
    "./src/components/ui/**/*.{js,jsx,ts,tsx}",
    "./src/components/workout/**/*.{js,jsx,ts,tsx}",
    "./src/navigation/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Brand Colors - Logo Gradient Theme
        primary: '#FF4D2D',
        'primary-dark': '#E55A2B',
        'primary-light': '#FF8C42',
        accent: '#FF6B35',
        'accent-light': '#FF8C42',
        'accent-dark': '#FF4D2D',
        // Background colors - Slate palette
        background: '#0F172A',
        surface: '#1E293B',
        'surface-elevated': '#334155',
        // Text colors
        text: '#FFFFFF',
        'text-secondary': '#94A3B8',
        'text-tertiary': '#64748B',
        // Status colors
        error: '#EF4444',
        success: '#4CAF50',
        warning: '#FFA726',
        info: '#3B82F6',
        // Card and component colors
        'card-background': '#1E293B',
        'card-border': '#334155',
        divider: '#334155',
        // Interactive states
        active: '#FF6B35',
        inactive: '#475569',
        hover: '#334155',
        pressed: '#FF4D2D',
      },
    },
  },
  plugins: [],
}
