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
 * Debug logger utility that only logs when debugging is enabled
 * Enable by setting DEBUG_LOGGING=true in .env or localStorage.debug = 'true'
 */
export const debugLog = (component: string, message: string, data?: any) => {
	// Check if debugging is enabled via env or localStorage
	const isDebugEnabled = 
		process.env.NEXT_PUBLIC_DEBUG_LOGGING === 'true' || 
		(typeof window !== 'undefined' && window.localStorage.getItem('debug') === 'true');
	
	if (!isDebugEnabled) return;
	
	if (data) {
		console.log(`[${component}] ${message}`, data);
	} else {
		console.log(`[${component}] ${message}`);
	}
};
