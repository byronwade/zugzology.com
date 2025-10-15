/**
 * Image Prefetcher Utility
 *
 * Modern image prefetching system for optimizing perceived performance.
 * Inspired by NextMaster/NextFaster optimizations.
 *
 * Features:
 * - Intelligent caching to avoid redundant requests
 * - Priority-based prefetching
 * - Network-aware prefetching (respects Save-Data)
 * - Error handling and retry logic
 * - Progress tracking
 */

export type PrefetchPriority = "high" | "low" | "auto";

export interface PrefetchOptions {
	/** Priority level for the prefetch request */
	priority?: PrefetchPriority;
	/** Timeout in milliseconds before giving up */
	timeout?: number;
	/** Number of retry attempts for failed prefetches */
	retries?: number;
	/** Delay between retries in milliseconds */
	retryDelay?: number;
	/** Force prefetch even if already cached */
	force?: boolean;
}

export interface CacheStatus {
	/** Number of successfully cached images */
	cached: number;
	/** Number of images currently being prefetched */
	pending: number;
	/** Number of failed prefetch attempts */
	failed: number;
	/** Total size of cached images in bytes (estimated) */
	estimatedSize: number;
}

export interface PrefetchResult {
	/** The URL that was prefetched */
	url: string;
	/** Whether the prefetch was successful */
	success: boolean;
	/** Error message if prefetch failed */
	error?: string;
	/** Time taken to prefetch in milliseconds */
	duration?: number;
	/** Whether the image was already cached */
	wasAlreadyCached: boolean;
}

// Global caches
const imageCache = new Set<string>();
const pendingPrefetches = new Map<string, Promise<PrefetchResult>>();
const failedUrls = new Set<string>();
const prefetchMetrics = new Map<string, { attempts: number; lastAttempt: number }>();

// Maximum cache size (number of URLs)
const MAX_CACHE_SIZE = 500;

// Check if user prefers reduced data usage
function shouldReduceData(): boolean {
	if (typeof navigator === "undefined") {
		return false;
	}

	// Check for Save-Data header
	if ("connection" in navigator && (navigator as any).connection) {
		const connection = (navigator as any).connection;
		if (connection.saveData) {
			return true;
		}

		// Check for slow connections (2G or slower)
		if (connection.effectiveType && (connection.effectiveType === "slow-2g" || connection.effectiveType === "2g")) {
			return true;
		}
	}

	return false;
}

// Clean up cache if it gets too large
function cleanupCache(): void {
	if (imageCache.size > MAX_CACHE_SIZE) {
		// Remove oldest 20% of entries
		const toRemove = Math.floor(MAX_CACHE_SIZE * 0.2);
		const entries = Array.from(imageCache);

		for (let i = 0; i < toRemove; i++) {
			imageCache.delete(entries[i]);
		}
	}
}

/**
 * Prefetch a single image
 */
async function prefetchSingleImage(
	url: string,
	options: PrefetchOptions = {}
): Promise<PrefetchResult> {
	const {
		priority = "auto",
		timeout = 10000,
		retries = 1,
		retryDelay = 1000,
		force = false,
	} = options;

	const startTime = performance.now();

	// Check if already cached
	if (imageCache.has(url) && !force) {
		return {
			url,
			success: true,
			duration: performance.now() - startTime,
			wasAlreadyCached: true,
		};
	}

	// Check if already pending
	if (pendingPrefetches.has(url)) {
		return pendingPrefetches.get(url)!;
	}

	// Check network conditions
	if (priority === "auto" && shouldReduceData()) {
		return {
			url,
			success: false,
			error: "Skipped due to network conditions (Save-Data or slow connection)",
			wasAlreadyCached: false,
		};
	}

	// Create prefetch promise
	const prefetchPromise = (async (): Promise<PrefetchResult> => {
		let lastError: Error | null = null;
		let attempts = 0;

		while (attempts < retries) {
			attempts++;

			try {
				// Use fetch with low priority for better performance
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), timeout);

				const response = await fetch(url, {
					method: "GET",
					// @ts-ignore - fetchpriority is not in TS types yet
					priority: priority === "high" ? "high" : "low",
					signal: controller.signal,
					mode: "no-cors", // Allow cross-origin images
				});

				clearTimeout(timeoutId);

				if (response.ok || response.type === "opaque") {
					// Create an Image object to trigger browser caching
					const img = new Image();
					img.src = url;

					await new Promise((resolve, reject) => {
						img.onload = resolve;
						img.onerror = reject;
					});

					// Add to cache
					imageCache.add(url);
					cleanupCache();

					// Remove from failed set if it was there
					failedUrls.delete(url);

					return {
						url,
						success: true,
						duration: performance.now() - startTime,
						wasAlreadyCached: false,
					};
				}

				throw new Error(`Failed to prefetch: ${response.statusText}`);
			} catch (error) {
				lastError = error as Error;

				// Track metrics
				const metrics = prefetchMetrics.get(url) || { attempts: 0, lastAttempt: 0 };
				metrics.attempts++;
				metrics.lastAttempt = Date.now();
				prefetchMetrics.set(url, metrics);

				// If not the last retry, wait before retrying
				if (attempts < retries) {
					await new Promise((resolve) => setTimeout(resolve, retryDelay));
				}
			}
		}

		// All retries failed
		failedUrls.add(url);

		return {
			url,
			success: false,
			error: lastError?.message || "Unknown error",
			duration: performance.now() - startTime,
			wasAlreadyCached: false,
		};
	})();

	// Store pending prefetch
	pendingPrefetches.set(url, prefetchPromise);

	try {
		const result = await prefetchPromise;
		return result;
	} finally {
		// Clean up pending map
		pendingPrefetches.delete(url);
	}
}

/**
 * Main ImagePrefetcher class
 */
class ImagePrefetcher {
	/**
	 * Prefetch multiple images in parallel
	 */
	async prefetchImages(urls: string[], options?: PrefetchOptions): Promise<PrefetchResult[]> {
		// Filter out invalid URLs
		const validUrls = urls.filter((url) => {
			try {
				new URL(url, window.location.href);
				return true;
			} catch {
				return false;
			}
		});

		if (validUrls.length === 0) {
			return [];
		}

		// Prefetch all images in parallel
		const results = await Promise.allSettled(
			validUrls.map((url) => prefetchSingleImage(url, options))
		);

		return results.map((result, index) => {
			if (result.status === "fulfilled") {
				return result.value;
			}

			return {
				url: validUrls[index],
				success: false,
				error: result.reason?.message || "Unknown error",
				wasAlreadyCached: false,
			};
		});
	}

	/**
	 * Prefetch a single image
	 */
	async prefetchImage(url: string, options?: PrefetchOptions): Promise<PrefetchResult> {
		return prefetchSingleImage(url, options);
	}

	/**
	 * Get current cache status
	 */
	getCacheStatus(): CacheStatus {
		return {
			cached: imageCache.size,
			pending: pendingPrefetches.size,
			failed: failedUrls.size,
			// Rough estimate: assume average 500KB per image
			estimatedSize: imageCache.size * 500 * 1024,
		};
	}

	/**
	 * Clear the image cache
	 */
	clearCache(): void {
		imageCache.clear();
		failedUrls.clear();
		prefetchMetrics.clear();
	}

	/**
	 * Check if an image URL is already cached
	 */
	isCached(url: string): boolean {
		return imageCache.has(url);
	}

	/**
	 * Get list of failed URLs
	 */
	getFailedUrls(): string[] {
		return Array.from(failedUrls);
	}

	/**
	 * Retry all failed prefetches
	 */
	async retryFailed(options?: PrefetchOptions): Promise<PrefetchResult[]> {
		const urlsToRetry = Array.from(failedUrls);
		failedUrls.clear();

		return this.prefetchImages(urlsToRetry, options);
	}

	/**
	 * Get prefetch metrics for debugging
	 */
	getMetrics(): Array<{ url: string; attempts: number; lastAttempt: number }> {
		return Array.from(prefetchMetrics.entries()).map(([url, metrics]) => ({
			url,
			...metrics,
		}));
	}

	/**
	 * Warmup cache by prefetching critical images
	 * Useful for above-the-fold content
	 */
	async warmup(urls: string[]): Promise<void> {
		await this.prefetchImages(urls, { priority: "high", retries: 2 });
	}
}

// Export singleton instance
export const imagePrefetcher = new ImagePrefetcher();

// Export class for testing or custom instances
export { ImagePrefetcher };

// Default export
export default imagePrefetcher;
