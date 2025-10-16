import { SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_ACCESS_TOKEN } from "@/lib/constants";
import type { ShopifyFetchParams } from "./types";

// Edge runtime for faster global response
export const runtime = "edge";

/**
 * Shopify GraphQL fetch function optimized for Edge runtime
 *
 * Performance optimized:
 * - Runs on Edge (globally distributed, faster cold starts)
 * - No artificial throttling
 * - Shopify Storefront API allows 200 requests/minute
 * - Homepage makes ~4-6 requests - well within limits
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

	const maxRetries = 3;
	let lastError: Error | null = null;

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			// Direct fetch - no artificial delays
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
				signal: AbortSignal.timeout(30_000), // 30 second timeout
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

			// Check if it's a retryable error
			const isRetryable =
				lastError.message.includes("ECONNRESET") ||
				lastError.message.includes("ETIMEDOUT") ||
				lastError.message.includes("SocketError") ||
				lastError.message.includes("fetch failed") ||
				lastError.message.includes("HTTP 429") || // Rate limit
				lastError.message.includes("HTTP 5"); // Server errors

			if (!isRetryable || attempt === maxRetries) {
				throw lastError;
			}

			// Exponential backoff
			const delay = Math.min(1000 * 2 ** (attempt - 1), 5000);
			await new Promise((resolve) => setTimeout(resolve, delay));
		}
	}

	throw lastError || new Error("Failed to fetch from Shopify");
}
