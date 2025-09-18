/**
 * Store Configuration Hook
 * 
 * React hook for accessing store configuration throughout the application.
 * Provides type-safe access to all store settings with proper fallbacks.
 */

'use client';

import { useEffect, useState } from 'react';
import { getStoreConfigSafe, type StoreConfig } from '@/lib/config/store-config';

/**
 * Hook to access store configuration
 */
export function useStoreConfig() {
  const [config, setConfig] = useState<StoreConfig>(() => getStoreConfigSafe());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Update configuration when it changes
    try {
      const latestConfig = getStoreConfigSafe();
      setConfig(latestConfig);
    } catch (error) {
      console.warn('Failed to load store config, using defaults:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    config,
    isLoading,
    
    // Convenience accessors
    storeName: config.storeName,
    storeDescription: config.storeDescription,
    storeDomain: config.storeDomain,
    currency: config.currency,
    branding: config.branding,
    navigation: config.navigation,
    features: config.features,
    seo: config.seo,
    templates: config.templates,
    promotions: config.promotions,
  };
}

/**
 * Hook specifically for branding information
 */
export function useStoreBranding() {
  const { branding, storeName } = useStoreConfig();
  
  return {
    ...branding,
    storeName,
    
    // CSS custom properties for theming
    cssVariables: {
      '--primary-color': branding.primaryColor,
      '--secondary-color': branding.secondaryColor,
    },
  };
}

/**
 * Hook for feature flags
 */
export function useStoreFeatures() {
  const { features } = useStoreConfig();
  
  return {
    ...features,
    
    // Convenience checks
    canShowPromos: features.showPromos,
    canSearch: features.enableSearch,
    canWishlist: features.enableWishlist,
    canReview: features.enableReviews,
    canBlog: features.enableBlog,
    canBrowseCollections: features.enableCollections,
  };
}

/**
 * Hook for SEO metadata
 */
export function useStoreSEO() {
  const { seo, storeName, storeDescription } = useStoreConfig();
  
  return {
    ...seo,
    
    // Generate page-specific metadata
    generateMetadata: (pageTitle?: string, pageDescription?: string) => ({
      title: pageTitle ? `${pageTitle} | ${storeName}` : seo.defaultTitle,
      description: pageDescription || seo.defaultDescription,
      keywords: seo.keywords,
      openGraph: {
        title: pageTitle ? `${pageTitle} | ${storeName}` : seo.defaultTitle,
        description: pageDescription || seo.defaultDescription,
        images: seo.ogImage ? [seo.ogImage] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: pageTitle ? `${pageTitle} | ${storeName}` : seo.defaultTitle,
        description: pageDescription || seo.defaultDescription,
        creator: seo.twitterHandle,
        images: seo.ogImage ? [seo.ogImage] : [],
      },
    }),
  };
}

/**
 * Hook for currency formatting
 */
export function useStoreCurrency() {
  const { currency } = useStoreConfig();
  
  return {
    ...currency,
    
    // Format price with store currency
    formatPrice: (amount: string | number) => {
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.code,
      }).format(numAmount);
    },
    
    // Format price with custom symbol
    formatPriceWithSymbol: (amount: string | number) => {
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      return `${currency.symbol}${numAmount.toFixed(2)}`;
    },
  };
}