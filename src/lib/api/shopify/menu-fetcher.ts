"use server";

import { cache } from "react";
import type { ShopifyMenuItem } from "@/lib/types";
import { shopifyFetch } from "./client";
import { MENU_ITEM_FRAGMENT } from "./fragments";

// In-memory cache as ultimate fallback
let memoryCache: {
	data: ShopifyMenuItem[] | null;
	timestamp: number;
	handle: string;
} | null = null;

const MEMORY_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 500; // ms

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch menu with retry logic and exponential backoff
 */
async function fetchMenuWithRetry(handle: string, attempt = 1): Promise<ShopifyMenuItem[]> {
	try {
		console.log(`[Menu Fetcher] Attempt ${attempt}/${MAX_RETRIES} for menu: ${handle}`);

		const startTime = Date.now();

		const { data } = await shopifyFetch<{ menu: { items: ShopifyMenuItem[] } | null }>({
			query: `
				query getMenu($handle: String!) {
					menu(handle: $handle) {
						items {
							...MenuItemFragment
						}
					}
				}
				${MENU_ITEM_FRAGMENT}
			`,
			variables: { handle },
			tags: [`menu-${handle}`],
		});

		const duration = Date.now() - startTime;
		console.log(`[Menu Fetcher] ✅ Success in ${duration}ms - Got ${data?.menu?.items?.length || 0} items`);

		const items = data?.menu?.items ?? [];

		// Update memory cache on success
		if (items.length > 0) {
			memoryCache = {
				data: items,
				timestamp: Date.now(),
				handle,
			};
			console.log(`[Menu Fetcher] 💾 Updated memory cache with ${items.length} items`);
		}

		return items;
	} catch (error) {
		console.error(`[Menu Fetcher] ❌ Attempt ${attempt}/${MAX_RETRIES} failed:`, error);

		// If we haven't exhausted retries, try again with exponential backoff
		if (attempt < MAX_RETRIES) {
			const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
			console.log(`[Menu Fetcher] ⏳ Retrying in ${delay}ms...`);
			await sleep(delay);
			return fetchMenuWithRetry(handle, attempt + 1);
		}

		// All retries exhausted
		console.error(`[Menu Fetcher] 💥 All ${MAX_RETRIES} attempts failed for menu: ${handle}`);

		// Try to use memory cache as last resort
		if (memoryCache && memoryCache.handle === handle) {
			const cacheAge = Date.now() - memoryCache.timestamp;
			if (cacheAge < MEMORY_CACHE_TTL) {
				console.log(`[Menu Fetcher] 🔄 Using memory cache (age: ${Math.round(cacheAge / 1000)}s)`);
				return memoryCache.data || [];
			}
			console.log(`[Menu Fetcher] ⚠️ Memory cache too old (${Math.round(cacheAge / 1000)}s > ${MEMORY_CACHE_TTL / 1000}s)`);
		}

		return [];
	}
}

/**
 * Get menu with comprehensive caching and retry logic
 */
export const getMenuRobust = cache(async (handle: string): Promise<ShopifyMenuItem[]> => {
	console.log(`[Menu Fetcher] 📋 Fetching menu: ${handle}`);

	try {
		const items = await fetchMenuWithRetry(handle);

		if (items.length === 0) {
			console.warn(`[Menu Fetcher] ⚠️ Menu "${handle}" returned 0 items - check Shopify admin`);
		} else {
			console.log(`[Menu Fetcher] ✨ Successfully loaded ${items.length} menu items`);
		}

		return items;
	} catch (error) {
		console.error(`[Menu Fetcher] 🔥 Fatal error fetching menu "${handle}":`, error);
		return [];
	}
});

/**
 * Health check - validates menu is working
 */
export async function checkMenuHealth(handle: string): Promise<{
	healthy: boolean;
	itemCount: number;
	responseTime: number;
	error?: string;
}> {
	const startTime = Date.now();

	try {
		const items = await getMenuRobust(handle);
		const responseTime = Date.now() - startTime;

		return {
			healthy: items.length > 0,
			itemCount: items.length,
			responseTime,
		};
	} catch (error) {
		return {
			healthy: false,
			itemCount: 0,
			responseTime: Date.now() - startTime,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}
