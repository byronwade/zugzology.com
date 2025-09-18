"use server";

import { SHOPIFY_STOREFRONT_ACCESS_TOKEN, SHOPIFY_STORE_DOMAIN } from "@/lib/constants";
import { CACHE_TIMES } from "./cache-config";
import type { ShopifyFetchParams } from "./types";

const MUTATION_REGEX = /^\s*mutation/i;
const endpoint = `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`;

export async function shopifyFetch<T>({ query, variables, tags, cache = "force-cache", next }: ShopifyFetchParams<T>): Promise<{ data: T }> {
	// Check if Shopify credentials are configured
	if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
		console.warn('⚠️ Shopify credentials not configured. Using fallback data.');
		// Return empty data structure to prevent crashes
		return { data: {} as T };
	}

	try {
		const response = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
			},
			body: JSON.stringify({
				query,
				variables,
			}),
			cache,
			next: {
				...next,
				tags: [...(next?.tags || []), ...(tags || [])],
				// Add reasonable revalidation time to prevent excessive retries
				revalidate: next?.revalidate || 300 // 5 minutes default
			},
		});

		if (!response.ok) {
			console.error(`Shopify API error: ${response.status} ${response.statusText}`);
			throw new Error(`Failed to fetch from Shopify: ${response.status} ${response.statusText}`);
		}

		const json = await response.json();

		if (json.errors) {
			throw new Error(`Shopify API Errors: ${json.errors.map((e: Error) => e.message).join(", ")}`);
		}

		return json;
	} catch (error) {
		console.error("Error in shopifyFetch:", error);
		throw error;
	}
}
