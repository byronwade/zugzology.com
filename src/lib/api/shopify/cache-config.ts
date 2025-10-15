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

// Next.js 16 cacheLife Profiles
// These profiles define stale-while-revalidate (SWR) behavior
export const CACHE_LIFE_PROFILES = {
	// Products: Serve stale for 1 hour, revalidate in background every 24 hours
	products: {
		stale: 60 * 60, // 1 hour
		revalidate: 24 * 60 * 60, // 24 hours
		expire: 7 * 24 * 60 * 60, // 7 days
	},
	// Collections: More frequently updated
	collections: {
		stale: 30 * 60, // 30 minutes
		revalidate: 12 * 60 * 60, // 12 hours
		expire: 3 * 24 * 60 * 60, // 3 days
	},
	// Blog content: Can be stale longer
	blogs: {
		stale: 2 * 60 * 60, // 2 hours
		revalidate: 24 * 60 * 60, // 24 hours
		expire: 14 * 24 * 60 * 60, // 14 days
	},
	// Site settings: Rarely change
	settings: {
		stale: 12 * 60 * 60, // 12 hours
		revalidate: 24 * 60 * 60, // 24 hours
		expire: 30 * 24 * 60 * 60, // 30 days
	},
	// Menu/Header: Can be stale for a while
	navigation: {
		stale: 6 * 60 * 60, // 6 hours
		revalidate: 12 * 60 * 60, // 12 hours
		expire: 7 * 24 * 60 * 60, // 7 days
	},
	// Dynamic content: Short stale time
	dynamic: {
		stale: 5 * 60, // 5 minutes
		revalidate: 60 * 60, // 1 hour
		expire: 24 * 60 * 60, // 1 day
	},
	// Featured/homepage content: Balance freshness with performance
	featured: {
		stale: 15 * 60, // 15 minutes
		revalidate: 60 * 60, // 1 hour
		expire: 24 * 60 * 60, // 1 day
	},
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
	// Use Date.now() for cache timestamp tracking
	// This is safe for server-side usage when used for cache management
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

	const _duration = getTimestamp() - startTime;
	if (deletedCount > 0) {
	}
}

// Run cache cleanup every minute, but only on the server
// Note: With dynamicIO, avoid setInterval during module initialization
// This should be moved to an API route or background job if needed
if (typeof process !== "undefined" && process.env.NEXT_RUNTIME === "nodejs") {
	setInterval(cleanupCache, 60 * 1000);
}
