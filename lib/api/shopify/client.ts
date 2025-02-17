"use server";

import { SHOPIFY_STOREFRONT_ACCESS_TOKEN, SHOPIFY_STORE_DOMAIN } from "@/lib/constants";
import { CACHE_TIMES } from "./cache-config";
import type { ShopifyFetchParams, ShopifyResponse } from "./types";

const MUTATION_REGEX = /^\s*mutation/i;
const endpoint = `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`;

export async function shopifyFetch<T>({ query, variables = {}, tags = [] }: ShopifyFetchParams<T>): Promise<ShopifyResponse<T>> {
	const isMutation = MUTATION_REGEX.test(query);

	try {
		const result = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
			},
			body: JSON.stringify({ query, variables }),
			next: isMutation
				? undefined
				: {
						revalidate: CACHE_TIMES.PRODUCTS,
						tags: tags.length ? tags : undefined,
				  },
			cache: isMutation ? "no-store" : "force-cache",
		});

		if (!result.ok) {
			console.error("Shopify API Error:", {
				status: result.status,
				statusText: result.statusText,
				url: endpoint,
			});
			throw new Error(`Failed to fetch from Shopify: ${result.statusText}`);
		}

		const response = await result.json();

		if (response.errors) {
			console.error("Shopify GraphQL Errors:", response.errors);
			throw new Error(response.errors[0].message);
		}

		return response;
	} catch (error) {
		console.error("Shopify Fetch Error:", error);
		throw error;
	}
}
