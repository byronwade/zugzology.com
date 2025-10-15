"use server";

import { SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_ACCESS_TOKEN } from "@/lib/constants";
import type { ShopifyFetchParams } from "./types";

/**
 * Shopify GraphQL fetch function with Next.js caching
 */
export async function shopifyFetch<T>({
	query,
	variables,
	tags,
	cache = "force-cache",
	next,
}: ShopifyFetchParams<T>): Promise<{ data: T }> {
	// Check if Shopify credentials are configured
	if (!(SHOPIFY_STORE_DOMAIN && SHOPIFY_STOREFRONT_ACCESS_TOKEN)) {
		// Return empty data structure to prevent crashes
		return { data: {} as T };
	}

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
		// Don't specify cache when using revalidate - Next.js will handle it
		next: {
			...next,
			tags: [...(next?.tags || []), ...(tags || [])],
			revalidate: next?.revalidate ?? 300, // 5 minutes default
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch from Shopify: ${response.status} ${response.statusText}`);
	}

	const json = await response.json();

	if (json.errors) {
		throw new Error(`Shopify API Errors: ${json.errors.map((e: Error) => e.message).join(", ")}`);
	}

	return json;
}
