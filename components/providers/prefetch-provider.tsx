'use client';

import React from 'react';

interface PrefetchProviderProps {
  children: React.ReactNode;
  enableIntersectionPrefetch?: boolean;
  enableIdlePrefetch?: boolean;
}

/**
 * No-op prefetch provider - all prefetching disabled
 */
export function PrefetchProvider({ children }: PrefetchProviderProps) {
  return <>{children}</>;
}

/**
 * Hook to access prefetch context - no-op
 */
export function usePrefetchContext() {
  return {
    prefetcher: {
      prefetchImages: () => {},
      getCacheStatus: () => ({ cached: 0, pending: 0, failed: 0 }),
    },
    isSupported: false,
  };
}

/**
 * Hook for viewport-based prefetching - no-op
 */
export function useViewportPrefetch() {
  const elementRef = React.useRef<HTMLElement>();
  
  const registerForPrefetch = () => {
    // No-op
  };

  return {
    ref: elementRef,
    registerForPrefetch,
  };
}

/**
 * Performance monitoring for prefetching - no-op
 */
export function usePrefetchPerformance() {
  return {
    totalPrefetched: 0,
    cacheHits: 0,
    avgPrefetchTime: 0,
  };
}