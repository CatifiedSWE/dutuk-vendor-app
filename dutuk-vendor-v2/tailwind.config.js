/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#7C2A2A',
                    light: '#A0464B',
                    dark: '#5A1E1E',
                },
                background: '#FDFDFD',
                surface: '#FFFFFF',
                border: '#E5E5E5',
                muted: '#808080',
                danger: '#FF3B30',
                success: '#34C759',
                warning: '#FF9500',
            },
            fontFamily: {
                sans: ['System'],
            },
        },
    },
    plugins: [],
};
