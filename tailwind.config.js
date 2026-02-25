/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontSize: {
                'xs': ['0.875rem', { lineHeight: '1.25rem' }],   // originally sm
                'sm': ['1rem', { lineHeight: '1.5rem' }],        // originally base
                'base': ['1.125rem', { lineHeight: '1.75rem' }], // originally lg
                'lg': ['1.25rem', { lineHeight: '1.75rem' }],    // originally xl
                'xl': ['1.5rem', { lineHeight: '2rem' }],        // originally 2xl
            },
            fontFamily: {
                sans: ['Inter', 'Prompt', 'sans-serif'],
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'fadeIn': 'fadeIn 0.3s ease-out',
                'slideUp': 'slideUp 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(8px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
}
