import { SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_ACCESS_TOKEN } from "@/lib/constants";
import type { ShopifyFetchParams } from "./types";

const DEFAULT_TIMEOUT_MS = 2500;
const MAX_RETRIES = 1;

/**
 * Shopify Storefront GraphQL fetch — tuned for sub-50ms warm-cache TTFB.
 * Failures fail fast (short timeout, single retry) so pages can degrade instead of hanging.
 */
export async function shopifyFetch<T>({ query, variables, tags, next }: ShopifyFetchParams<T>): Promise<{ data: T }> {
	if (!(SHOPIFY_STORE_DOMAIN && SHOPIFY_STOREFRONT_ACCESS_TOKEN)) {
		return { data: {} as T };
	}

	let lastError: Error | null = null;

	for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
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
				next: {
					...next,
					tags: [...(next?.tags || []), ...(tags || [])],
					revalidate: next?.revalidate ?? 300,
				},
				signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const json = await response.json();

			if (json.errors) {
				throw new Error(`Shopify API Errors: ${json.errors.map((e: { message: string }) => e.message).join(", ")}`);
			}

			return json;
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));

			const isRetryable =
				lastError.message.includes("ECONNRESET") ||
				lastError.message.includes("ETIMEDOUT") ||
				lastError.message.includes("SocketError") ||
				lastError.message.includes("fetch failed") ||
				lastError.message.includes("HTTP 429") ||
				lastError.message.includes("HTTP 5");

			if (!isRetryable || attempt > MAX_RETRIES) {
				throw lastError;
			}

			await new Promise((resolve) => setTimeout(resolve, 150));
		}
	}

	throw lastError || new Error("Failed to fetch from Shopify");
}
