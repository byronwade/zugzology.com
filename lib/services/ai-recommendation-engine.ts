"use client";

import { advancedBehaviorTracker } from './advanced-behavior-tracker';
import { predictivePrefetcher } from './predictive-prefetcher';

export interface ProductRecommendation {
  productId: string;
  score: number;
  reason: string;
  type: 'personalized' | 'trending' | 'similar' | 'complementary' | 'upsell' | 'cross-sell';
  confidence: number;
  predictedCTR: number;
  predictedConversion: number;
}

export interface RecommendationContext {
  currentProduct?: string;
  currentCategory?: string;
  cartItems?: string[];
  wishlistItems?: string[];
  searchQuery?: string;
  pageType: 'home' | 'product' | 'category' | 'search' | 'cart' | 'checkout';
}

class AIRecommendationEngine {
  private recommendationCache: Map<string, ProductRecommendation[]> = new Map();
  private userSegment: 'new' | 'returning' | 'loyal' | 'high-value' = 'new';
  private conversionModels: Map<string, any> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private initialize() {
    this.determineUserSegment();
    this.startRecommendationUpdates();
  }

  private determineUserSegment() {
    const behaviorData = advancedBehaviorTracker.getUserPreferences();
    const predictions = advancedBehaviorTracker.getPredictedProducts();
    
    // Determine segment based on behavior
    if (behaviorData.cart.length > 5 || behaviorData.wishlist.length > 10) {
      this.userSegment = 'high-value';
    } else if (predictions.length > 5) {
      this.userSegment = 'loyal';
    } else if (behaviorData.searchHistory.length > 3) {
      this.userSegment = 'returning';
    } else {
      this.userSegment = 'new';
    }
  }

  private startRecommendationUpdates() {
    // Update recommendations periodically based on new behavior
    setInterval(() => {
      this.recommendationCache.clear();
      this.determineUserSegment();
    }, 30000); // Every 30 seconds
  }

  public async getRecommendations(
    context: RecommendationContext,
    limit: number = 10
  ): Promise<ProductRecommendation[]> {
    const cacheKey = this.getCacheKey(context);
    
    // Check cache first
    if (this.recommendationCache.has(cacheKey)) {
      const cached = this.recommendationCache.get(cacheKey);
      if (cached) return cached.slice(0, limit);
    }
    
    // Generate recommendations based on context
    let recommendations: ProductRecommendation[] = [];
    
    switch (context.pageType) {
      case 'home':
        recommendations = await this.getHomePageRecommendations();
        break;
      case 'product':
        recommendations = await this.getProductPageRecommendations(context.currentProduct);
        break;
      case 'category':
        recommendations = await this.getCategoryRecommendations(context.currentCategory);
        break;
      case 'search':
        recommendations = await this.getSearchRecommendations(context.searchQuery);
        break;
      case 'cart':
        recommendations = await this.getCartRecommendations(context.cartItems);
        break;
      case 'checkout':
        recommendations = await this.getCheckoutRecommendations(context.cartItems);
        break;
    }
    
    // Apply personalization layer
    recommendations = this.personalizeRecommendations(recommendations);
    
    // Sort by score and limit
    recommendations.sort((a, b) => b.score - a.score);
    recommendations = recommendations.slice(0, limit);
    
    // Cache results
    this.recommendationCache.set(cacheKey, recommendations);
    
    // Trigger prefetching for top recommendations
    this.prefetchTopRecommendations(recommendations.slice(0, 3));
    
    return recommendations;
  }

  private async getHomePageRecommendations(): Promise<ProductRecommendation[]> {
    const preferences = advancedBehaviorTracker.getUserPreferences();
    const predictions = advancedBehaviorTracker.getPredictedProducts();
    const recommendations: ProductRecommendation[] = [];
    
    // Add predicted products
    predictions.forEach((prediction, index) => {
      const conversionPrediction = advancedBehaviorTracker.getConversionPrediction(prediction.productId);
      
      recommendations.push({
        productId: prediction.productId,
        score: prediction.score * (1 - index * 0.1), // Decay score by position
        reason: this.getReasonForPrediction(prediction.prediction),
        type: 'personalized',
        confidence: conversionPrediction.likelihood,
        predictedCTR: this.calculateCTR(prediction.score),
        predictedConversion: conversionPrediction.likelihood / 100
      });
    });
    
    // Add wishlist items with boost
    preferences.wishlist.forEach(productId => {
      const existing = recommendations.find(r => r.productId === productId);
      if (existing) {
        existing.score *= 1.5;
        existing.reason = 'In your wishlist and trending';
      } else {
        recommendations.push({
          productId,
          score: 80,
          reason: 'In your wishlist',
          type: 'personalized',
          confidence: 85,
          predictedCTR: 0.15,
          predictedConversion: 0.08
        });
      }
    });
    
    // Add category-based recommendations
    preferences.topCategories.forEach(([category, count]) => {
      // This would fetch products from the category
      // For now, we'll create placeholder recommendations
      recommendations.push({
        productId: `cat_${category}_featured`,
        score: 60 + count * 2,
        reason: `Popular in ${category}`,
        type: 'personalized',
        confidence: 70,
        predictedCTR: 0.12,
        predictedConversion: 0.05
      });
    });
    
    return recommendations;
  }

  private async getProductPageRecommendations(productId?: string): Promise<ProductRecommendation[]> {
    if (!productId) return [];
    
    const recommendations: ProductRecommendation[] = [];
    const highIntentProducts = advancedBehaviorTracker.getHighIntentProducts();
    
    // Add complementary products (frequently bought together)
    recommendations.push({
      productId: `${productId}_complement_1`,
      score: 90,
      reason: 'Frequently bought together',
      type: 'complementary',
      confidence: 85,
      predictedCTR: 0.18,
      predictedConversion: 0.12
    });
    
    // Add similar products
    recommendations.push({
      productId: `${productId}_similar_1`,
      score: 85,
      reason: 'Similar product',
      type: 'similar',
      confidence: 80,
      predictedCTR: 0.15,
      predictedConversion: 0.08
    });
    
    // Add upsell opportunities
    if (highIntentProducts.includes(productId)) {
      recommendations.push({
        productId: `${productId}_premium`,
        score: 95,
        reason: 'Premium version - Better value',
        type: 'upsell',
        confidence: 75,
        predictedCTR: 0.20,
        predictedConversion: 0.15
      });
    }
    
    return recommendations;
  }

  private async getCategoryRecommendations(category?: string): Promise<ProductRecommendation[]> {
    if (!category) return [];
    
    const preferences = advancedBehaviorTracker.getUserPreferences();
    const recommendations: ProductRecommendation[] = [];
    
    // Add trending in category
    recommendations.push({
      productId: `${category}_trending_1`,
      score: 85,
      reason: `Trending in ${category}`,
      type: 'trending',
      confidence: 80,
      predictedCTR: 0.14,
      predictedConversion: 0.07
    });
    
    // Add personalized picks within category
    if (preferences.topCategories.some(([cat]) => cat === category)) {
      recommendations.push({
        productId: `${category}_personalized_1`,
        score: 90,
        reason: 'Recommended for you',
        type: 'personalized',
        confidence: 85,
        predictedCTR: 0.16,
        predictedConversion: 0.09
      });
    }
    
    return recommendations;
  }

  private async getSearchRecommendations(query?: string): Promise<ProductRecommendation[]> {
    if (!query) return [];
    
    const searchHistory = advancedBehaviorTracker.getUserPreferences().searchHistory;
    const recommendations: ProductRecommendation[] = [];
    
    // Add products based on search intent
    recommendations.push({
      productId: `search_${query.replace(/\s+/g, '_')}_1`,
      score: 88,
      reason: 'Best match for your search',
      type: 'personalized',
      confidence: 82,
      predictedCTR: 0.17,
      predictedConversion: 0.10
    });
    
    // If similar to previous searches, boost relevance
    const similarSearches = searchHistory.filter(s => 
      s.toLowerCase().includes(query.toLowerCase()) || 
      query.toLowerCase().includes(s.toLowerCase())
    );
    
    if (similarSearches.length > 0) {
      recommendations.push({
        productId: `search_history_match_1`,
        score: 92,
        reason: 'Based on your search history',
        type: 'personalized',
        confidence: 87,
        predictedCTR: 0.19,
        predictedConversion: 0.11
      });
    }
    
    return recommendations;
  }

  private async getCartRecommendations(cartItems?: string[]): Promise<ProductRecommendation[]> {
    if (!cartItems || cartItems.length === 0) return [];
    
    const recommendations: ProductRecommendation[] = [];
    
    // Add cross-sell items
    cartItems.forEach(item => {
      recommendations.push({
        productId: `${item}_crosssell_1`,
        score: 93,
        reason: 'Complete your purchase',
        type: 'cross-sell',
        confidence: 88,
        predictedCTR: 0.22,
        predictedConversion: 0.18
      });
    });
    
    // Add bundle suggestions
    if (cartItems.length > 1) {
      recommendations.push({
        productId: 'bundle_discount_1',
        score: 96,
        reason: 'Save with this bundle',
        type: 'upsell',
        confidence: 90,
        predictedCTR: 0.25,
        predictedConversion: 0.20
      });
    }
    
    return recommendations;
  }

  private async getCheckoutRecommendations(cartItems?: string[]): Promise<ProductRecommendation[]> {
    if (!cartItems || cartItems.length === 0) return [];
    
    const recommendations: ProductRecommendation[] = [];
    
    // Add last-minute deals
    recommendations.push({
      productId: 'checkout_deal_1',
      score: 98,
      reason: 'Limited time offer',
      type: 'upsell',
      confidence: 92,
      predictedCTR: 0.28,
      predictedConversion: 0.22
    });
    
    // Add frequently forgotten items
    recommendations.push({
      productId: 'forgotten_essential_1',
      score: 94,
      reason: "Don't forget this essential",
      type: 'cross-sell',
      confidence: 86,
      predictedCTR: 0.20,
      predictedConversion: 0.15
    });
    
    return recommendations;
  }

  private personalizeRecommendations(recommendations: ProductRecommendation[]): ProductRecommendation[] {
    const preferences = advancedBehaviorTracker.getUserPreferences();
    
    // Boost scores based on user preferences
    return recommendations.map(rec => {
      let boostFactor = 1.0;
      
      // Boost if in wishlist
      if (preferences.wishlist.includes(rec.productId)) {
        boostFactor *= 1.3;
      }
      
      // Boost if matches price range
      // This would need actual product price data
      
      // Boost based on user segment
      switch (this.userSegment) {
        case 'high-value':
          if (rec.type === 'upsell') boostFactor *= 1.2;
          break;
        case 'loyal':
          if (rec.type === 'personalized') boostFactor *= 1.15;
          break;
        case 'returning':
          if (rec.type === 'trending') boostFactor *= 1.1;
          break;
        case 'new':
          if (rec.type === 'trending' || rec.type === 'similar') boostFactor *= 1.1;
          break;
      }
      
      return {
        ...rec,
        score: rec.score * boostFactor,
        confidence: Math.min(95, rec.confidence * boostFactor)
      };
    });
  }

  private getReasonForPrediction(prediction: string): string {
    const reasons: Record<string, string> = {
      'view': 'Based on your browsing history',
      'wishlist': 'Similar to items you love',
      'cart': 'Ready to purchase',
      'purchase': 'Highly recommended for you'
    };
    
    return reasons[prediction] || 'Recommended for you';
  }

  private calculateCTR(score: number): number {
    // Convert behavior score to estimated CTR
    return Math.min(0.3, score / 200);
  }

  private getCacheKey(context: RecommendationContext): string {
    return JSON.stringify({
      pageType: context.pageType,
      currentProduct: context.currentProduct,
      currentCategory: context.currentCategory,
      searchQuery: context.searchQuery,
      segment: this.userSegment
    });
  }

  private prefetchTopRecommendations(recommendations: ProductRecommendation[]) {
    recommendations.forEach((rec, index) => {
      if (rec.confidence > 70) {
        window.dispatchEvent(new CustomEvent('predictive-prefetch', {
          detail: {
            productId: rec.productId,
            action: 'view',
            confidence: rec.confidence - index * 5
          }
        }));
      }
    });
  }

  public getUpsellOpportunities(productId: string): ProductRecommendation[] {
    const cached = Array.from(this.recommendationCache.values()).flat();
    return cached.filter(r => 
      r.type === 'upsell' && 
      r.productId.includes(productId)
    );
  }

  public getCrossSellOpportunities(cartItems: string[]): ProductRecommendation[] {
    const cached = Array.from(this.recommendationCache.values()).flat();
    return cached.filter(r => 
      r.type === 'cross-sell' && 
      r.confidence > 80
    );
  }

  public getPersonalizedDeals(): ProductRecommendation[] {
    const predictions = advancedBehaviorTracker.getPredictedProducts();
    
    return predictions
      .filter(p => p.score > 50)
      .map(p => ({
        productId: p.productId,
        score: p.score,
        reason: 'Special offer for you',
        type: 'personalized' as const,
        confidence: 85,
        predictedCTR: 0.25,
        predictedConversion: 0.15
      }));
  }
}

// Export singleton instance
export const aiRecommendationEngine = new AIRecommendationEngine();
export default aiRecommendationEngine;