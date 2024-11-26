import { unstable_cache } from "next/cache";
import { SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_ACCESS_TOKEN } from "./config/constants";

const domain = SHOPIFY_STORE_DOMAIN;
const storefrontToken = SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const apiVersion = "2024-01";

const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`;

console.log("Shopify Configuration:", {
	domain,
	endpoint,
	hasToken: !!storefrontToken,
});

// Cached Shopify Storefront fetch function
export const cachedStorefrontFetch = unstable_cache(
	async <T>({ query, variables, tags = ["shopify"] }: { query: string; variables?: Record<string, unknown>; tags?: string[] }): Promise<T> => {
		try {
			console.log("Making Shopify request to:", endpoint);
			const res = await fetch(endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-Shopify-Storefront-Access-Token": storefrontToken,
					Accept: "application/json",
				},
				body: JSON.stringify({ query, variables }),
				next: { revalidate: 60 }, // Cache for 60 seconds
			});

			if (!res.ok) {
				const text = await res.text();
				throw new Error(`Shopify API error: ${res.status} ${res.statusText}\nResponse: ${text}`);
			}

			const { data, errors } = await res.json();

			if (errors) {
				console.error("GraphQL Errors:", errors);
				throw new Error(`Shopify GraphQL Error: ${JSON.stringify(errors, null, 2)}`);
			}

			return data as T;
		} catch (error) {
			console.error("Shopify Storefront API error:", error);
			throw error;
		}
	},
	["shopify-storefront"],
	{
		revalidate: 60,
		tags: ["shopify"],
	}
);

export const shopifyStorefront = {
	query: <T>(
		query: string,
		{
			variables,
			tags = ["shopify"],
		}: {
			variables?: Record<string, unknown>;
			tags?: string[];
		} = {}
	) => cachedStorefrontFetch<T>({ query, variables, tags }),
};

// Helper function to format money
export function formatMoney(amount: number | string) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
	}).format(typeof amount === "string" ? parseFloat(amount) : amount);
}

// Helper function to generate product image URLs with size
export function getProductImage(src: string, size: string) {
	if (!src) return "";
	return src.replace(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?$/i, `_${size}.$1$2`);
}
