"use server";

import { SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_ACCESS_TOKEN } from "@/lib/constants";
import type { ShopifyFetchParams } from "./types";

// Request queue for throttling
class RequestQueue {
	private readonly queue: Array<() => Promise<void>> = [];
	private processing = false;
	private concurrentRequests = 0;
	private readonly maxConcurrent = 3; // Max 3 concurrent requests
	private readonly delayBetweenRequests = 100; // 100ms delay between requests

	async enqueue<T>(fn: () => Promise<T>): Promise<T> {
		return new Promise((resolve, reject) => {
			this.queue.push(async () => {
				try {
					const result = await fn();
					resolve(result);
				} catch (error) {
					reject(error);
				}
			});
			this.processQueue();
		});
	}

	private async processQueue() {
		if (this.processing || this.concurrentRequests >= this.maxConcurrent) {
			return;
		}

		const task = this.queue.shift();
		if (!task) {
			return;
		}

		this.processing = true;
		this.concurrentRequests++;

		try {
			await task();
		} finally {
			this.concurrentRequests--;

			// Add delay before processing next request
			await new Promise((resolve) => setTimeout(resolve, this.delayBetweenRequests));

			this.processing = false;
			this.processQueue(); // Process next task
		}
	}
}

const requestQueue = new RequestQueue();

/**
 * Shopify GraphQL fetch function with throttling, retry logic, and Next.js caching
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
			// Throttle requests through queue
			const result = await requestQueue.enqueue(async () => {
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
			});

			return result;
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
