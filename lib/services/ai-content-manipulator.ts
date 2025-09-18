"use client";

import { shopifyDataContext, type ShopifyProductData, type AIProductScore } from './shopify-data-context';
import { advancedBehaviorTracker } from './advanced-behavior-tracker';
import { conversionOptimizer } from './conversion-optimizer';

export interface ContentManipulation {
  id: string;
  type: 'reorder' | 'promote' | 'hide' | 'highlight' | 'rearrange';
  target: string; // element selector or product ID
  reason: string;
  confidence: number;
  expectedImpact: number;
  applied: boolean;
  timestamp: number;
}

export interface ComponentArrangement {
  componentId: string;
  originalPosition: number;
  newPosition: number;
  reasoning: string;
  weight: number;
}

export interface ProductReorderRule {
  id: string;
  name: string;
  algorithm: (products: ShopifyProductData[], scores: Map<string, AIProductScore>) => ShopifyProductData[];
  weight: number;
  conditions: (userSegment: string, behavior: any) => boolean;
  subtlety: 'low' | 'medium' | 'high'; // How noticeable the change is
}

class AIContentManipulator {
  private activeManipulations: Map<string, ContentManipulation> = new Map();
  private reorderRules: ProductReorderRule[] = [];
  private componentArrangements: Map<string, ComponentArrangement[]> = new Map();
  private lastManipulation: number = 0;
  private subtletyMode: 'aggressive' | 'balanced' | 'subtle' = 'balanced';

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private initialize() {
    this.setupReorderRules();
    this.startContentOptimization();
    this.setupEventListeners();
  }

  private setupReorderRules() {
    this.reorderRules = [
      {
        id: 'personalized-boost',
        name: 'Personalized Product Boost',
        algorithm: this.personalizedBoostAlgorithm.bind(this),
        weight: 0.4,
        conditions: (segment) => segment !== 'new',
        subtlety: 'high'
      },
      {
        id: 'conversion-urgency',
        name: 'Conversion Urgency Reorder',
        algorithm: this.conversionUrgencyAlgorithm.bind(this),
        weight: 0.3,
        conditions: (segment, behavior) => behavior.cartItems > 0 || behavior.highIntent,
        subtlety: 'medium'
      },
      {
        id: 'inventory-priority',
        name: 'Inventory Management Priority',
        algorithm: this.inventoryPriorityAlgorithm.bind(this),
        weight: 0.2,
        conditions: () => true,
        subtlety: 'high'
      },
      {
        id: 'margin-optimization',
        name: 'Margin Optimization',
        algorithm: this.marginOptimizationAlgorithm.bind(this),
        weight: 0.15,
        conditions: (segment) => segment === 'high-value' || segment === 'loyal',
        subtlety: 'high'
      },
      {
        id: 'trending-boost',
        name: 'Trending Products Boost',
        algorithm: this.trendingBoostAlgorithm.bind(this),
        weight: 0.25,
        conditions: (segment) => segment === 'new' || segment === 'returning',
        subtlety: 'medium'
      },
      {
        id: 'cross-sell-optimization',
        name: 'Cross-sell Optimization',
        algorithm: this.crossSellAlgorithm.bind(this),
        weight: 0.35,
        conditions: (segment, behavior) => behavior.cartItems > 0,
        subtlety: 'medium'
      }
    ];
  }

  private startContentOptimization() {
    // Run optimization every 15 seconds
    setInterval(() => {
      this.optimizeContent();
    }, 15000);

    // Initial optimization
    setTimeout(() => this.optimizeContent(), 2000);
  }

  private setupEventListeners() {
    // Listen for behavior changes
    window.addEventListener('behavior-tracked', () => {
      // Debounced content optimization
      clearTimeout((window as any).__contentOptimizationTimeout);
      (window as any).__contentOptimizationTimeout = setTimeout(() => {
        this.optimizeContent();
      }, 3000);
    });

    // Listen for Shopify data updates
    window.addEventListener('shopify-data-updated', () => {
      this.optimizeContent();
    });
  }

  private async optimizeContent() {
    const currentPath = window.location.pathname;
    const userSegment = this.getUserSegment();
    const behaviorData = this.getBehaviorData();

    // Don't manipulate too frequently
    if (Date.now() - this.lastManipulation < 10000) {
      return;
    }

    try {
      if (currentPath === '/') {
        await this.optimizeHomepage(userSegment, behaviorData);
      } else if (currentPath.includes('/products/')) {
        await this.optimizeProductPage(userSegment, behaviorData);
      } else if (currentPath.includes('/collections/')) {
        await this.optimizeCollectionPage(userSegment, behaviorData);
      } else if (currentPath.includes('/search')) {
        await this.optimizeSearchPage(userSegment, behaviorData);
      }

      this.lastManipulation = Date.now();
    } catch (error) {
      console.error('Content optimization error:', error);
    }
  }

  private async optimizeHomepage(userSegment: string, behaviorData: any) {
    const homepageData = shopifyDataContext.getProductsForHomepage();
    
    // Rearrange homepage sections based on user behavior
    const sectionArrangement = this.calculateHomepageSectionOrder(userSegment, behaviorData);
    this.applyComponentArrangement('homepage', sectionArrangement);

    // Reorder featured products
    const reorderedFeatured = this.applyReorderRules(homepageData.featured, userSegment, behaviorData);
    this.applyProductReorder('featured-products', reorderedFeatured, 'Optimized for your interests');

    // Optimize trending section
    const reorderedTrending = this.applyReorderRules(homepageData.trending, userSegment, behaviorData);
    this.applyProductReorder('trending-products', reorderedTrending, 'Trending products personalized');
  }

  private async optimizeProductPage(userSegment: string, behaviorData: any) {
    // Get related products and optimize their order
    const productId = this.extractProductIdFromPath();
    if (!productId) return;

    const relatedProducts = this.getRelatedProducts(productId);
    const reorderedRelated = this.applyReorderRules(relatedProducts, userSegment, behaviorData);
    
    this.applyProductReorder('related-products', reorderedRelated, 'Curated recommendations');
    
    // Optimize upsell products
    const upsellProducts = this.getUpsellProducts(productId);
    const reorderedUpsell = this.applyReorderRules(upsellProducts, userSegment, behaviorData);
    
    this.applyProductReorder('upsell-products', reorderedUpsell, 'Perfect upgrades');
  }

  private async optimizeCollectionPage(userSegment: string, behaviorData: any) {
    const collectionHandle = this.extractCollectionHandleFromPath();
    if (!collectionHandle) return;

    const products = shopifyDataContext.getProductsByCollection(collectionHandle);
    const reorderedProducts = this.applyReorderRules(products, userSegment, behaviorData);
    
    this.applyProductReorder('collection-products', reorderedProducts, 'Optimized collection view');
  }

  private async optimizeSearchPage(userSegment: string, behaviorData: any) {
    // This would integrate with the search provider to reorder search results
    // Implementation depends on how search results are structured
  }

  private calculateHomepageSectionOrder(userSegment: string, behaviorData: any): ComponentArrangement[] {
    const arrangements: ComponentArrangement[] = [];
    let position = 0;

    // Default order: hero, featured, trending, personalized, best-sellers, new-arrivals
    const sections = [
      { id: 'hero', weight: 100 },
      { id: 'featured', weight: 80 },
      { id: 'trending', weight: 60 },
      { id: 'personalized', weight: 70 },
      { id: 'best-sellers', weight: 65 },
      { id: 'new-arrivals', weight: 50 }
    ];

    // Adjust weights based on user segment and behavior
    sections.forEach(section => {
      let adjustedWeight = section.weight;

      switch (userSegment) {
        case 'new':
          if (section.id === 'trending') adjustedWeight += 20;
          if (section.id === 'featured') adjustedWeight += 15;
          if (section.id === 'personalized') adjustedWeight -= 10;
          break;
        case 'returning':
          if (section.id === 'personalized') adjustedWeight += 25;
          if (section.id === 'new-arrivals') adjustedWeight += 10;
          break;
        case 'loyal':
          if (section.id === 'personalized') adjustedWeight += 30;
          if (section.id === 'new-arrivals') adjustedWeight += 15;
          if (section.id === 'trending') adjustedWeight -= 5;
          break;
        case 'high-value':
          if (section.id === 'personalized') adjustedWeight += 35;
          if (section.id === 'best-sellers') adjustedWeight += 20;
          break;
      }

      // Behavior adjustments
      if (behaviorData.cartItems > 0) {
        if (section.id === 'trending') adjustedWeight += 10;
      }
      if (behaviorData.wishlistItems > 3) {
        if (section.id === 'personalized') adjustedWeight += 15;
      }

      arrangements.push({
        componentId: section.id,
        originalPosition: sections.indexOf(section),
        newPosition: position++,
        reasoning: `Optimized for ${userSegment} user`,
        weight: adjustedWeight
      });
    });

    // Sort by weight and assign new positions
    arrangements.sort((a, b) => b.weight - a.weight);
    arrangements.forEach((arr, index) => {
      arr.newPosition = index;
    });

    return arrangements;
  }

  private applyReorderRules(
    products: ShopifyProductData[], 
    userSegment: string, 
    behaviorData: any
  ): ShopifyProductData[] {
    if (products.length === 0) return products;

    let reorderedProducts = [...products];
    const scores = new Map<string, AIProductScore>();
    
    // Get scores for all products
    products.forEach(product => {
      const score = shopifyDataContext.getProductScore(product.id);
      if (score) {
        scores.set(product.id, score);
      }
    });

    // Apply each rule based on conditions and weights
    this.reorderRules.forEach(rule => {
      if (rule.conditions(userSegment, behaviorData)) {
        const ruleResult = rule.algorithm(reorderedProducts, scores);
        
        // Blend with existing order based on weight
        reorderedProducts = this.blendProductOrders(reorderedProducts, ruleResult, rule.weight, rule.subtlety);
      }
    });

    return reorderedProducts;
  }

  private blendProductOrders(
    current: ShopifyProductData[], 
    proposed: ShopifyProductData[], 
    weight: number,
    subtlety: 'low' | 'medium' | 'high'
  ): ShopifyProductData[] {
    // Adjust weight based on subtlety mode
    let adjustedWeight = weight;
    
    switch (this.subtletyMode) {
      case 'aggressive':
        adjustedWeight = Math.min(1, weight * 1.5);
        break;
      case 'balanced':
        adjustedWeight = weight;
        break;
      case 'subtle':
        adjustedWeight = weight * 0.7;
        break;
    }

    // Further adjust based on rule subtlety
    switch (subtlety) {
      case 'low':
        adjustedWeight *= 0.6;
        break;
      case 'medium':
        adjustedWeight *= 0.8;
        break;
      case 'high':
        adjustedWeight *= 1.0;
        break;
    }

    // Create a blended order
    const result: ShopifyProductData[] = [];
    const used = new Set<string>();

    for (let i = 0; i < Math.max(current.length, proposed.length); i++) {
      // Probabilistically choose from current or proposed order
      const useProposed = Math.random() < adjustedWeight;
      
      if (useProposed && i < proposed.length && !used.has(proposed[i].id)) {
        result.push(proposed[i]);
        used.add(proposed[i].id);
      } else if (i < current.length && !used.has(current[i].id)) {
        result.push(current[i]);
        used.add(current[i].id);
      }
    }

    // Add any remaining products
    current.forEach(product => {
      if (!used.has(product.id)) {
        result.push(product);
      }
    });

    return result;
  }

  // Reorder algorithm implementations
  private personalizedBoostAlgorithm(products: ShopifyProductData[], scores: Map<string, AIProductScore>): ShopifyProductData[] {
    return products
      .slice()
      .sort((a, b) => {
        const scoreA = scores.get(a.id)?.personalizedScore || 0;
        const scoreB = scores.get(b.id)?.personalizedScore || 0;
        return scoreB - scoreA;
      });
  }

  private conversionUrgencyAlgorithm(products: ShopifyProductData[], scores: Map<string, AIProductScore>): ShopifyProductData[] {
    const highIntentProducts = new Set(advancedBehaviorTracker.getHighIntentProducts());
    
    return products
      .slice()
      .sort((a, b) => {
        const aHighIntent = highIntentProducts.has(a.id) ? 1000 : 0;
        const bHighIntent = highIntentProducts.has(b.id) ? 1000 : 0;
        const scoreA = (scores.get(a.id)?.conversionScore || 0) + aHighIntent;
        const scoreB = (scores.get(b.id)?.conversionScore || 0) + bHighIntent;
        return scoreB - scoreA;
      });
  }

  private inventoryPriorityAlgorithm(products: ShopifyProductData[], scores: Map<string, AIProductScore>): ShopifyProductData[] {
    return products
      .slice()
      .sort((a, b) => {
        const scoreA = scores.get(a.id)?.inventoryScore || 0;
        const scoreB = scores.get(b.id)?.inventoryScore || 0;
        
        // Boost low stock items
        const aLowStock = a.totalInventory < 10 && a.totalInventory > 0 ? 50 : 0;
        const bLowStock = b.totalInventory < 10 && b.totalInventory > 0 ? 50 : 0;
        
        return (scoreB + bLowStock) - (scoreA + aLowStock);
      });
  }

  private marginOptimizationAlgorithm(products: ShopifyProductData[], scores: Map<string, AIProductScore>): ShopifyProductData[] {
    return products
      .slice()
      .sort((a, b) => {
        const scoreA = scores.get(a.id)?.marginScore || 0;
        const scoreB = scores.get(b.id)?.marginScore || 0;
        return scoreB - scoreA;
      });
  }

  private trendingBoostAlgorithm(products: ShopifyProductData[], scores: Map<string, AIProductScore>): ShopifyProductData[] {
    return products
      .slice()
      .sort((a, b) => {
        const scoreA = scores.get(a.id)?.trendingScore || 0;
        const scoreB = scores.get(b.id)?.trendingScore || 0;
        return scoreB - scoreA;
      });
  }

  private crossSellAlgorithm(products: ShopifyProductData[], scores: Map<string, AIProductScore>): ShopifyProductData[] {
    const userPreferences = advancedBehaviorTracker.getUserPreferences();
    const cartItems = userPreferences.cart;
    
    if (cartItems.length === 0) return products;

    return products
      .slice()
      .sort((a, b) => {
        // Boost products that complement cart items
        const aComplement = this.calculateComplementScore(a, cartItems);
        const bComplement = this.calculateComplementScore(b, cartItems);
        
        return bComplement - aComplement;
      });
  }

  private calculateComplementScore(product: ShopifyProductData, cartItems: string[]): number {
    let score = 0;
    
    // Simple complement logic - products in same category or with similar tags
    cartItems.forEach(cartItemId => {
      const cartProduct = shopifyDataContext.getProduct(cartItemId);
      if (cartProduct) {
        // Same product type
        if (product.productType === cartProduct.productType) {
          score += 10;
        }
        
        // Similar tags
        const commonTags = product.tags.filter(tag => cartProduct.tags.includes(tag));
        score += commonTags.length * 5;
        
        // Price range compatibility
        const priceA = parseFloat(product.price);
        const priceB = parseFloat(cartProduct.price);
        if (!isNaN(priceA) && !isNaN(priceB)) {
          const priceDiff = Math.abs(priceA - priceB) / Math.max(priceA, priceB);
          if (priceDiff < 0.5) {
            score += 15; // Similar price range
          }
        }
      }
    });
    
    return score;
  }

  // Application methods
  private applyComponentArrangement(pageId: string, arrangements: ComponentArrangement[]) {
    this.componentArrangements.set(pageId, arrangements);
    
    // Emit event for UI components to react
    window.dispatchEvent(new CustomEvent('component-arrangement-changed', {
      detail: {
        pageId,
        arrangements,
        reason: 'AI optimization'
      }
    }));
  }

  private applyProductReorder(sectionId: string, products: ShopifyProductData[], reason: string) {
    const manipulation: ContentManipulation = {
      id: `${sectionId}-reorder-${Date.now()}`,
      type: 'reorder',
      target: sectionId,
      reason,
      confidence: 85,
      expectedImpact: 12,
      applied: true,
      timestamp: Date.now()
    };

    this.activeManipulations.set(manipulation.id, manipulation);

    // Emit event for UI components
    window.dispatchEvent(new CustomEvent('product-reorder-applied', {
      detail: {
        sectionId,
        products: products.slice(0, 20), // Limit for performance
        manipulation,
        reason
      }
    }));
  }

  // Utility methods
  private getUserSegment(): string {
    const userPreferences = advancedBehaviorTracker.getUserPreferences();
    const predictions = advancedBehaviorTracker.getPredictedProducts();
    
    if (userPreferences.cart.length > 5 || userPreferences.wishlist.length > 10) {
      return 'high-value';
    } else if (predictions.length > 5) {
      return 'loyal';
    } else if (userPreferences.searchHistory.length > 3) {
      return 'returning';
    } else {
      return 'new';
    }
  }

  private getBehaviorData() {
    const userPreferences = advancedBehaviorTracker.getUserPreferences();
    const predictions = advancedBehaviorTracker.getPredictedProducts();
    const highIntentProducts = advancedBehaviorTracker.getHighIntentProducts();
    
    return {
      cartItems: userPreferences.cart.length,
      wishlistItems: userPreferences.wishlist.length,
      searchCount: userPreferences.searchHistory.length,
      predictions: predictions.length,
      highIntent: highIntentProducts.length > 0,
      topCategory: userPreferences.topCategories[0]?.[0]
    };
  }

  private extractProductIdFromPath(): string | null {
    const match = window.location.pathname.match(/\/products\/([^\/]+)/);
    return match ? match[1] : null;
  }

  private extractCollectionHandleFromPath(): string | null {
    const match = window.location.pathname.match(/\/collections\/([^\/]+)/);
    return match ? match[1] : null;
  }

  private getRelatedProducts(productId: string): ShopifyProductData[] {
    const product = shopifyDataContext.getProduct(productId);
    if (!product) return [];

    // Get products from same collection or category
    return shopifyDataContext.getAllProducts()
      .filter(p => p.id !== productId && 
                  (p.productType === product.productType || 
                   p.collections.some(c => product.collections.some(pc => pc.id === c.id))))
      .slice(0, 12);
  }

  private getUpsellProducts(productId: string): ShopifyProductData[] {
    const product = shopifyDataContext.getProduct(productId);
    if (!product) return [];

    const currentPrice = parseFloat(product.price);
    
    // Get higher-priced products in same category
    return shopifyDataContext.getAllProducts()
      .filter(p => {
        const price = parseFloat(p.price);
        return p.id !== productId && 
               p.productType === product.productType && 
               !isNaN(price) && 
               price > currentPrice && 
               price < currentPrice * 2;
      })
      .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
      .slice(0, 6);
  }

  // Public API methods
  public setSubtletyMode(mode: 'aggressive' | 'balanced' | 'subtle') {
    this.subtletyMode = mode;
  }

  public getActiveManipulations(): ContentManipulation[] {
    return Array.from(this.activeManipulations.values())
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  public getComponentArrangement(pageId: string): ComponentArrangement[] {
    return this.componentArrangements.get(pageId) || [];
  }

  public forceOptimization() {
    this.lastManipulation = 0;
    this.optimizeContent();
  }

  public getOptimizationStats() {
    const total = this.activeManipulations.size;
    const byType = new Map<string, number>();
    
    this.activeManipulations.forEach(manipulation => {
      byType.set(manipulation.type, (byType.get(manipulation.type) || 0) + 1);
    });

    return {
      totalManipulations: total,
      byType: Object.fromEntries(byType),
      subtletyMode: this.subtletyMode,
      lastOptimization: this.lastManipulation
    };
  }
}

// Export singleton instance
export const aiContentManipulator = new AIContentManipulator();
export default aiContentManipulator;