"use client";

import { useEffect, useState } from 'react';
import { shopifyDataContext } from '@/lib/services/shopify-data-context';

interface ShopifyDataProviderProps {
  children: React.ReactNode;
}

export function ShopifyDataProvider({ children }: ShopifyDataProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log('🛍️ [Shopify Data Provider] Setting up Shopify data context...');
    
    // Set up initialization when page loads
    const initializeWhenReady = () => {
      setTimeout(async () => {
        try {
          console.log('🛍️ [Shopify Data Provider] Auto-initializing Shopify data...');
          await shopifyDataContext.forceInitialize();
          setIsInitialized(true);
        } catch (error) {
          console.error('🛍️ [Shopify Data Provider] Auto-initialization failed:', error);
          setIsInitialized(true);
        }
      }, 1000);
    };

    if (document.readyState === 'complete') {
      initializeWhenReady();
    } else {
      window.addEventListener('load', initializeWhenReady, { once: true });
    }

    // Listen for shopify data updates
    const handleShopifyUpdate = (event: any) => {
      console.log('🛍️ [Shopify Data Provider] Received Shopify data update:', event.detail);
      setIsInitialized(true); // Mark as initialized when we get updates
    };

    window.addEventListener('shopify-data-updated', handleShopifyUpdate);

    return () => {
      window.removeEventListener('shopify-data-updated', handleShopifyUpdate);
    };
  }, []);

  return <>{children}</>;
}

export default ShopifyDataProvider;