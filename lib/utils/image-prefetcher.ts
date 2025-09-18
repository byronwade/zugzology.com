/**
 * Image Prefetcher - DISABLED
 * All image prefetching functionality has been disabled per user request
 */

interface PrefetchOptions {
  priority?: 'high' | 'low';
  timeout?: number;
  retries?: number;
}

interface CacheStatus {
  cached: number;
  pending: number;
  failed: number;
}

class ImagePrefetcher {
  prefetchImages(urls: string[], options?: PrefetchOptions): Promise<void[]> {
    // No-op - return resolved promises
    return Promise.resolve([]);
  }

  prefetchImage(url: string, options?: PrefetchOptions): Promise<void> {
    // No-op
    return Promise.resolve();
  }

  getCacheStatus(): CacheStatus {
    return {
      cached: 0,
      pending: 0,
      failed: 0
    };
  }

  clearCache(): void {
    // No-op
  }

  isCached(url: string): boolean {
    return false;
  }

  getFailedUrls(): string[] {
    return [];
  }

  retryFailed(): Promise<void[]> {
    return Promise.resolve([]);
  }
}

// Export singleton instance
export const imagePrefetcher = new ImagePrefetcher();
export default imagePrefetcher;