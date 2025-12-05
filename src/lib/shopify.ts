"use server";

import { SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_ACCESS_TOKEN } from "@/lib/constants";

// Type definitions
type ShopifyFetchParams = {
	query: string;
	variables?: Record<string, unknown>;
	headers?: Record<string, string>;
	tags?: string[];
	cache?: RequestCache;
	next?: NextFetchRequestConfig;
};

type ShopifyResponse<T> = {
	data: T;
	errors?: Array<{ message: string }>;
};

// Helper function to make GraphQL requests with better error handling
export async function shopifyFetch<T>({
	query,
	variables = {},
	headers = {},
	tags = [],
	cache,
	next,
}: ShopifyFetchParams): Promise<ShopifyResponse<T>> {
	const endpoint = `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`;

	const cacheMode = cache ?? "no-store";
	const resolvedNext = cacheMode === "no-store" ? undefined : next ?? (tags.length ? { tags } : undefined);

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
		cache: cacheMode,
		next: resolvedNext,
	});

	const json = await response.json();

	if (json.errors) {
		throw new Error(`Shopify GraphQL Error: ${json.errors.map((e: any) => e.message).join(", ")}`);
	}

	return json as ShopifyResponse<T>;
}
