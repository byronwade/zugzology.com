"use client";

import { useEffect, useMemo, useCallback, useState, useRef } from 'react';
import { useAIPredictionStore } from '@/stores/ai-prediction-store';
import { shopifyDataContext } from '@/lib/services/shopify-data-context';
import { aiPerformanceOptimizer } from '@/lib/services/ai-performance-optimizer';
import type { ShopifyProduct } from '@/lib/types';

export interface AIFilteredProduct {
  product: ShopifyProduct;
  aiScore: number;
  aiConfidence: string;
  aiReasons: string[];
  trend: 'rising' | 'falling' | 'stable';
  rank: number;
}

export interface FilterOptions {
  priceRange?: { min: number; max: number };
  categories?: string[];
  brands?: string[];
  availability?: boolean;
}

interface UseAIFilteringOptions {
  context: 'collection' | 'search' | 'all-products' | 'home' | 'product-page';
  searchQuery?: string;
  collectionHandle?: string;
  currentProductId?: string;
  limit?: number;
}

export function useAIFiltering(
  products: ShopifyProduct[],
  options: UseAIFilteringOptions,
  userFilters: FilterOptions = {}
) {
  const {
    predictions,
    trackInteraction,
    calculatePredictions,
    getTopPredictions,
    isProcessing
  } = useAIPredictionStore();

  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());

  // Track page context changes
  useEffect(() => {
    if (options.currentProductId) {
      trackInteraction({
        productId: options.currentProductId,
        type: 'page_visit',
        context: options.context
      });
    }
  }, [options.currentProductId, options.context, trackInteraction]);

  // No real-time prediction updates - only on page load
  // Predictions are calculated once and remain stable until page refresh

  // Helper function to apply contextual boosts
  const applyContextualBoosts = useCallback((
    baseScore: number, 
    product: ShopifyProduct, 
    opts: UseAIFilteringOptions
  ): number => {
    let boostedScore = baseScore;

    // Collection context boost
    if (opts.context === 'collection' && opts.collectionHandle) {
      const belongsToCollection = product.collections?.nodes?.some(
        collection => collection.handle === opts.collectionHandle
      );
      if (belongsToCollection) {
        boostedScore += 15; // Strong boost for collection relevance
      }
    }

    // Product page context boost (related products)
    if (opts.context === 'product-page' && opts.currentProductId) {
      // Boost products in the same category
      const currentProduct = shopifyDataContext.getProduct(opts.currentProductId);
      if (currentProduct && product.productType === currentProduct.productType) {
        boostedScore += 20;
      }
      
      // Boost products with similar tags
      if (currentProduct) {
        const commonTags = product.tags.filter(tag => 
          currentProduct.tags.some(ctag => ctag.toLowerCase() === tag.toLowerCase())
        );
        boostedScore += commonTags.length * 5;
      }
    }

    // Home page context - boost trending and popular items
    if (opts.context === 'home') {
      if (product.tags.includes('featured') || product.tags.includes('popular')) {
        boostedScore += 10;
      }
    }

    // Search context boost (handled separately)
    
    return boostedScore;
  }, []);

  // Helper function to apply search relevance
  const applySearchRelevance = useCallback((
    baseScore: number, 
    product: ShopifyProduct, 
    searchQuery: string
  ): number => {
    let relevanceScore = baseScore;
    const query = searchQuery.toLowerCase();
    const queryWords = query.split(/\s+/).filter(word => word.length > 2);
    
    // Title matches (highest weight)
    if (product.title.toLowerCase().includes(query)) {
      relevanceScore += 30;
    } else {
      // Partial word matches in title
      const titleMatches = queryWords.filter(word => 
        product.title.toLowerCase().includes(word)
      ).length;
      relevanceScore += titleMatches * 15;
    }
    
    // Description matches
    if (product.description.toLowerCase().includes(query)) {
      relevanceScore += 20;
    } else {
      const descMatches = queryWords.filter(word => 
        product.description.toLowerCase().includes(word)
      ).length;
      relevanceScore += descMatches * 10;
    }
    
    // Tag matches
    const tagMatches = product.tags.filter(tag => 
      tag.toLowerCase().includes(query) || 
      queryWords.some(word => tag.toLowerCase().includes(word))
    ).length;
    relevanceScore += tagMatches * 12;
    
    // Category/product type matches
    if (product.productType.toLowerCase().includes(query)) {
      relevanceScore += 25;
    }

    return relevanceScore;
  }, []);

  // Apply user filters first
  const userFilteredProducts = useMemo(() => {
    let filtered = [...products];

    // Price range filter
    if (userFilters.priceRange) {
      filtered = filtered.filter(product => {
        const price = parseFloat(product.priceRange?.minVariantPrice?.amount || '0');
        return price >= userFilters.priceRange!.min && price <= userFilters.priceRange!.max;
      });
    }

    // Category filter
    if (userFilters.categories && userFilters.categories.length > 0) {
      filtered = filtered.filter(product => 
        userFilters.categories!.some(category => 
          product.productType.toLowerCase().includes(category.toLowerCase()) ||
          product.tags.some(tag => tag.toLowerCase().includes(category.toLowerCase()))
        )
      );
    }

    // Brand filter
    if (userFilters.brands && userFilters.brands.length > 0) {
      filtered = filtered.filter(product => 
        userFilters.brands!.includes(product.vendor)
      );
    }

    // Availability filter
    if (userFilters.availability !== undefined) {
      filtered = filtered.filter(product => product.availableForSale === userFilters.availability);
    }

    return filtered;
  }, [products, userFilters]);

  // Smart reference to prevent unnecessary recalculations
  const lastProcessedData = useRef<{
    products: ShopifyProduct[];
    predictions: Map<string, any>;
    context: string;
    searchQuery?: string;
    timestamp: number;
  }>({ products: [], predictions: new Map(), context: '', timestamp: 0 });

  // Lightning-fast AI ranking (ONLY on page load - products never move after initial load)
  const aiFilteredProducts = useMemo(() => {
    // Skip all processing if no products
    if (userFilteredProducts.length === 0) return [];

    // Create stable cache key (doesn't change after initial load)
    const stableCacheKey = `page-load-ranking-${options.context}-${userFilteredProducts.length}`;
    
    return aiPerformanceOptimizer.memoize(stableCacheKey, () => {
      console.log('🚀 [Page Load AI] Lightning-fast ranking for', userFilteredProducts.length, 'products');
      const startTime = performance.now();

      // INSTANT ranking: Use existing predictions only, no recalculation
      const predictionLookup = new Map(predictions);
      
      // Lightning-fast scoring (minimal calculations)
      const scored = userFilteredProducts.map((product, originalIndex) => {
        const prediction = predictionLookup.get(product.id);
        
        // Simple score calculation for initial ranking
        let score = prediction?.score || (50 - (originalIndex * 0.5)); // Slight preference for original order
        
        // Single contextual boost for collections
        if (options.context === 'collection' && options.collectionHandle) {
          if (product.collections?.nodes?.some(c => c.handle === options.collectionHandle)) {
            score += 5; // Small boost
          }
        }
        
        return {
          product,
          aiScore: Math.round(score),
          aiConfidence: prediction?.confidence || 'low',
          aiReasons: prediction?.reasoning || ['Initial ranking'],
          trend: prediction?.trend || 'stable',
          rank: 0
        };
      });

      // Single sort operation
      scored.sort((a, b) => b.aiScore - a.aiScore);
      
      // Set ranks
      scored.forEach((item, index) => {
        item.rank = index + 1;
      });

      const duration = performance.now() - startTime;
      console.log(`🚀 [Page Load AI] Ranked ${scored.length} products in ${duration.toFixed(2)}ms`);

      return scored.slice(0, options.limit || 24);
    }, 300000); // Cache for 5 minutes - very stable rankings
  }, [userFilteredProducts.length, options.context, options.collectionHandle]); // No predictions dependency!

  // Track hover interactions with intelligence
  const trackHoverStart = useCallback((productId: string) => {
    trackInteraction({
      productId,
      type: 'hover_start',
      context: options.context
    });
  }, [trackInteraction, options.context]);

  const trackHoverEnd = useCallback((productId: string, duration: number) => {
    // Determine the type of interaction based on duration
    let interactionType: any = 'hover_end';
    
    if (duration < 200) {
      interactionType = 'quick_bounce'; // Very quick interaction, likely accidental
    }
    
    trackInteraction({
      productId,
      type: interactionType,
      duration,
      context: options.context,
      metadata: {
        interactionDepth: 1 // Could be enhanced to track sequence
      }
    });
  }, [trackInteraction, options.context]);

  // Track product views
  const trackView = useCallback((productId: string) => {
    trackInteraction({
      productId,
      type: 'view',
      context: options.context
    });
  }, [trackInteraction, options.context]);

  // Track cart actions
  const trackCartAction = useCallback((productId: string, action: 'add' | 'remove') => {
    trackInteraction({
      productId,
      type: action === 'add' ? 'cart_add' : 'cart_remove',
      context: options.context
    });
  }, [trackInteraction, options.context]);

  // Track wishlist actions
  const trackWishlistAction = useCallback((productId: string, action: 'add' | 'remove') => {
    trackInteraction({
      productId,
      type: action === 'add' ? 'wishlist_add' : 'wishlist_remove',
      context: options.context
    });
  }, [trackInteraction, options.context]);

  // Get metadata about the AI filtering
  const getFilterMetadata = useCallback(() => {
    const totalProducts = products.length;
    const filteredCount = aiFilteredProducts.length;
    const aiActiveProducts = aiFilteredProducts.filter(p => p.aiScore > 20).length;
    const highConfidenceProducts = aiFilteredProducts.filter(p => 
      p.aiConfidence === 'high' || p.aiConfidence === 'very_high'
    ).length;

    return {
      totalProducts,
      filteredCount,
      aiActiveProducts,
      highConfidenceProducts,
      processingTime: lastUpdateTime,
      context: options.context,
      hasUserFilters: Object.keys(userFilters).length > 0,
      isRealtime: false
    };
  }, [aiFilteredProducts, products.length, userFilters, options.context, lastUpdateTime]);

  return {
    // Main data
    products: aiFilteredProducts,
    isLoading: isProcessing,
    
    // Metadata
    metadata: getFilterMetadata(),
    
    // Tracking functions
    trackHoverStart,
    trackHoverEnd,
    trackView,
    trackCartAction,
    trackWishlistAction,
    
    // Utility functions
    refreshPredictions: calculatePredictions,
    getTopPredictions: () => getTopPredictions(10)
  };
}