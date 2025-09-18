"use client";

import { shopifyDataContext } from './shopify-data-context';
import { advancedBehaviorTracker } from './advanced-behavior-tracker';
import type { ShopifyProduct } from '@/lib/types';

export interface FilterContext {
  page: 'collection' | 'search' | 'all-products' | 'home';
  userAppliedFilters: {
    priceRange?: { min: number; max: number };
    categories?: string[];
    brands?: string[];
    sortBy?: string;
  };
  searchQuery?: string;
  collectionHandle?: string;
}

export interface ProductRecommendation {
  product: ShopifyProduct;
  score: number;
  reasons: string[];
  contextualRelevance: number;
  aiConfidence: number;
}

export interface FilteredProductResult {
  products: ProductRecommendation[];
  totalCount: number;
  appliedStrategy: string;
  metadata: {
    aiFiltered: boolean;
    contextualBoosts: string[];
    relatedProducts: string[];
    searchIntent?: any;
  };
}

class AIProductFilter {
  private contextualMappings = {
    // Product relationship mapping for smart recommendations
    'grow-kits': ['spores', 'substrate', 'cultivation-tools', 'liquid-culture'],
    'spores': ['grow-kits', 'substrate', 'sterilization', 'microscopy'],
    'substrate': ['grow-kits', 'spawn', 'sterilization', 'ph-testing'],
    'cultivation-equipment': ['grow-kits', 'substrate', 'sterilization'],
    'wellness-supplements': ['medicinal-mushrooms', 'tinctures', 'extracts'],
    'medicinal': ['wellness-supplements', 'tinctures', 'cultivation-equipment'],
    'culinary': ['grow-kits', 'substrate', 'harvest-tools']
  };

  /**
   * Apply intelligent filtering based on user behavior and context
   */
  public filterProducts(
    allProducts: ShopifyProduct[], 
    context: FilterContext,
    limit: number = 24
  ): FilteredProductResult {
    console.log('🎯 [AI Filter] Starting intelligent product filtering:', {
      totalProducts: allProducts.length,
      context: context.page,
      searchQuery: context.searchQuery,
      limit
    });

    // Get user behavior data
    const userPreferences = advancedBehaviorTracker.getUserPreferences();
    const behaviorData = advancedBehaviorTracker.getBehaviorData();
    const predictions = advancedBehaviorTracker.getPredictedProducts();

    // Step 1: Apply user filters first (mandatory)
    let filteredProducts = this.applyUserFilters(allProducts, context.userAppliedFilters);

    // Step 2: Get AI-scored products
    const scoredProducts = filteredProducts.map(product => {
      const aiScore = shopifyDataContext.getProductScore(product.id);
      const behaviorScore = this.calculateBehaviorScore(product, userPreferences, behaviorData);
      const contextualScore = this.calculateContextualRelevance(product, context, userPreferences);
      
      const totalScore = (aiScore?.totalScore || 0) + behaviorScore + contextualScore;
      
      return {
        product,
        score: Math.round(totalScore * 100) / 100,
        reasons: this.generateRecommendationReasons(product, aiScore, context),
        contextualRelevance: Math.round(contextualScore * 100) / 100,
        aiConfidence: aiScore?.totalScore || 0
      };
    });

    // Step 3: Apply contextual boosting based on user behavior
    const boostedProducts = this.applyContextualBoosting(scoredProducts, context, userPreferences);

    // Step 4: Sort by AI + contextual score unless user specified sorting
    let finalProducts = boostedProducts;
    if (!context.userAppliedFilters.sortBy || context.userAppliedFilters.sortBy === 'recommended') {
      finalProducts = boostedProducts.sort((a, b) => b.score - a.score);
    } else {
      finalProducts = this.applySorting(boostedProducts, context.userAppliedFilters.sortBy);
    }

    // Step 5: Limit results
    const limitedProducts = finalProducts.slice(0, limit);

    // Step 6: Generate metadata
    const metadata = this.generateFilterMetadata(limitedProducts, context, userPreferences);

    console.log('🎯 [AI Filter] Filtering complete:', {
      originalCount: allProducts.length,
      afterUserFilters: filteredProducts.length,
      finalCount: limitedProducts.length,
      avgScore: limitedProducts.reduce((sum, p) => sum + p.score, 0) / limitedProducts.length,
      strategy: metadata.appliedStrategy
    });

    return {
      products: limitedProducts,
      totalCount: filteredProducts.length,
      appliedStrategy: metadata.appliedStrategy,
      metadata: {
        aiFiltered: true,
        contextualBoosts: metadata.contextualBoosts,
        relatedProducts: metadata.relatedProducts,
        searchIntent: context.searchQuery ? this.analyzeSearchIntent(context.searchQuery) : undefined
      }
    };
  }

  /**
   * Apply user-specified filters (price, category, brand, etc.)
   */
  private applyUserFilters(products: ShopifyProduct[], filters: FilterContext['userAppliedFilters']): ShopifyProduct[] {
    let filtered = [...products];

    // Price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(product => {
        const price = parseFloat(product.priceRange?.minVariantPrice?.amount || '0');
        return price >= filters.priceRange!.min && price <= filters.priceRange!.max;
      });
    }

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(product => 
        filters.categories!.some(category => 
          product.productType.toLowerCase().includes(category.toLowerCase()) ||
          product.tags.some(tag => tag.toLowerCase().includes(category.toLowerCase()))
        )
      );
    }

    // Brand filter
    if (filters.brands && filters.brands.length > 0) {
      filtered = filtered.filter(product => 
        filters.brands!.includes(product.vendor)
      );
    }

    return filtered;
  }

  /**
   * Calculate behavioral relevance score for a product
   */
  private calculateBehaviorScore(
    product: ShopifyProduct, 
    userPreferences: any, 
    behaviorData: any
  ): number {
    let score = 0;

    // Category preference matching
    const categoryScore = userPreferences.topCategories?.find(
      ([cat]: [string, number]) => product.productType.toLowerCase().includes(cat.toLowerCase())
    )?.[1] || 0;
    score += categoryScore * 5;

    // Search history relevance
    if (userPreferences.searchHistory?.length > 0) {
      const searchRelevance = userPreferences.searchHistory.some((query: string) =>
        product.title.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.tags.some(tag => tag.toLowerCase().includes(query))
      );
      if (searchRelevance) score += 15;
    }

    // Wishlist/cart signals
    if (userPreferences.wishlist?.includes(product.id)) score += 25;
    if (userPreferences.cart?.includes(product.id)) score += 30;

    // Price range preference
    const price = parseFloat(product.priceRange?.minVariantPrice?.amount || '0');
    if (price >= userPreferences.priceRange?.min && price <= userPreferences.priceRange?.max) {
      score += 10;
    }

    return score;
  }

  /**
   * Calculate contextual relevance based on page context and user journey
   */
  private calculateContextualRelevance(
    product: ShopifyProduct, 
    context: FilterContext, 
    userPreferences: any
  ): number {
    let score = 0;

    // Search context boosting
    if (context.searchQuery) {
      const searchIntent = this.analyzeSearchIntent(context.searchQuery);
      
      // Direct keyword matches
      const queryWords = context.searchQuery.toLowerCase().split(/\s+/);
      queryWords.forEach(word => {
        if (product.title.toLowerCase().includes(word)) score += 20;
        if (product.description.toLowerCase().includes(word)) score += 10;
        if (product.tags.some(tag => tag.toLowerCase().includes(word))) score += 15;
      });

      // Category intent matching
      if (searchIntent.category && product.productType.toLowerCase().includes(searchIntent.category)) {
        score += 25;
      }
    }

    // Collection context boosting
    if (context.collectionHandle) {
      // Products that belong to this collection get base relevance
      const belongsToCollection = product.collections?.nodes?.some(
        collection => collection.handle === context.collectionHandle
      );
      if (belongsToCollection) score += 20;
    }

    // Cross-sell context boosting
    if (userPreferences.cart?.length > 0 || userPreferences.wishlist?.length > 0) {
      const userProducts = [...(userPreferences.cart || []), ...(userPreferences.wishlist || [])];
      const contextualBoost = this.calculateCrossSellRelevance(product, userProducts);
      score += contextualBoost;
    }

    // Page-specific context
    switch (context.page) {
      case 'home':
        // Homepage should prioritize trending and high-scoring products
        const aiScore = shopifyDataContext.getProductScore(product.id);
        if (aiScore && aiScore.trendingScore > 15) score += 15;
        break;
      case 'search':
        // Search pages should prioritize exact matches
        score *= 1.2; // Boost all search relevance
        break;
      case 'collection':
        // Collection pages should show related products
        const collectionBoost = this.getCollectionContextBoost(product, context.collectionHandle || '');
        score += collectionBoost;
        break;
    }

    return score;
  }

  /**
   * Apply contextual boosting based on user's current session
   */
  private applyContextualBoosting(
    products: ProductRecommendation[], 
    context: FilterContext, 
    userPreferences: any
  ): ProductRecommendation[] {
    return products.map(item => {
      let boostMultiplier = 1.0;
      const boostReasons: string[] = [];

      // Recent interaction boosting
      const recentInteractions = advancedBehaviorTracker.getBehaviorData().interactions || [];
      const recentProductTypes = recentInteractions
        .slice(0, 5) // Last 5 interactions
        .map(interaction => {
          const product = shopifyDataContext.getProduct(interaction.productId);
          return product?.productType;
        })
        .filter(Boolean);

      if (recentProductTypes.includes(item.product.productType)) {
        boostMultiplier += 0.3;
        boostReasons.push('Related to recent activity');
      }

      // Cross-sell boosting
      if (userPreferences.cart?.length > 0) {
        const crossSellBoost = this.getCrossSellBoost(item.product, userPreferences.cart);
        if (crossSellBoost > 0) {
          boostMultiplier += crossSellBoost;
          boostReasons.push('Frequently bought together');
        }
      }

      // Inventory urgency boosting
      const stock = item.product.variants?.nodes?.[0]?.quantityAvailable || 0;
      if (stock <= 5 && stock > 0) {
        boostMultiplier += 0.2;
        boostReasons.push('Low stock urgency');
      }

      // Time-sensitive boosting (sales, new arrivals)
      if (item.product.tags.includes('sale') || item.product.tags.includes('clearance')) {
        boostMultiplier += 0.25;
        boostReasons.push('Time-sensitive offer');
      }

      return {
        ...item,
        score: Math.round((item.score * boostMultiplier) * 100) / 100,
        reasons: [...item.reasons, ...boostReasons]
      };
    });
  }

  /**
   * Calculate cross-sell relevance between product and user's current products
   */
  private calculateCrossSellRelevance(product: ShopifyProduct, userProductIds: string[]): number {
    let relevance = 0;

    userProductIds.forEach(productId => {
      const userProduct = shopifyDataContext.getProduct(productId);
      if (!userProduct) return;

      // Check for related categories
      const productCategory = this.normalizeCategory(product.productType);
      const userCategory = this.normalizeCategory(userProduct.productType);
      
      const relatedCategories = this.contextualMappings[userCategory as keyof typeof this.contextualMappings] || [];
      if (relatedCategories.includes(productCategory)) {
        relevance += 20;
      }

      // Check for complementary tags
      const commonTags = product.tags.filter(tag => 
        userProduct.tags.some(userTag => 
          tag.toLowerCase() === userTag.toLowerCase()
        )
      );
      relevance += commonTags.length * 5;
    });

    return Math.min(50, relevance); // Cap at 50 points
  }

  private normalizeCategory(category: string): string {
    const normalized = category.toLowerCase().replace(/\s+/g, '-');
    
    // Map common variations to standard categories
    const mappings: Record<string, string> = {
      'cultivation-equipment': 'grow-kits',
      'grow-supplies': 'grow-kits', 
      'wellness-supplements': 'medicinal',
      'brand-merch': 'merchandise'
    };

    return mappings[normalized] || normalized;
  }

  private getCrossSellBoost(product: ShopifyProduct, cartProductIds: string[]): number {
    // Simplified cross-sell logic - in reality this would use purchase data
    const productPrice = parseFloat(product.priceRange?.minVariantPrice?.amount || '0');
    const cartValue = cartProductIds.length * 25; // Estimate cart value
    
    // Boost complementary products for higher-value carts
    if (cartValue > 100 && productPrice < 50) {
      return 0.4; // Boost accessories for high-value carts
    } else if (cartValue > 50 && productPrice > 20) {
      return 0.2; // Moderate boost for mid-range products
    }
    
    return 0;
  }

  private getCollectionContextBoost(product: ShopifyProduct, collectionHandle: string): number {
    // Collection-specific boosting logic
    const collectionBoosts: Record<string, number> = {
      'grow-supplies': product.productType.toLowerCase().includes('cultivation') ? 15 : 0,
      'medicinal': product.productType.toLowerCase().includes('wellness') ? 15 : 0,
      'culinary': product.productType.toLowerCase().includes('culinary') ? 15 : 0,
      'best-sellers': 10, // General boost for best-sellers collection
      'new-arrivals': 8,  // Boost for new arrivals
      'sale': 12         // Boost for sale collection
    };

    return collectionBoosts[collectionHandle] || 0;
  }

  private applySorting(products: ProductRecommendation[], sortBy: string): ProductRecommendation[] {
    switch (sortBy) {
      case 'price-low-high':
        return products.sort((a, b) => {
          const priceA = parseFloat(a.product.priceRange?.minVariantPrice?.amount || '0');
          const priceB = parseFloat(b.product.priceRange?.minVariantPrice?.amount || '0');
          return priceA - priceB;
        });
      case 'price-high-low':
        return products.sort((a, b) => {
          const priceA = parseFloat(a.product.priceRange?.minVariantPrice?.amount || '0');
          const priceB = parseFloat(b.product.priceRange?.minVariantPrice?.amount || '0');
          return priceB - priceA;
        });
      case 'newest':
        return products.sort((a, b) => 
          new Date(b.product.createdAt).getTime() - new Date(a.product.createdAt).getTime()
        );
      case 'name-a-z':
        return products.sort((a, b) => a.product.title.localeCompare(b.product.title));
      case 'name-z-a':
        return products.sort((a, b) => b.product.title.localeCompare(a.product.title));
      default:
        return products.sort((a, b) => b.score - a.score); // Default to AI score
    }
  }

  private generateRecommendationReasons(product: ShopifyProduct, aiScore: any, context: FilterContext): string[] {
    const reasons: string[] = [];

    if (aiScore?.personalizedScore > 15) {
      reasons.push('Matches your preferences');
    }
    if (aiScore?.trendingScore > 15) {
      reasons.push('Trending product');
    }
    if (aiScore?.marginScore > 10) {
      reasons.push('Great value');
    }
    
    if (context.searchQuery) {
      reasons.push('Matches search criteria');
    }

    const stock = product.variants?.nodes?.[0]?.quantityAvailable || 0;
    if (stock <= 5 && stock > 0) {
      reasons.push('Limited availability');
    }

    return reasons;
  }

  private generateFilterMetadata(
    products: ProductRecommendation[], 
    context: FilterContext, 
    userPreferences: any
  ) {
    const appliedStrategy = context.searchQuery ? 'search-optimized' : 
                          context.collectionHandle ? 'collection-contextual' : 
                          'ai-personalized';

    const contextualBoosts = [];
    if (userPreferences.cart?.length > 0) contextualBoosts.push('cross-sell');
    if (userPreferences.wishlist?.length > 0) contextualBoosts.push('wishlist-related');
    if (context.searchQuery) contextualBoosts.push('search-relevance');

    const relatedProducts = products
      .filter(p => p.contextualRelevance > 10)
      .map(p => p.product.id)
      .slice(0, 5);

    return {
      appliedStrategy,
      contextualBoosts,
      relatedProducts
    };
  }

  private analyzeSearchIntent(query: string) {
    // This would be more sophisticated in a real implementation
    const intent = {
      category: null as string | null,
      intent: 'general' as string,
      keywords: query.toLowerCase().split(/\s+/)
    };

    const categoryMappings = {
      'grow': 'grow-supplies',
      'kit': 'grow-supplies',
      'spore': 'microscopy-use',
      'supplement': 'medicinal',
      'food': 'culinary'
    };

    for (const [keyword, category] of Object.entries(categoryMappings)) {
      if (query.toLowerCase().includes(keyword)) {
        intent.category = category;
        break;
      }
    }

    return intent;
  }

  /**
   * Get recommended products for a specific context
   */
  public getContextualRecommendations(
    productId: string, 
    context: 'product-page' | 'cart' | 'checkout' = 'product-page',
    limit: number = 4
  ): ProductRecommendation[] {
    const allProducts = shopifyDataContext.getAllProducts();
    const currentProduct = shopifyDataContext.getProduct(productId);
    
    if (!currentProduct) return [];

    const recommendations = allProducts
      .filter(p => p.id !== productId) // Exclude current product
      .map(product => {
        const relevanceScore = this.calculateCrossSellRelevance(product, [productId]);
        const aiScore = shopifyDataContext.getProductScore(product.id);
        
        return {
          product,
          score: relevanceScore + (aiScore?.totalScore || 0),
          reasons: [`Related to ${currentProduct.title}`],
          contextualRelevance: relevanceScore,
          aiConfidence: aiScore?.totalScore || 0
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return recommendations;
  }
}

// Export singleton instance
export const aiProductFilter = new AIProductFilter();
export default aiProductFilter;