import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Poppins', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                primary: '#FF6B6B',
                secondary: '#4ECDC4',
                accent: '#FFE66D',
                success: '#95E1D3',
                warning: '#FFA07A',
                error: '#FF5252',
            },
            animation: {
                'bounce-slow': 'bounce 3s infinite',
                'wiggle': 'wiggle 1s ease-in-out infinite',
            },
            keyframes: {
                wiggle: {
                    '0%, 100%': { transform: 'rotate(-3deg)' },
                    '50%': { transform: 'rotate(3deg)' },
                }
            }
        },
    },

    plugins: [
        forms,
        daisyui,
    ],

    daisyui: {
        themes: [
            {
                light: {
                    primary: "#FF6B6B",
                    secondary: "#4ECDC4",
                    accent: "#FFE66D",
                    neutral: "#2D3436",
                    "base-100": "#FFFFFF",
                    "base-200": "#F2F2F2",
                    "base-300": "#E5E6E6",
                    "base-content": "#1f2937",
                    info: "#3ABFF8",
                    success: "#95E1D3",
                    warning: "#FBBD23",
                    error: "#FF5252",
                },
            },
        ],
    },
};
