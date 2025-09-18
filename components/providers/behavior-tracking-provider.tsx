"use client";

import React, { createContext, useContext, useEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { userBehaviorTracker } from '@/lib/services/user-behavior-tracker';

interface BehaviorTrackingContextType {
  trackPageView: (path: string, additionalData?: any) => void;
  trackProductView: (productId: string, productData?: any) => void;
  trackSearch: (query: string, results?: number, filters?: any) => void;
  trackAddToCart: (productId: string, quantity?: number, variant?: any) => void;
  trackPurchase: (orderData: any) => void;
  setUserId: (userId: string) => void;
  getBehaviorData: () => any;
  isTrackingEnabled: () => boolean;
}

const BehaviorTrackingContext = createContext<BehaviorTrackingContextType | null>(null);

interface BehaviorTrackingProviderProps {
  children: React.ReactNode;
}

function BehaviorTrackingProviderInner({ children }: BehaviorTrackingProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageStartTime = useRef<number>(0);
  const lastPathname = useRef<string>('');

  // Initialize on mount to avoid Date.now() during prerendering
  useEffect(() => {
    if (pageStartTime.current === 0) {
      pageStartTime.current = Date.now();
    }
  }, []);

  // Track page views when pathname changes
  useEffect(() => {
    const currentPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    
    // Track time on previous page
    if (lastPathname.current && lastPathname.current !== currentPath && pageStartTime.current > 0) {
      const timeSpent = Date.now() - pageStartTime.current;
      userBehaviorTracker.trackTimeOnPage(lastPathname.current, timeSpent);
    }
    
    // Track new page view
    if (typeof window !== 'undefined') {
      userBehaviorTracker.trackPageView(currentPath, {
        searchParams: searchParams?.toString(),
        referrer: document.referrer
      });
    }
    
    // Update tracking state
    pageStartTime.current = Date.now();
    lastPathname.current = currentPath;
  }, [pathname, searchParams]);

  // Track time on page when user leaves
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (lastPathname.current) {
        const timeSpent = Date.now() - pageStartTime.current;
        userBehaviorTracker.trackTimeOnPage(lastPathname.current, timeSpent);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Track visibility changes (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && lastPathname.current) {
        const timeSpent = Date.now() - pageStartTime.current;
        userBehaviorTracker.trackTimeOnPage(lastPathname.current, timeSpent);
      } else if (!document.hidden) {
        pageStartTime.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const contextValue: BehaviorTrackingContextType = {
    trackPageView: userBehaviorTracker.trackPageView.bind(userBehaviorTracker),
    trackProductView: userBehaviorTracker.trackProductView.bind(userBehaviorTracker),
    trackSearch: userBehaviorTracker.trackSearch.bind(userBehaviorTracker),
    trackAddToCart: userBehaviorTracker.trackAddToCart.bind(userBehaviorTracker),
    trackPurchase: userBehaviorTracker.trackPurchase.bind(userBehaviorTracker),
    setUserId: userBehaviorTracker.setUserId.bind(userBehaviorTracker),
    getBehaviorData: userBehaviorTracker.getBehaviorData.bind(userBehaviorTracker),
    isTrackingEnabled: userBehaviorTracker.isTrackingEnabled.bind(userBehaviorTracker)
  };

  return (
    <BehaviorTrackingContext.Provider value={contextValue}>
      {children}
    </BehaviorTrackingContext.Provider>
  );
}

export function useBehaviorTracking() {
  const context = useContext(BehaviorTrackingContext);
  
  if (!context) {
    // Return no-op functions if provider is not available
    return {
      trackPageView: () => {},
      trackProductView: () => {},
      trackSearch: () => {},
      trackAddToCart: () => {},
      trackPurchase: () => {},
      setUserId: () => {},
      getBehaviorData: () => ({}),
      isTrackingEnabled: () => false
    };
  }
  
  return context;
}

export function BehaviorTrackingProvider({ children }: BehaviorTrackingProviderProps) {
  return (
    <Suspense fallback={children}>
      <BehaviorTrackingProviderInner>{children}</BehaviorTrackingProviderInner>
    </Suspense>
  );
}

export default BehaviorTrackingProvider;