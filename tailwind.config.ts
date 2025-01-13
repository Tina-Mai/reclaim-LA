import type { Config } from "tailwindcss";

export default {
	content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
	theme: {
		extend: {
			colors: {
				background: "var(--background)",
				foreground: "var(--foreground)",
				theme: {
					green: "#DDE9D3",
					blue: "#E5EAF2",
				},
			},
			fontFamily: {
				serif: ["Playfair Display", "serif"],
			},
		},
	},
	plugins: [],
} satisfies Config;
