/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            // כאן את יכולה להוסיף אנימציות או צבעים מותאמים אישית אם תרצי בעתיד
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out forwards',
                'slide-in': 'slideIn 0.3s ease-out forwards',
            },
        },
    },
    plugins: [],
}