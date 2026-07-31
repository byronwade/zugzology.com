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

export const CACHE_TAGS = {
	PRODUCT: "product",
	COLLECTION: "collection",
	BLOG: "blog",
	SETTINGS: "settings",
	MENU: "menu",
	CART: "cart",
} as const;

export const CACHE_LIFE_PROFILES = {
	products: {
		stale: 60 * 60,
		revalidate: 24 * 60 * 60,
		expire: 7 * 24 * 60 * 60,
	},
	collections: {
		stale: 30 * 60,
		revalidate: 12 * 60 * 60,
		expire: 3 * 24 * 60 * 60,
	},
	blogs: {
		stale: 2 * 60 * 60,
		revalidate: 24 * 60 * 60,
		expire: 14 * 24 * 60 * 60,
	},
	settings: {
		stale: 12 * 60 * 60,
		revalidate: 24 * 60 * 60,
		expire: 30 * 24 * 60 * 60,
	},
	navigation: {
		stale: 6 * 60 * 60,
		revalidate: 12 * 60 * 60,
		expire: 7 * 24 * 60 * 60,
	},
	dynamic: {
		stale: 5 * 60,
		revalidate: 60 * 60,
		expire: 24 * 60 * 60,
	},
	featured: {
		stale: 15 * 60,
		revalidate: 60 * 60,
		expire: 24 * 60 * 60,
	},
} as const;
