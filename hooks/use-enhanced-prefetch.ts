'use client';

/**
 * Enhanced Prefetch Hook - DISABLED
 * All prefetching functionality has been disabled per user request
 */

export function useEnhancedPrefetch() {
  return {
    prefetchRoute: () => {}, // No-op
    prefetchImages: () => {}, // No-op
    isPrefetching: false,
    prefetchedRoutes: new Set(),
    prefetchedImages: new Set(),
  };
}

export function useProductPrefetch() {
  return {
    prefetchProduct: () => {}, // No-op
    prefetchImages: () => {}, // No-op
    isPrefetching: false,
  };
}

export default useEnhancedPrefetch;