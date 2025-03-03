import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatPrice(amount: string | number, currencyCode: string = "USD"): string {
	const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currencyCode,
	}).format(numericAmount);
}

/**
 * Check if a product is intentionally free (price = $0)
 * A product is considered intentionally free if:
 * 1. It has a $0 price
 * 2. OR it has a metafield marking it as intentionally free
 */
export function isIntentionallyFree(product: any): boolean {
	// Check for zero price
	const price = product.variants?.nodes?.[0]?.price?.amount || product.priceRange?.minVariantPrice?.amount || "0";
	const isZeroPrice = parseFloat(price) === 0;
	
	// Check for the free product metafield
	const hasFreeMeta = product.metafields?.some(
		(field: any) => field?.namespace === "custom" && field?.key === "is_free" && field?.value === "true"
	);
	
	// A product is intentionally free if it has zero price OR is marked as free
	return isZeroPrice || hasFreeMeta;
}

/**
 * Debug logger utility that only logs when debugging is enabled
 * Enable by setting DEBUG_LOGGING=true in .env or localStorage.debug = 'true'
 */
export const debugLog = (component: string, message: string, data?: any) => {
	// Debugging is disabled
	const isDebugEnabled = false;

	if (!isDebugEnabled) return;

	if (data) {
		console.log(`[${component}] ${message}`, data);
	} else {
		console.log(`[${component}] ${message}`);
	}
};
