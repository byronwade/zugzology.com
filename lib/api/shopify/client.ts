"use server";

import { SHOPIFY_STOREFRONT_ACCESS_TOKEN, SHOPIFY_STORE_DOMAIN } from "@/lib/constants";
import { CACHE_TIMES } from "./cache-config";
import type { ShopifyFetchParams, ShopifyResponse } from "./types";

const MUTATION_REGEX = /^\s*mutation/i;
const endpoint = `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`;

interface ShopifyFetchParams<T> {
	query: string;
	variables?: Record<string, unknown>;
	tags?: string[];
	cache?: RequestCache;
	next?: {
		revalidate?: number;
		tags?: string[];
	};
}

export async function shopifyFetch<T>({ query, variables, tags, cache = "force-cache", next }: ShopifyFetchParams<T>): Promise<{ data: T }> {
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
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch from Shopify: ${response.statusText}`);
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
