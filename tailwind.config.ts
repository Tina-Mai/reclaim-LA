import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
    darkMode: ["class"],
    content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                theme: {
                    green: "#BDC9A3",
                    blue: "#E5EAF2",
                    orange: "#FCA06D",
                },
            },
            fontFamily: {
                serif: ["Instrument Serif", "serif"],
            },
            keyframes: {
                "caret-blink": {
                    "0%,70%,100%": { opacity: "1" },
                    "20%,50%": { opacity: "0" },
                },
                flowLine: {
                    '0%': { opacity: '0.3' },
                    '50%': { opacity: '1' },
                    '100%': { opacity: '0.3' }
                },
                flowArrow: {
                    '0%': { transform: 'translateX(-4px)', opacity: '0.3' },
                    '50%': { transform: 'translateX(0)', opacity: '1' },
                    '100%': { transform: 'translateX(-4px)', opacity: '0.3' }
                },
                flowLineVertical: {
                    '0%': { opacity: '0.3' },
                    '50%': { opacity: '1' },
                    '100%': { opacity: '0.3' }
                },
                flowArrowVertical: {
                    '0%': { transform: 'translateY(-4px)', opacity: '0.3' },
                    '50%': { transform: 'translateY(0)', opacity: '1' },
                    '100%': { transform: 'translateY(-4px)', opacity: '0.3' }
                },
                fadeIn: {
                    '0%': { opacity: '0.5' },
                    '100%': { opacity: '1' }
                },
                shine: {
                    '0%': { 
                        transform: 'translateX(100%)'
                    },
                    '100%': {
                        transform: 'translateX(-100%)'
                    }
                }
            },
            animation: {
                'flow-line': 'flowLine 2s ease-in-out infinite',
                'flow-arrow': 'flowArrow 2s ease-in-out infinite',
                'flow-line-vertical': 'flowLineVertical 2s ease-in-out infinite',
                'flow-arrow-vertical': 'flowArrowVertical 2s ease-in-out infinite',
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'fade-in-delayed': 'fadeIn 0.5s ease-out 0.3s forwards',
                'shine': 'shine 2s ease-in-out infinite',
                "caret-blink": "caret-blink 1.25s ease-out infinite",
            }
        },
    },
    plugins: [animate],
} satisfies Config;
