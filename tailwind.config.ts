// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                rotaract: {
                    magenta: '#D41367',
                    cranberry: '#D41367',
                    blue: '#002855',
                    navy: '#002855',
                    gold: '#F7A800',
                    dark: '#0F172A',
                    light: '#F8FAFC',
                    surface: '#F8FAFC',
                },
            },
            fontFamily: {
                heading: ['Poppins', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
            },
        },
    },
}