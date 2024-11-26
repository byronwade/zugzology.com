import { GraphQLClient } from "graphql-request";

if (!process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN) {
	throw new Error("NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN environment variable is not set");
}

if (!process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
	throw new Error("NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN environment variable is not set");
}

export const shopifyClient = new GraphQLClient(`https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`, {
	headers: {
		"X-Shopify-Storefront-Access-Token": process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
		"Content-Type": "application/json",
	},
});
