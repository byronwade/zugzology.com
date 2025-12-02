import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatPrice(amount: string | number, currencyCode = "USD"): string {
	const numericAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount;
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
type ProductMetafield = {
	namespace?: string;
	key?: string;
	value?: string;
};

type ProductWithPrice = {
	variants?: {
		nodes?: Array<{
			price?: {
				amount?: string;
			};
		}>;
	};
	priceRange?: {
		minVariantPrice?: {
			amount?: string;
		};
	};
	metafields?: ProductMetafield[];
};

export function isIntentionallyFree(product: ProductWithPrice): boolean {
	// Check for zero price
	const price = product.variants?.nodes?.[0]?.price?.amount || product.priceRange?.minVariantPrice?.amount || "0";
	const isZeroPrice = Number.parseFloat(price) === 0;

	// Check for the free product metafield
	const hasFreeMeta = product.metafields?.some(
		(field: ProductMetafield) => field?.namespace === "custom" && field?.key === "is_free" && field?.value === "true"
	);

	// A product is intentionally free if it has zero price OR is marked as free
	return isZeroPrice || Boolean(hasFreeMeta);
}

/**
 * Debug logger utility that only logs when debugging is enabled
 * Enable by setting DEBUG_LOGGING=true in .env or localStorage.debug = 'true'
 * Note: console.debug is intentionally used here for debugging purposes
 */
export const debugLog = (component: string, message: string, data?: unknown): void => {
	const isDebugEnabled =
		process.env.DEBUG_LOGGING === "true" || (typeof window !== "undefined" && localStorage.getItem("debug") === "true");

	if (!isDebugEnabled) {
		return;
	}

	const timestamp = new Date().toISOString();
	const prefix = `[${timestamp}] [${component}]`;

	if (data !== undefined) {
		// biome-ignore lint/suspicious/noConsole: Intentional debug logging
		console.debug(prefix, message, data);
	} else {
		// biome-ignore lint/suspicious/noConsole: Intentional debug logging
		console.debug(prefix, message);
	}
};
