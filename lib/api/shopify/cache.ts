"use server";

import { unstable_cache } from "next/cache";
import { CACHE_TIMES } from "./cache-config";

export async function getCachedData<T>(key: string, cacheDuration: number, fetchFn: () => Promise<T>): Promise<T> {
	return unstable_cache(
		async () => {
			try {
				return await fetchFn();
			} catch (error) {
				console.error(`Cache fetch error for key ${key}:`, error);
				throw error;
			}
		},
		[key],
		{
			revalidate: cacheDuration,
			tags: [key],
		}
	)();
}

// Helper function to generate cache keys
export function generateCacheKey(prefix: string, identifier?: string): string {
	return identifier ? `${prefix}_${identifier}` : prefix;
}

// No longer need setCachedData or clearCache as unstable_cache handles this internally
