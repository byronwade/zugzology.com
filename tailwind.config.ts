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
			boxShadow: {
				// Layered, color-matched shadows with Psilocybin Blue tint
				sm: "0 1px 2px 0 hsl(206 40 45 / 0.05)",
				DEFAULT: `
					0 1px 3px 0 hsl(206 40 45 / 0.08),
					0 1px 2px -1px hsl(206 40 45 / 0.08)
				`,
				md: `
					0 2px 4px -1px hsl(206 40 45 / 0.06),
					0 4px 6px -1px hsl(206 40 45 / 0.08),
					0 1px 2px -1px hsl(206 40 45 / 0.06)
				`,
				lg: `
					0 4px 6px -2px hsl(206 40 45 / 0.05),
					0 10px 15px -3px hsl(206 40 45 / 0.08),
					0 2px 4px -2px hsl(206 40 45 / 0.05)
				`,
				xl: `
					0 8px 10px -3px hsl(206 40 45 / 0.05),
					0 20px 25px -5px hsl(206 40 45 / 0.08),
					0 4px 6px -4px hsl(206 40 45 / 0.05)
				`,
				"2xl": "0 25px 50px -12px hsl(206 40 45 / 0.15)",
				inner: "inset 0 2px 4px 0 hsl(206 40 45 / 0.05)",
			},
			colors: {
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				chart: {
					"1": "hsl(var(--chart-1))",
					"2": "hsl(var(--chart-2))",
					"3": "hsl(var(--chart-3))",
					"4": "hsl(var(--chart-4))",
					"5": "hsl(var(--chart-5))",
				},
				sidebar: {
					DEFAULT: "hsl(var(--sidebar-background))",
					foreground: "hsl(var(--sidebar-foreground))",
					primary: "hsl(var(--sidebar-primary))",
					"primary-foreground": "hsl(var(--sidebar-primary-foreground))",
					accent: "hsl(var(--sidebar-accent))",
					"accent-foreground": "hsl(var(--sidebar-accent-foreground))",
					border: "hsl(var(--sidebar-border))",
					ring: "hsl(var(--sidebar-ring))",
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
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
				shimmer: {
					"0%": {
						backgroundPosition: "-200% center",
					},
					"100%": {
						backgroundPosition: "200% center",
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
				shimmer: "shimmer 3s linear infinite",
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
