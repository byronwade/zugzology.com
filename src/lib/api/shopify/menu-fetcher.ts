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

/**
 * Get menu with comprehensive caching
 * Note: Retry logic is now handled by shopifyFetch()
 */
export const getMenuRobust = cache(async (handle: string): Promise<ShopifyMenuItem[]> => {
	try {
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
			next: { revalidate: 300 }, // Cache for 5 minutes
		});

		const _duration = Date.now() - startTime;
		const items = data?.menu?.items ?? [];

		// Update memory cache on success
		if (items.length > 0) {
			memoryCache = {
				data: items,
				timestamp: Date.now(),
				handle,
			};
		}

		return items;
	} catch (_error) {
		// Try to use memory cache as fallback
		if (memoryCache && memoryCache.handle === handle) {
			const cacheAge = Date.now() - memoryCache.timestamp;
			if (cacheAge < MEMORY_CACHE_TTL) {
				return memoryCache.data || [];
			}
		}

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
