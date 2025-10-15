"use client";

// Simple route prefetching only
// No image prefetching - just Next.js route prefetching

class SimplePrefetch {
	private readonly prefetchedRoutes = new Set<string>();

	// Prefetch route using Next.js router
	prefetchRoute(href: string): void {
		if (!this.prefetchedRoutes.has(href)) {
			// Use Next.js built-in prefetching
			if ((window as any).__NEXT_ROUTER__) {
				const router = (window as any).__NEXT_ROUTER__;
				router.prefetch(href);
			}
			this.prefetchedRoutes.add(href);
		}
	}

	// Get stats for debugging
	getStats() {
		return {
			routes: this.prefetchedRoutes.size,
		};
	}
}

const prefetcher = new SimplePrefetch();

export { prefetcher };
