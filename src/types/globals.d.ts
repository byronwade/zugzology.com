/**
 * Ambient declarations for globals injected by third-party scripts.
 *
 * gtag is pushed onto window by the Google Analytics snippet, so the 28
 * call sites across cart, wishlist, blog and product-error components were
 * each reporting TS2339. Typing it once removes those without touching a
 * single call site or changing runtime behaviour.
 */
declare global {
	type GtagCommand = "config" | "consent" | "event" | "js" | "set";

	interface Window {
		gtag?: (command: GtagCommand, targetOrName: string | Date, params?: Record<string, unknown>) => void;
		dataLayer?: Record<string, unknown>[];
	}
}

export {};
