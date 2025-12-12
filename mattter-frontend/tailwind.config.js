/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Dark theme colors
                'dark-bg': '#0a0a0a',
                'dark-surface': '#1a1a1a',
                'dark-elevated': '#242424',
                'dark-border': '#2a2a2a',
                'accent-purple': '#a78bfa',
                'accent-blue': '#60a5fa',
                'accent-pink': '#f472b6',
                'accent-gold': '#fbbf24',
                'text-primary': '#f5f5f5',
                'text-secondary': '#a0a0a0',
                'text-muted': '#6b7280',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-dark': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'gradient-accent': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            },
        },
    },
    plugins: [],
}
