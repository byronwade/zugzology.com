"use client";

/**
 * Predictive Prefetcher Service - DISABLED
 * All prefetching functionality has been disabled per user request
 */

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

  getNextPredictions(): any[] {
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
      patterns: []
    };
  }

  getPrefetchStatus(): any {
    return {
      pending: 0,
      completed: 0,
      failed: 0,
      total: 0
    };
  }
}

// Export a single instance
export const predictivePrefetcher = new PredictivePrefetcher();
export default predictivePrefetcher;