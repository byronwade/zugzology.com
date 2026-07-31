import { Archivo, IBM_Plex_Mono, Instrument_Sans } from "next/font/google";

/**
 * Display — Archivo, loaded with its width axis so headlines can be set wide.
 * Widescreen letterforms carry the cinematic framing into the type itself.
 */
export const fontDisplay = Archivo({
	axes: ["wdth"],
	display: "swap",
	subsets: ["latin"],
	variable: "--font-display",
});

/** Body — Instrument Sans. Neo-grotesque with enough character to not read as a system default. */
export const fontSans = Instrument_Sans({
	display: "swap",
	subsets: ["latin"],
	variable: "--font-sans",
});

/** Data — IBM Plex Mono. Carries the lab voice: lot numbers, prices, stock levels, ranks. */
export const fontMono = IBM_Plex_Mono({
	display: "swap",
	subsets: ["latin"],
	variable: "--font-mono",
	weight: ["400", "500"],
});
