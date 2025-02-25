"use server";

import { SHOPIFY_STOREFRONT_ACCESS_TOKEN, SHOPIFY_STORE_DOMAIN } from "@/lib/constants";

// Type definitions
interface ShopifyFetchParams {
	query: string;
	variables?: Record<string, unknown>;
	headers?: Record<string, string>;
	tags?: string[];
}

interface ShopifyResponse<T> {
	data: T;
	errors?: Array<{ message: string }>;
}

// Helper function to make GraphQL requests with better error handling
export async function shopifyFetch<T>({ query, variables = {}, headers = {}, tags = [] }: ShopifyFetchParams): Promise<ShopifyResponse<T>> {
	try {
		const endpoint = `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`;

		const response = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
				...headers,
			},
			body: JSON.stringify({
				query,
				variables,
			}),
			next: tags.length ? { tags } : undefined,
		});

		const json = await response.json();

		if (json.errors) {
			console.error("❌ [Shopify API] GraphQL Errors:", {
				errors: json.errors,
				query,
				variables,
			});
			throw new Error(`Shopify GraphQL Error: ${json.errors.map((e: any) => e.message).join(", ")}`);
		}

		return json as ShopifyResponse<T>;
	} catch (error) {
		console.error("❌ [Shopify API] Fetch error:", error);
		throw error;
	}
}
