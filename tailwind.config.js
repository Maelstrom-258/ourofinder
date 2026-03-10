/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                sphere: {
                    purple: '#be7bdc',
                    blue: '#5b98f2',
                    teal: '#5be2f2',
                    green: '#74c476',
                    yellow: '#f4dc5c',
                    orange: '#f2a65b',
                    red: '#f25b5b',
                    rainbow: '#ffffff',
                    light: '#fcfcfc',
                    dark: '#303030',
                    hidden: '#6b7280'
                }
            }
        },
    },
    plugins: [],
}
