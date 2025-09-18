// Cache Configuration
export const CACHE_TIMES = {
	PRODUCTS: 24 * 60 * 60, // 24 hours
	COLLECTIONS: 12 * 60 * 60, // 12 hours
	BLOGS: 60 * 60, // 1 hour
	SETTINGS: 24 * 60 * 60, // 24 hours
	SITE_SETTINGS: 24 * 60 * 60, // 24 hours
	MENU: 12 * 60 * 60, // 12 hours
	HEADER: 12 * 60 * 60, // 12 hours
	GLOBAL: 24 * 60 * 60, // 24 hours
} as const;

// Cache tag prefixes for better organization
export const CACHE_TAGS = {
	PRODUCT: "product",
	COLLECTION: "collection",
	BLOG: "blog",
	SETTINGS: "settings",
	MENU: "menu",
	CART: "cart",
} as const;

// Memory Cache Setup
export const MEMORY_CACHE = new Map<string, { data: any; timestamp: number; size?: number }>();
export const REQUEST_DEDUPLICATION_CACHE = new Map<string, Promise<any>>();
export const MAX_CACHE_SIZE = 100;
export const MAX_CACHE_AGE = 60 * 60 * 24; // 24 hours
export const MAX_CACHE_MEMORY = 50 * 1024 * 1024; // 50MB

// Helper Functions
export function getObjectSize(obj: any): number {
	const str = JSON.stringify(obj);
	return str.length * 2;
}

// Time measurement helper
export function getTimestamp(): number {
	if (typeof performance !== "undefined") {
		return performance.now();
	}
	// For server-side usage with dynamicIO, avoid Date.now() 
	// This should only be used in client-side or API contexts
	if (typeof window === "undefined") {
		return 0; // Return 0 for server-side to avoid dynamicIO conflicts
	}
	return Date.now();
}

// Cache Management
function cleanupCache() {
	const startTime = getTimestamp();
	const now = getTimestamp();
	let totalMemory = 0;
	let deletedCount = 0;

	// Delete expired entries and calculate memory usage
	for (const [key, value] of MEMORY_CACHE.entries()) {
		if (!value.size) {
			value.size = getObjectSize(value.data);
		}
		totalMemory += value.size;

		if (now - value.timestamp > MAX_CACHE_AGE * 1000) {
			MEMORY_CACHE.delete(key);
			totalMemory -= value.size;
			deletedCount++;
		}
	}

	// Remove entries if over memory limit
	if (totalMemory > MAX_CACHE_MEMORY) {
		const entries = Array.from(MEMORY_CACHE.entries()).sort((a, b) => (a[1].size || 0) - (b[1].size || 0));

		while (totalMemory > MAX_CACHE_MEMORY && entries.length > 0) {
			const [key, value] = entries.pop()!;
			MEMORY_CACHE.delete(key);
			totalMemory -= value.size || 0;
			deletedCount++;
		}
	}

	// Clear request cache
	REQUEST_DEDUPLICATION_CACHE.clear();

	const duration = getTimestamp() - startTime;
	if (deletedCount > 0) {
		console.log(`⚡ [Cache Cleanup] ${duration.toFixed(2)}ms | Deleted: ${deletedCount} | Memory: ${(totalMemory / 1024 / 1024).toFixed(2)}MB`);
	}
}

// Run cache cleanup every minute, but only on the server
// Note: With dynamicIO, avoid setInterval during module initialization
// This should be moved to an API route or background job if needed
// if (typeof process !== "undefined" && process.env.NEXT_RUNTIME === "nodejs") {
// 	setInterval(cleanupCache, 60 * 1000);
// }
