export const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
export const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

export const CACHE_TIMES = {
	products: 60,
	collections: 60,
	menu: 3600,
	blog: 300,
} as const;

export const SITE_NAME = "Your Store Name";
export const SITE_DESCRIPTION = "Your store description";
