"use client";

import { shopifyDataContext } from './shopify-data-context';
import { advancedBehaviorTracker } from './advanced-behavior-tracker';
import type { ShopifyProduct } from '@/lib/types';

export interface OrganizationStrategy {
  id: string;
  name: string;
  description: string;
  weight: number;
  enabled: boolean;
}

export interface ProductOrganizationResult {
  products: ShopifyProduct[];
  strategy: string;
  confidence: number;
  reasons: string[];
  appliedAt: number;
}

class AIProductOrganizer {
  private strategies: Map<string, OrganizationStrategy> = new Map();
  private organizationCache: Map<string, ProductOrganizationResult> = new Map();
  private cacheExpiryMs = 60000; // 1 minute cache

  constructor() {
    this.initializeStrategies();
  }

  private initializeStrategies() {
    const defaultStrategies: OrganizationStrategy[] = [
      {
        id: 'personalized',
        name: 'Personalized Recommendations',
        description: 'Show products based on user behavior and preferences',
        weight: 1.0,
        enabled: true
      },
      {
        id: 'trending',
        name: 'Trending Products',
        description: 'Surface products with high engagement and recent activity',
        weight: 0.8,
        enabled: true
      },
      {
        id: 'high_intent',
        name: 'High Purchase Intent',
        description: 'Prioritize products the user is likely to purchase',
        weight: 1.2,
        enabled: true
      },
      {
        id: 'inventory_optimization',
        name: 'Inventory Optimization',
        description: 'Balance stock levels with user interest',
        weight: 0.6,
        enabled: true
      },
      {
        id: 'margin_optimization',
        name: 'Margin Optimization',
        description: 'Highlight higher-margin products when appropriate',
        weight: 0.4,
        enabled: true
      },
      {
        id: 'category_affinity',
        name: 'Category Affinity',
        description: 'Show products from categories the user has shown interest in',
        weight: 0.9,
        enabled: true
      }
    ];

    defaultStrategies.forEach(strategy => {
      this.strategies.set(strategy.id, strategy);
    });
  }

  /**
   * Organize products for the homepage
   */
  public organizeHomepageProducts(): {
    hero: ShopifyProduct | null;
    featured: ShopifyProduct[];
    trending: ShopifyProduct[];
    personalized: ShopifyProduct[];
    newArrivals: ShopifyProduct[];
  } {
    const cacheKey = 'homepage';
    const cached = this.getCachedResult(cacheKey);
    
    if (cached && cached.products) {
      return this.parseHomepageResult(cached.products);
    }

    const allProducts = shopifyDataContext.getAllProducts();
    const topScored = shopifyDataContext.getTopScoredProducts(50);
    const personalizedProducts = shopifyDataContext.getPersonalizedProducts(12);
    const trendingProducts = shopifyDataContext.getTrendingProducts(12);
    
    // Convert Shopify data to our format
    const shopifyProducts = this.convertShopifyDataToProducts(allProducts);
    
    // Find hero product (highest scoring available product)
    const hero = topScored.length > 0 ? this.convertShopifyDataToProduct(topScored[0].product) : null;
    
    // Get featured products (top scored, excluding hero)
    const featured = topScored
      .slice(hero ? 1 : 0, 9)
      .map(item => this.convertShopifyDataToProduct(item.product))
      .filter(Boolean) as ShopifyProduct[];
    
    // Get trending products
    const trending = trendingProducts
      .map(item => this.convertShopifyDataToProduct(item.product))
      .filter(Boolean) as ShopifyProduct[];
    
    // Get personalized products
    const personalized = personalizedProducts
      .map(item => this.convertShopifyDataToProduct(item.product))
      .filter(Boolean) as ShopifyProduct[];
    
    // Get new arrivals (products created in last 2 weeks)
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const newArrivals = shopifyProducts
      .filter(product => new Date(product.createdAt) > twoWeeksAgo)
      .slice(0, 8);

    const result = {
      hero,
      featured,
      trending,
      personalized,
      newArrivals
    };

    // Cache the result
    this.cacheResult(cacheKey, [...featured, ...trending, ...personalized, ...newArrivals], 'homepage', 0.9, [
      'AI-optimized homepage layout',
      'Based on user behavior and product performance'
    ]);

    console.log('🤖 [AI Organizer] Homepage organized:', {
      hero: !!hero,
      featured: featured.length,
      trending: trending.length,
      personalized: personalized.length,
      newArrivals: newArrivals.length
    });

    return result;
  }

  /**
   * Organize products for collection pages
   */
  public organizeCollectionProducts(collectionHandle: string, limit: number = 24): ProductOrganizationResult {
    const cacheKey = `collection_${collectionHandle}`;
    const cached = this.getCachedResult(cacheKey);
    
    if (cached) {
      return cached;
    }

    const collectionProducts = shopifyDataContext.getProductsByCollection(collectionHandle);
    const userPreferences = advancedBehaviorTracker.getUserPreferences();
    
    // Convert and score products
    const scoredProducts = collectionProducts
      .map(product => ({
        product: this.convertShopifyDataToProduct(product),
        score: shopifyDataContext.getProductScore(product.id)
      }))
      .filter(item => item.product && item.score)
      .sort((a, b) => b.score!.totalScore - a.score!.totalScore)
      .slice(0, limit);

    const organizedProducts = scoredProducts.map(item => item.product!);
    const avgScore = scoredProducts.reduce((sum, item) => sum + item.score!.totalScore, 0) / scoredProducts.length || 0;

    const result: ProductOrganizationResult = {
      products: organizedProducts,
      strategy: 'ai_collection_optimization',
      confidence: Math.min(0.95, avgScore / 100),
      reasons: [
        `Optimized ${organizedProducts.length} products for collection: ${collectionHandle}`,
        `Average AI score: ${avgScore.toFixed(1)}`,
        `Based on user preferences and behavior patterns`
      ],
      appliedAt: Date.now()
    };

    this.cacheResult(cacheKey, organizedProducts, result.strategy, result.confidence, result.reasons);
    
    console.log('🤖 [AI Organizer] Collection organized:', {
      collection: collectionHandle,
      products: organizedProducts.length,
      avgScore: avgScore.toFixed(1),
      confidence: result.confidence
    });

    return result;
  }

  /**
   * Organize products for all products page
   */
  public organizeAllProducts(limit: number = 48, sortBy: 'score' | 'trending' | 'personalized' = 'score'): ProductOrganizationResult {
    const cacheKey = `all_products_${sortBy}_${limit}`;
    const cached = this.getCachedResult(cacheKey);
    
    if (cached) {
      return cached;
    }

    let organizedProducts: ShopifyProduct[] = [];
    let strategy = '';
    let reasons: string[] = [];

    switch (sortBy) {
      case 'trending':
        const trending = shopifyDataContext.getTrendingProducts(limit);
        organizedProducts = trending.map(item => this.convertShopifyDataToProduct(item.product)).filter(Boolean) as ShopifyProduct[];
        strategy = 'trending_optimization';
        reasons = [`Showing ${organizedProducts.length} trending products`, 'Based on recent engagement and activity'];
        break;
        
      case 'personalized':
        const personalized = shopifyDataContext.getPersonalizedProducts(limit);
        organizedProducts = personalized.map(item => this.convertShopifyDataToProduct(item.product)).filter(Boolean) as ShopifyProduct[];
        strategy = 'personalized_optimization';
        reasons = [`${organizedProducts.length} products personalized for user`, 'Based on browsing history and preferences'];
        break;
        
      default:
        const topScored = shopifyDataContext.getTopScoredProducts(limit);
        organizedProducts = topScored.map(item => this.convertShopifyDataToProduct(item.product)).filter(Boolean) as ShopifyProduct[];
        strategy = 'ai_score_optimization';
        reasons = [`${organizedProducts.length} products optimized by AI`, 'Balancing personalization, trends, and inventory'];
    }

    const result: ProductOrganizationResult = {
      products: organizedProducts,
      strategy,
      confidence: 0.85,
      reasons,
      appliedAt: Date.now()
    };

    this.cacheResult(cacheKey, organizedProducts, result.strategy, result.confidence, result.reasons);
    
    console.log('🤖 [AI Organizer] All products organized:', {
      sortBy,
      products: organizedProducts.length,
      strategy,
      confidence: result.confidence
    });

    return result;
  }

  /**
   * Get organization strategy for a specific context
   */
  public getRecommendedStrategy(context: 'homepage' | 'collection' | 'search' | 'all'): string {
    const userPreferences = advancedBehaviorTracker.getUserPreferences();
    const predictions = advancedBehaviorTracker.getPredictedProducts();
    
    // Determine best strategy based on user data
    if (userPreferences.cart.length > 3 || userPreferences.wishlist.length > 5) {
      return 'high_intent';
    } else if (predictions.length > 5) {
      return 'personalized';
    } else if (userPreferences.searchHistory.length > 3) {
      return 'category_affinity';
    } else {
      return 'trending';
    }
  }

  private convertShopifyDataToProduct(shopifyData: any): ShopifyProduct | null {
    if (!shopifyData) return null;
    
    try {
      return {
        id: shopifyData.id,
        handle: shopifyData.handle,
        title: shopifyData.title,
        description: shopifyData.description || '',
        descriptionHtml: shopifyData.description || '',
        availableForSale: shopifyData.availableForSale,
        createdAt: shopifyData.createdAt,
        updatedAt: shopifyData.updatedAt,
        publishedAt: shopifyData.publishedAt,
        vendor: shopifyData.vendor || '',
        productType: shopifyData.productType || '',
        tags: shopifyData.tags || [],
        priceRange: {
          minVariantPrice: {
            amount: shopifyData.price || '0',
            currencyCode: 'USD'
          },
          maxVariantPrice: {
            amount: shopifyData.price || '0',
            currencyCode: 'USD'
          }
        },
        compareAtPriceRange: shopifyData.compareAtPrice ? {
          minVariantPrice: {
            amount: shopifyData.compareAtPrice,
            currencyCode: 'USD'
          },
          maxVariantPrice: {
            amount: shopifyData.compareAtPrice,
            currencyCode: 'USD'
          }
        } : undefined,
        variants: {
          nodes: shopifyData.variants || []
        },
        images: {
          nodes: shopifyData.images || []
        },
        featuredImage: shopifyData.featuredImage,
        collections: {
          nodes: shopifyData.collections || []
        },
        seo: shopifyData.seo || {},
        options: [],
        metafields: []
      };
    } catch (error) {
      console.warn('🤖 [AI Organizer] Failed to convert product:', error);
      return null;
    }
  }

  private convertShopifyDataToProducts(shopifyDataArray: any[]): ShopifyProduct[] {
    return shopifyDataArray
      .map(data => this.convertShopifyDataToProduct(data))
      .filter(Boolean) as ShopifyProduct[];
  }

  private parseHomepageResult(products: ShopifyProduct[]) {
    return {
      hero: products[0] || null,
      featured: products.slice(1, 9),
      trending: products.slice(9, 21),
      personalized: products.slice(21, 33),
      newArrivals: products.slice(33, 41)
    };
  }

  private getCachedResult(key: string): ProductOrganizationResult | null {
    const cached = this.organizationCache.get(key);
    if (cached && (Date.now() - cached.appliedAt) < this.cacheExpiryMs) {
      return cached;
    }
    this.organizationCache.delete(key);
    return null;
  }

  private cacheResult(key: string, products: ShopifyProduct[], strategy: string, confidence: number, reasons: string[]) {
    this.organizationCache.set(key, {
      products,
      strategy,
      confidence,
      reasons,
      appliedAt: Date.now()
    });
  }

  public clearCache() {
    this.organizationCache.clear();
  }

  public getStrategy(id: string): OrganizationStrategy | undefined {
    return this.strategies.get(id);
  }

  public updateStrategy(id: string, updates: Partial<OrganizationStrategy>) {
    const existing = this.strategies.get(id);
    if (existing) {
      this.strategies.set(id, { ...existing, ...updates });
      this.clearCache(); // Clear cache when strategies change
    }
  }
}

// Export singleton instance
export const aiProductOrganizer = new AIProductOrganizer();
export default aiProductOrganizer;