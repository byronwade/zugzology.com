// Shopify configuration
export const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
export const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

if (!SHOPIFY_STORE_DOMAIN) {
	throw new Error("NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN environment variable is not set");
}

if (!SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
	throw new Error("NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN environment variable is not set");
}
