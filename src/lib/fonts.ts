import { Geist, Geist_Mono } from "next/font/google";

/** Geist — the typeface ui.shadcn.com ships with. */
export const fontSans = Geist({
	display: "swap",
	subsets: ["latin"],
	variable: "--font-sans",
});

export const fontMono = Geist_Mono({
	display: "swap",
	subsets: ["latin"],
	variable: "--font-mono",
});
