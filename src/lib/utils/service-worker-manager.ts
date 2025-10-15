/**
 * Service Worker Manager
 * DISABLED - prefetching removed per user request
 */

type SWMessage = {
	type: string;
	data?: any;
};

type SWMetrics = {
	cacheHits: number;
	cacheMisses: number;
	networkRequests: number;
	prefetchedResources: number;
	averageResponseTime: number;
};

class ServiceWorkerManager {
	constructor() {
		this.isSupported = false; // Disabled
	}

	public onUpdate(_callback: () => void): () => void {
		return () => {};
	}

	public onMetrics(_callback: (metrics: SWMetrics) => void): () => void {
		return () => {};
	}

	public async checkForUpdate(): Promise<void> {
		// Disabled
	}

	public async skipWaiting(): Promise<void> {
		// Disabled
	}

	public async prefetchRoutes(_routes: string[]): Promise<void> {
		// Disabled
	}

	public async prefetchImages(_imageUrls: string[]): Promise<void> {
		// Disabled
	}

	public async clearCache(): Promise<void> {
		// Disabled
	}

	public async getCacheStats(): Promise<{ size: number; count: number }> {
		return { size: 0, count: 0 };
	}

	public getStatus(): "inactive" | "installing" | "waiting" | "active" {
		return "inactive";
	}

	public async sendMessage(_message: SWMessage): Promise<void> {
		// Disabled
	}

	public destroy(): void {
		// Disabled
	}
}

// Export singleton instance
export const swManager = new ServiceWorkerManager();

// React hook for using the service worker manager
export function useServiceWorker() {
	return {
		metrics: null as SWMetrics | null,
		status: "inactive" as const,
		update: async () => {},
		skipWaiting: async () => {},
		clearCache: async () => {},
	};
}
