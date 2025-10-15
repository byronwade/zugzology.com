/**
 * Predictive Prefetching System - DISABLED
 * All prefetching functionality has been disabled per user request
 */

type PredictionResult = {
	path: string;
	confidence: number;
	reason: string;
	metadata?: Record<string, any>;
};

class PredictivePrefetcher {
	enable() {
		// No-op
	}

	disable() {
		// No-op
	}

	isActive(): boolean {
		return false;
	}

	trackPageView(): void {
		// No-op
	}

	trackHover(): void {
		// No-op
	}

	trackClick(): void {
		// No-op
	}

	trackScroll(): void {
		// No-op
	}

	getNextPredictions(): PredictionResult[] {
		return [];
	}

	prefetchPrediction(): void {
		// No-op
	}

	getSessionStats(): any {
		return {
			actionsTracked: 0,
			prefetchesMade: 0,
			accuracy: 0,
			patterns: [],
		};
	}
}

// Export a single instance
export const predictivePrefetcher = new PredictivePrefetcher();
export default predictivePrefetcher;

// Export disabled hook for components that expect it
export function usePredictivePrefetching() {
	return {
		metrics: {
			actionsTracked: 0,
			prefetchesMade: 0,
			accuracy: 0,
			patterns: [],
		},
		isActive: false,
		enable: () => {},
		disable: () => {},
	};
}
