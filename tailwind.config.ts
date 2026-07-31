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
				display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
				sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
				mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
			},
			boxShadow: {
				/**
				 * Objects in a dark room read by their lit top edge, not by the shadow they cast.
				 * Every level pairs an ambient drop with a 1px specular highlight along the top.
				 */
				sm: "0 1px 2px 0 hsl(var(--cast) / 0.28), inset 0 1px 0 0 hsl(var(--key) / 0.04)",
				DEFAULT: "0 2px 6px -1px hsl(var(--cast) / 0.32), inset 0 1px 0 0 hsl(var(--key) / 0.05)",
				md: "0 4px 14px -2px hsl(var(--cast) / 0.36), inset 0 1px 0 0 hsl(var(--key) / 0.06)",
				lg: "0 10px 30px -6px hsl(var(--cast) / 0.42), inset 0 1px 0 0 hsl(var(--key) / 0.07)",
				xl: "0 20px 50px -12px hsl(var(--cast) / 0.5), inset 0 1px 0 0 hsl(var(--key) / 0.08)",
				"2xl": "0 34px 80px -20px hsl(var(--cast) / 0.6), inset 0 1px 0 0 hsl(var(--key) / 0.09)",
				inner: "inset 0 2px 6px 0 hsl(var(--cast) / 0.3)",
				/** The key light itself — a colored bloom for the one element that should glow. */
				bloom: "0 0 0 1px hsl(var(--primary) / 0.35), 0 12px 40px -8px hsl(var(--primary) / 0.45)",
				flush: "0 0 0 1px hsl(var(--flush) / 0.35), 0 12px 40px -8px hsl(var(--flush) / 0.4)",
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
				/**
				 * The warm half of the split-tone. Named for a "flush" — a round of fruiting.
				 * Deliberately not `--accent`: that token drives Radix hover surfaces and must stay neutral.
				 */
				flush: {
					DEFAULT: "hsl(var(--flush))",
					foreground: "hsl(var(--flush-foreground))",
				},
				/** Positive status: in stock, shipping included, discount applied. */
				success: {
					DEFAULT: "hsl(var(--success))",
					foreground: "hsl(var(--success-foreground))",
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
			/**
			 * A photographic print corner, not a pill. Retuned globally so every
			 * existing `rounded-lg` / `rounded-xl` inherits the sharper frame.
			 * `rounded-full` is untouched — avatars and status dots still need it.
			 */
			borderRadius: {
				none: "0",
				sm: "1px",
				DEFAULT: "2px",
				md: "3px",
				lg: "var(--radius)",
				xl: "6px",
				"2xl": "10px",
				"3xl": "14px",
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
				/* Title sequence — the hero plays once on load, in order. */
				"letterbox-open": {
					from: {
						transform: "scaleY(3)",
					},
					to: {
						transform: "scaleY(1)",
					},
				},
				"frame-draw": {
					from: {
						opacity: "0",
						transform: "scale(1.4)",
					},
					to: {
						opacity: "1",
						transform: "scale(1)",
					},
				},
				/* The headline widens as it rises — the widescreen thesis, stated in motion. */
				"title-widen": {
					from: {
						opacity: "0",
						transform: "translateY(0.35em)",
						fontVariationSettings: '"wdth" 88',
					},
					to: {
						opacity: "1",
						transform: "translateY(0)",
						fontVariationSettings: '"wdth" 118',
					},
				},
				"rise-in": {
					from: {
						opacity: "0",
						transform: "translateY(1rem)",
					},
					to: {
						opacity: "1",
						transform: "translateY(0)",
					},
				},
				/* Slow dolly push on the hero plate. */
				"push-in": {
					from: {
						transform: "scale(1)",
					},
					to: {
						transform: "scale(1.08)",
					},
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				"rise-in": "rise-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
			},
		},
	},
	plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
export default config;
