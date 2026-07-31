import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		screens: {
			sm: "640px",
			md: "768px",
			lg: "1024px",
			xl: "1280px",
			"2xl": "1536px",
			"3xl": "1920px",
		},
		extend: {
			fontFamily: {
				sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
				mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
			},
			boxShadow: {
				/* shadcn leans on `shadow-xs` for controls; Tailwind v3 has no such step. */
				xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
			},
			colors: {
				background: "oklch(var(--background) / <alpha-value>)",
				foreground: "oklch(var(--foreground) / <alpha-value>)",
				card: {
					DEFAULT: "oklch(var(--card) / <alpha-value>)",
					foreground: "oklch(var(--card-foreground) / <alpha-value>)",
				},
				popover: {
					DEFAULT: "oklch(var(--popover) / <alpha-value>)",
					foreground: "oklch(var(--popover-foreground) / <alpha-value>)",
				},
				primary: {
					DEFAULT: "oklch(var(--primary) / <alpha-value>)",
					foreground: "oklch(var(--primary-foreground) / <alpha-value>)",
				},
				secondary: {
					DEFAULT: "oklch(var(--secondary) / <alpha-value>)",
					foreground: "oklch(var(--secondary-foreground) / <alpha-value>)",
				},
				muted: {
					DEFAULT: "oklch(var(--muted) / <alpha-value>)",
					foreground: "oklch(var(--muted-foreground) / <alpha-value>)",
				},
				accent: {
					DEFAULT: "oklch(var(--accent) / <alpha-value>)",
					foreground: "oklch(var(--accent-foreground) / <alpha-value>)",
				},
				destructive: {
					DEFAULT: "oklch(var(--destructive) / <alpha-value>)",
					foreground: "oklch(var(--destructive-foreground) / <alpha-value>)",
				},
				success: {
					DEFAULT: "oklch(var(--success) / <alpha-value>)",
					foreground: "oklch(var(--success-foreground) / <alpha-value>)",
				},
				border: "oklch(var(--border) / <alpha-value>)",
				input: "oklch(var(--input) / <alpha-value>)",
				ring: "oklch(var(--ring) / <alpha-value>)",
				chart: {
					"1": "oklch(var(--chart-1) / <alpha-value>)",
					"2": "oklch(var(--chart-2) / <alpha-value>)",
					"3": "oklch(var(--chart-3) / <alpha-value>)",
					"4": "oklch(var(--chart-4) / <alpha-value>)",
					"5": "oklch(var(--chart-5) / <alpha-value>)",
				},
				sidebar: {
					DEFAULT: "oklch(var(--sidebar-background) / <alpha-value>)",
					foreground: "oklch(var(--sidebar-foreground) / <alpha-value>)",
					primary: "oklch(var(--sidebar-primary) / <alpha-value>)",
					"primary-foreground": "oklch(var(--sidebar-primary-foreground) / <alpha-value>)",
					accent: "oklch(var(--sidebar-accent) / <alpha-value>)",
					"accent-foreground": "oklch(var(--sidebar-accent-foreground) / <alpha-value>)",
					border: "oklch(var(--sidebar-border) / <alpha-value>)",
					ring: "oklch(var(--sidebar-ring) / <alpha-value>)",
				},
			},
			borderRadius: {
				sm: "calc(var(--radius) - 4px)",
				md: "calc(var(--radius) - 2px)",
				lg: "var(--radius)",
				xl: "calc(var(--radius) + 4px)",
			},
			// Optical alignment spacing utilities
			spacing: {
				"optical-xs": "0.0625rem", // 1px - micro adjustments
				"optical-sm": "0.125rem", // 2px - small optical shifts
				"optical-md": "0.1875rem", // 3px - medium adjustments
			},
			// Optical alignment translation utilities
			translate: {
				"optical-icon-right": "0.125rem", // 2px right for triangular icons (arrows, carets)
				"optical-icon-down": "0.0625rem", // 1px down for circular icons
				"optical-icon-up": "-0.0625rem", // 1px up for bottom-heavy icons (heart)
				"optical-icon-left": "-0.0625rem", // 1px left for heavy-left icons
			},
			keyframes: {
				"accordion-down": {
					from: {
						height: "0",
					},
					to: {
						height: "var(--radix-accordion-content-height)",
					},
				},
				"accordion-up": {
					from: {
						height: "var(--radix-accordion-content-height)",
					},
					to: {
						height: "0",
					},
				},
				float: {
					"0%, 100%": {
						transform: "translateY(0px)",
					},
					"50%": {
						transform: "translateY(-10px)",
					},
				},
				"tilt-3d": {
					"0%, 100%": {
						transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)",
					},
					"25%": {
						transform: "perspective(1000px) rotateX(2deg) rotateY(-2deg)",
					},
					"75%": {
						transform: "perspective(1000px) rotateX(-2deg) rotateY(2deg)",
					},
				},
				"glow-pulse": {
					"0%, 100%": {
						opacity: "0.8",
						boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
					},
					"50%": {
						opacity: "1",
						boxShadow: "0 0 30px rgba(59, 130, 246, 0.8)",
					},
				},
				"slide-up-fade": {
					"0%": {
						opacity: "0",
						transform: "translateY(20px)",
					},
					"100%": {
						opacity: "1",
						transform: "translateY(0)",
					},
				},
				"scale-in": {
					"0%": {
						opacity: "0",
						transform: "scale(0.9)",
					},
					"100%": {
						opacity: "1",
						transform: "scale(1)",
					},
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				float: "float 3s ease-in-out infinite",
				"tilt-3d": "tilt-3d 4s ease-in-out infinite",
				"glow-pulse": "glow-pulse 2s ease-in-out infinite",
				"slide-up-fade": "slide-up-fade 0.5s ease-out",
				"scale-in": "scale-in 0.3s ease-out",
			},
		},
	},
	plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
export default config;
