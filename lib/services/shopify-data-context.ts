"use client";

import { advancedBehaviorTracker } from './advanced-behavior-tracker';
import { aiRecommendationEngine } from './ai-recommendation-engine';

export interface ShopifyProductData {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: string;
  compareAtPrice?: string;
  vendor: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  totalInventory: number;
  featuredImage?: {
    url: string;
    altText?: string;
  };
  images: Array<{
    url: string;
    altText?: string;
  }>;
  variants: Array<{
    id: string;
    title: string;
    price: string;
    availableForSale: boolean;
    quantityAvailable: number;
  }>;
  seo: {
    title?: string;
    description?: string;
  };
  collections: Array<{
    id: string;
    handle: string;
    title: string;
  }>;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface ShopifyCollectionData {
  id: string;
  handle: string;
  title: string;
  description: string;
  image?: {
    url: string;
    altText?: string;
  };
  products: ShopifyProductData[];
  seo: {
    title?: string;
    description?: string;
  };
}

export interface AIProductScore {
  productId: string;
  personalizedScore: number;
  trendingScore: number;
  inventoryScore: number;
  marginScore: number;
  conversionScore: number;
  totalScore: number;
  reasons: string[];
  boosters: string[];
}

class ShopifyDataContext {
  private products: Map<string, ShopifyProductData> = new Map();
  private collections: Map<string, ShopifyCollectionData> = new Map();
  private productScores: Map<string, AIProductScore> = new Map();
  private lastUpdate: number = 0;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Don't initialize immediately, wait for explicit call
      console.log('🛍️ [Shopify Data] Constructor called, waiting for manual initialization');
    }
  }

  private async initialize() {
    await this.loadInitialData();
    this.startPeriodicUpdates();
    this.setupBehaviorListeners();
  }

  private async loadInitialData() {
    try {
      console.log('🛍️ [Shopify Data] Starting to load initial data...');
      
      // Load products
      console.log('🛍️ [Shopify Data] Fetching products...');
      const productsResponse = await fetch('/api/products?limit=250');
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        console.log('🛍️ [Shopify Data] Received products:', productsData.products?.length || 0);
        
        productsData.products?.forEach((product: any) => {
          this.products.set(product.id, this.normalizeProductData(product));
        });
        
        console.log('🛍️ [Shopify Data] Products loaded into memory:', this.products.size);
      } else {
        console.error('🛍️ [Shopify Data] Failed to fetch products:', productsResponse.status);
      }

      // Load collections
      console.log('🛍️ [Shopify Data] Fetching collections...');
      const collectionsResponse = await fetch('/api/collections');
      if (collectionsResponse.ok) {
        const collectionsData = await collectionsResponse.json();
        console.log('🛍️ [Shopify Data] Received collections:', collectionsData.collections?.length || 0);
        
        collectionsData.collections?.forEach((collection: any) => {
          this.collections.set(collection.id, this.normalizeCollectionData(collection));
        });
        
        console.log('🛍️ [Shopify Data] Collections loaded into memory:', this.collections.size);
      } else {
        console.error('🛍️ [Shopify Data] Failed to fetch collections:', collectionsResponse.status);
      }

      // Initial scoring
      console.log('🛍️ [Shopify Data] Calculating initial product scores...');
      this.calculateAllProductScores();
      this.lastUpdate = Date.now();
      
      console.log('🛍️ [Shopify Data] Initial data loading complete!', {
        products: this.products.size,
        collections: this.collections.size,
        scores: this.productScores.size
      });
    } catch (error) {
      console.error('🛍️ [Shopify Data] Failed to load Shopify data:', error);
    }
  }

  private normalizeProductData(rawProduct: any): ShopifyProductData {
    return {
      id: rawProduct.id,
      handle: rawProduct.handle,
      title: rawProduct.title,
      description: rawProduct.description || '',
      price: rawProduct.priceRange?.minVariantPrice?.amount || '0',
      compareAtPrice: rawProduct.compareAtPriceRange?.minVariantPrice?.amount,
      vendor: rawProduct.vendor || '',
      productType: rawProduct.productType || '',
      tags: rawProduct.tags || [],
      availableForSale: rawProduct.availableForSale || false,
      totalInventory: rawProduct.totalInventory || 0,
      featuredImage: rawProduct.featuredImage,
      images: rawProduct.images?.nodes || [],
      variants: rawProduct.variants?.nodes || [],
      seo: rawProduct.seo || {},
      collections: rawProduct.collections?.nodes || [],
      createdAt: rawProduct.createdAt || new Date().toISOString(),
      updatedAt: rawProduct.updatedAt || new Date().toISOString(),
      publishedAt: rawProduct.publishedAt || new Date().toISOString()
    };
  }

  private normalizeCollectionData(rawCollection: any): ShopifyCollectionData {
    return {
      id: rawCollection.id,
      handle: rawCollection.handle,
      title: rawCollection.title,
      description: rawCollection.description || '',
      image: rawCollection.image,
      products: rawCollection.products?.nodes?.map((p: any) => this.normalizeProductData(p)) || [],
      seo: rawCollection.seo || {}
    };
  }

  private startPeriodicUpdates() {
    // Update scores every 30 seconds
    this.updateInterval = setInterval(() => {
      this.calculateAllProductScores();
    }, 30000);
  }

  private setupBehaviorListeners() {
    // Listen for behavior changes and update scores accordingly
    window.addEventListener('behavior-tracked', () => {
      // Debounced score updates
      clearTimeout((window as any).__scoreUpdateTimeout);
      (window as any).__scoreUpdateTimeout = setTimeout(() => {
        this.calculateAllProductScores();
      }, 1000);
    });
  }

  private calculateAllProductScores() {
    try {
      console.log('🛍️ [Shopify Data] Starting product scoring...');
      const userPreferences = advancedBehaviorTracker.getUserPreferences();
      const predictions = advancedBehaviorTracker.getPredictedProducts();
      const highIntentProducts = new Set(advancedBehaviorTracker.getHighIntentProducts());

      console.log('🛍️ [Shopify Data] User data for scoring:', {
        topCategories: userPreferences.topCategories?.length || 0,
        wishlist: userPreferences.wishlist?.length || 0,
        cart: userPreferences.cart?.length || 0,
        predictions: predictions?.length || 0,
        highIntent: highIntentProducts.size
      });

      let scoredCount = 0;
      this.products.forEach((product, productId) => {
        const score = this.calculateProductScore(product, userPreferences, predictions, highIntentProducts);
        this.productScores.set(productId, score);
        scoredCount++;
      });

      console.log('🛍️ [Shopify Data] Product scoring complete:', {
        totalProducts: this.products.size,
        scoredProducts: scoredCount,
        topScore: Math.max(...Array.from(this.productScores.values()).map(s => s.totalScore))
      });

      // Emit update event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('shopify-data-updated', {
          detail: {
            totalProducts: this.products.size,
            topScoredProducts: this.getTopScoredProducts(10),
            userSegment: this.getUserSegment()
          }
        }));
        console.log('🛍️ [Shopify Data] Emitted shopify-data-updated event');
      }
    } catch (error) {
      console.error('🛍️ [Shopify Data] Error calculating product scores:', error);
    }
  }

  private calculateProductScore(
    product: ShopifyProductData,
    userPreferences: any,
    predictions: any[],
    highIntentProducts: Set<string>
  ): AIProductScore {
    let personalizedScore = 0;
    let trendingScore = 0;
    let inventoryScore = 0;
    let marginScore = 0;
    let conversionScore = 0;
    const reasons: string[] = [];
    const boosters: string[] = [];

    const price = parseFloat(product.price) || 0;
    const compareAtPrice = parseFloat(product.compareAtPrice || '0');

    // Enhanced Personalized Score (0-35 points) - More weight for business impact
    const userCategories = new Map(userPreferences.topCategories);
    if (userCategories.has(product.productType)) {
      const categoryScore = userCategories.get(product.productType) || 0;
      const categoryWeight = Math.min(25.00, categoryScore * 3.5);
      personalizedScore += categoryWeight;
      reasons.push(`Customer prefers ${product.productType} (+${categoryWeight.toFixed(2)})`);
    }

    // Wishlist indicates strong purchase intent
    if (userPreferences.wishlist.includes(product.id)) {
      personalizedScore += 20.00;
      boosters.push('High intent: Wishlisted');
      reasons.push('Strong purchase signal from wishlist');
    }

    // Cart items are hot leads
    if (userPreferences.cart.includes(product.id)) {
      personalizedScore += 10.00;
      boosters.push('Active consideration');
      reasons.push('Product in customer cart');
    }

    // Price preference matching (business critical)
    if (!isNaN(price) && price >= userPreferences.priceRange.min && price <= userPreferences.priceRange.max) {
      personalizedScore += 8.00;
      reasons.push(`Price fits customer budget ($${price.toFixed(2)})`);
    }

    // Enhanced Trending Score (0-30 points) - Focus on business velocity
    const isNewProduct = new Date(product.createdAt) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    if (isNewProduct) {
      trendingScore += 15.00;
      boosters.push('New arrival');
      reasons.push('Recently launched product');
    }

    // High conversion intent multiplier
    if (highIntentProducts.has(product.id)) {
      trendingScore += 20.00;
      boosters.push('Hot prospect');
      reasons.push('AI predicts high conversion probability');
    }

    // Business performance indicators
    const performanceTags = ['bestseller', 'popular', 'featured', 'trending', 'staff-pick'];
    const matchedTags = product.tags.filter(tag => performanceTags.includes(tag.toLowerCase()));
    if (matchedTags.length > 0) {
      const tagBoost = Math.min(12.00, matchedTags.length * 4);
      trendingScore += tagBoost;
      boosters.push(`${matchedTags.join(', ')}`);
      reasons.push(`Proven performer: ${matchedTags.join(', ')}`);
    }

    // Seasonal/promotional boost
    const promoTags = ['sale', 'clearance', 'limited-time', 'holiday'];
    if (product.tags.some(tag => promoTags.includes(tag.toLowerCase()))) {
      trendingScore += 8.00;
      boosters.push('Time-sensitive offer');
    }

    // Enhanced Inventory Score (0-20 points) - Critical for business operations
    if (product.availableForSale) {
      inventoryScore += 15.00;
      
      if (product.totalInventory > 0) {
        // Scarcity creates urgency
        if (product.totalInventory <= 3) {
          inventoryScore += 10.00;
          boosters.push(`Only ${product.totalInventory} left`);
          reasons.push('Scarcity drives urgency');
        } else if (product.totalInventory <= 10) {
          inventoryScore += 7.00;
          boosters.push('Low stock');
          reasons.push('Limited availability creates urgency');
        } else if (product.totalInventory >= 100) {
          inventoryScore += 5.00;
          reasons.push('Strong stock position');
        }
      }
    } else {
      // Penalize out of stock
      inventoryScore = -5.00;
      reasons.push('Out of stock - revenue opportunity lost');
    }

    // Enhanced Margin Score (0-25 points) - Critical for profitability
    let estimatedMargin = 0;
    
    if (compareAtPrice > price && price > 0) {
      const discountPercent = ((compareAtPrice - price) / compareAtPrice) * 100;
      // Assume 40% base margin, reduced by discount
      estimatedMargin = Math.max(10, 40 - (discountPercent * 0.6));
      marginScore += Math.min(15.00, discountPercent * 0.3);
      boosters.push(`${discountPercent.toFixed(0)}% off`);
      reasons.push(`Sale drives conversion (${discountPercent.toFixed(0)}% discount)`);
    } else {
      // Estimate margin based on price tiers
      if (price >= 100) {
        estimatedMargin = 45; // Premium products typically higher margin
        marginScore += 12.00;
        reasons.push('Premium pricing tier');
      } else if (price >= 50) {
        estimatedMargin = 35;
        marginScore += 8.00;
        reasons.push('Mid-tier product');
      } else if (price >= 20) {
        estimatedMargin = 25;
        marginScore += 5.00;
      } else if (price > 0) {
        estimatedMargin = 15; // Low price items often lower margin
        marginScore += 2.00;
      }
    }

    // Business category adjustments
    const highMarginCategories = ['wellness supplements', 'brand merch', 'cultivation equipment'];
    if (highMarginCategories.some(cat => product.productType.toLowerCase().includes(cat))) {
      marginScore += 8.00;
      reasons.push('High-margin product category');
    }

    // Enhanced Conversion Score (0-15 points) - Predictive business intelligence
    const prediction = predictions.find(p => p.productId === product.id);
    if (prediction) {
      const conversionBoost = Math.min(15.00, prediction.score * 0.15);
      conversionScore += conversionBoost;
      reasons.push(`AI conversion confidence: ${(prediction.score).toFixed(0)}%`);
      
      if (prediction.prediction === 'purchase') {
        conversionScore += 5.00;
        boosters.push('Purchase predicted');
      } else if (prediction.prediction === 'cart') {
        conversionScore += 3.00;
        boosters.push('Cart add likely');
      }
    }

    // Customer lifetime value indicators
    const bundleTags = ['bundle', 'kit', 'set', 'collection'];
    if (product.tags.some(tag => bundleTags.includes(tag.toLowerCase()))) {
      conversionScore += 4.00;
      reasons.push('Bundle increases order value');
    }

    // Calculate final weighted score with business impact multipliers
    const baseScore = personalizedScore + trendingScore + inventoryScore + marginScore + conversionScore;
    
    // Apply business multipliers
    let businessMultiplier = 1.0;
    
    // Revenue potential multiplier
    if (price >= 100) businessMultiplier += 0.2; // High-value items
    if (price >= 25 && price < 100) businessMultiplier += 0.1; // Mid-value sweet spot
    
    // Margin health multiplier
    if (estimatedMargin >= 40) businessMultiplier += 0.15;
    if (estimatedMargin >= 25) businessMultiplier += 0.1;
    
    const totalScore = Math.round((baseScore * businessMultiplier) * 100) / 100;

    return {
      productId: product.id,
      personalizedScore: Math.round(personalizedScore * 100) / 100,
      trendingScore: Math.round(trendingScore * 100) / 100,
      inventoryScore: Math.round(inventoryScore * 100) / 100,
      marginScore: Math.round(marginScore * 100) / 100,
      conversionScore: Math.round(conversionScore * 100) / 100,
      totalScore,
      reasons,
      boosters
    };
  }

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

  // Public API methods
  public getProduct(id: string): ShopifyProductData | undefined {
    return this.products.get(id);
  }

  public getCollection(id: string): ShopifyCollectionData | undefined {
    return this.collections.get(id);
  }

  public getAllProducts(): ShopifyProductData[] {
    return Array.from(this.products.values());
  }

  public getAllCollections(): ShopifyCollectionData[] {
    return Array.from(this.collections.values());
  }

  public getProductScore(productId: string): AIProductScore | undefined {
    return this.productScores.get(productId);
  }

  public getTopScoredProducts(limit: number = 10): Array<{ product: ShopifyProductData; score: AIProductScore }> {
    return Array.from(this.productScores.entries())
      .map(([productId, score]) => ({
        product: this.products.get(productId)!,
        score
      }))
      .filter(item => item.product)
      .sort((a, b) => b.score.totalScore - a.score.totalScore)
      .slice(0, limit);
  }

  public getProductsByCollection(collectionHandle: string): ShopifyProductData[] {
    const collection = Array.from(this.collections.values())
      .find(c => c.handle === collectionHandle);
    
    return collection?.products || [];
  }

  public searchProducts(query: string, limit: number = 20): ShopifyProductData[] {
    const searchTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
    
    return Array.from(this.products.values())
      .filter(product => {
        const searchableText = [
          product.title,
          product.description,
          product.vendor,
          product.productType,
          ...product.tags
        ].join(' ').toLowerCase();
        
        return searchTerms.some(term => searchableText.includes(term));
      })
      .slice(0, limit);
  }

  public getPersonalizedProducts(limit: number = 20): Array<{ product: ShopifyProductData; score: AIProductScore }> {
    return this.getTopScoredProducts(limit)
      .filter(item => item.score.personalizedScore > 10);
  }

  public getTrendingProducts(limit: number = 20): Array<{ product: ShopifyProductData; score: AIProductScore }> {
    return Array.from(this.productScores.entries())
      .map(([productId, score]) => ({
        product: this.products.get(productId)!,
        score
      }))
      .filter(item => item.product && item.score.trendingScore > 15)
      .sort((a, b) => b.score.trendingScore - a.score.trendingScore)
      .slice(0, limit);
  }

  public getLowStockProducts(): Array<{ product: ShopifyProductData; score: AIProductScore }> {
    return Array.from(this.products.values())
      .filter(product => product.availableForSale && product.totalInventory < 10 && product.totalInventory > 0)
      .map(product => ({
        product,
        score: this.productScores.get(product.id)!
      }))
      .filter(item => item.score)
      .sort((a, b) => a.product.totalInventory - b.product.totalInventory);
  }

  public getHighMarginProducts(limit: number = 20): Array<{ product: ShopifyProductData; score: AIProductScore }> {
    return Array.from(this.productScores.entries())
      .map(([productId, score]) => ({
        product: this.products.get(productId)!,
        score
      }))
      .filter(item => item.product && item.score.marginScore > 5)
      .sort((a, b) => b.score.marginScore - a.score.marginScore)
      .slice(0, limit);
  }

  public getProductsForHomepage(): {
    hero: ShopifyProductData;
    featured: ShopifyProductData[];
    trending: ShopifyProductData[];
    personalized: ShopifyProductData[];
    newArrivals: ShopifyProductData[];
  } {
    const topScored = this.getTopScoredProducts(50);
    const trending = this.getTrendingProducts(10);
    const personalized = this.getPersonalizedProducts(8);
    
    return {
      hero: topScored[0]?.product || this.getAllProducts()[0],
      featured: topScored.slice(0, 6).map(item => item.product),
      trending: trending.map(item => item.product),
      personalized: personalized.map(item => item.product),
      newArrivals: this.getAllProducts()
        .filter(p => new Date(p.createdAt) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000))
        .slice(0, 8)
    };
  }

  // Public method to manually initialize the data context
  public async forceInitialize(): Promise<void> {
    console.log('🛍️ [Shopify Data] Force initialization called');
    if (typeof window !== 'undefined') {
      await this.initialize();
    }
  }

  public cleanup() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}

// Export singleton instance
export const shopifyDataContext = new ShopifyDataContext();
export default shopifyDataContext;