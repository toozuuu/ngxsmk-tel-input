/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./projects/demo/src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // TokiForge Light Theme Colors
        'tf-bg-primary': '#ffffff',
        'tf-bg-secondary': '#f8fafc',
        'tf-bg-tertiary': '#f1f5f9',
        'tf-text-primary': '#1e293b',
        'tf-text-secondary': '#64748b',
        'tf-text-tertiary': '#94a3b8',
        'tf-border-primary': '#e2e8f0',
        'tf-border-secondary': '#cbd5e1',
        'tf-link': '#3b82f6',
        'tf-link-hover': '#2563eb',
        'tf-success': '#10b981',
        'tf-error': '#ef4444',
        'tf-warning': '#f59e0b',
        'tf-info': '#3b82f6',
        // TokiForge Dark Theme Colors (used with dark: prefix)
        'tf-dark-bg-primary': '#212121',
        'tf-dark-bg-secondary': '#212121',
        'tf-dark-bg-tertiary': '#1a1a1a',
        'tf-dark-text-primary': '#ffffff',
        'tf-dark-text-secondary': '#cbd5e1',
        'tf-dark-text-tertiary': '#94a3b8',
        'tf-dark-border-primary': '#334155',
        'tf-dark-border-secondary': '#475569',
        'tf-dark-link': '#60a5fa',
        'tf-dark-link-hover': '#93c5fd',
      },
      fontFamily: {
        sans: ['Roboto', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['Monaco', 'Menlo', 'Courier New', 'monospace'],
      },
      spacing: {
        'tf-xs': '0.5rem',
        'tf-sm': '0.75rem',
        'tf-md': '1rem',
        'tf-lg': '1.5rem',
        'tf-xl': '2rem',
        'tf-2xl': '3rem',
        'tf-3xl': '4rem',
      },
      boxShadow: {
        'tf-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'tf-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'tf-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'tf-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'tf-sm': '0.375rem',
        'tf-md': '0.5rem',
        'tf-lg': '0.75rem',
        'tf-xl': '1rem',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}

