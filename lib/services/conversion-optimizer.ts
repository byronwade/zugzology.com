"use client";

import { advancedBehaviorTracker } from './advanced-behavior-tracker';
import { aiRecommendationEngine } from './ai-recommendation-engine';
import { predictivePrefetcher } from './predictive-prefetcher';

export interface ConversionStrategy {
  type: 'urgency' | 'scarcity' | 'social-proof' | 'discount' | 'bundle' | 'personalized';
  message: string;
  confidence: number;
  expectedLift: number;
  targetProducts?: string[];
}

export interface UpsellOffer {
  productId: string;
  originalProductId: string;
  discount?: number;
  message: string;
  reason: string;
  expectedRevenueLift: number;
}

export interface CrossSellBundle {
  products: string[];
  bundleDiscount: number;
  message: string;
  totalValue: number;
  bundlePrice: number;
  savings: number;
}

class ConversionOptimizer {
  private conversionStrategies: Map<string, ConversionStrategy[]> = new Map();
  private activeExperiments: Map<string, any> = new Map();
  private conversionEvents: any[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private initialize() {
    this.setupConversionTracking();
    this.startOptimizationLoop();
  }

  private setupConversionTracking() {
    // Track conversion events
    window.addEventListener('cart-add', this.handleCartAdd as EventListener);
    window.addEventListener('purchase-complete', this.handlePurchase as EventListener);
    
    // Track micro-conversions
    this.trackMicroConversions();
  }

  private handleCartAdd = (event: CustomEvent) => {
    const { productId, quantity, variant } = event.detail;
    this.conversionEvents.push({
      type: 'cart-add',
      productId,
      quantity,
      variant,
      timestamp: Date.now()
    });
    
    // Trigger cross-sell opportunities
    this.triggerCrossSellOpportunity(productId);
  };

  private handlePurchase = (event: CustomEvent) => {
    const { orderData } = event.detail;
    this.conversionEvents.push({
      type: 'purchase',
      orderData,
      timestamp: Date.now()
    });
    
    // Analyze successful conversion for learning
    this.analyzeSuccessfulConversion(orderData);
  };

  private trackMicroConversions() {
    // Track engagement signals
    let scrollDepth = 0;
    let timeOnPage = 0;
    const startTime = Date.now();
    
    window.addEventListener('scroll', () => {
      const newScrollDepth = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      scrollDepth = Math.max(scrollDepth, newScrollDepth);
    });
    
    setInterval(() => {
      timeOnPage = Date.now() - startTime;
      
      // Check for conversion opportunities based on engagement
      if (timeOnPage > 30000 && scrollDepth > 50) {
        this.checkConversionOpportunities();
      }
    }, 5000);
  }

  private startOptimizationLoop() {
    // Continuously optimize based on user behavior
    setInterval(() => {
      this.optimizeCurrentPage();
      this.updateStrategies();
    }, 10000);
  }

  private optimizeCurrentPage() {
    const currentPath = window.location.pathname;
    const userPreferences = advancedBehaviorTracker.getUserPreferences();
    const highIntentProducts = advancedBehaviorTracker.getHighIntentProducts();
    
    // Generate strategies based on page type
    if (currentPath.includes('/products/')) {
      this.optimizeProductPage();
    } else if (currentPath.includes('/cart')) {
      this.optimizeCartPage();
    } else if (currentPath.includes('/checkout')) {
      this.optimizeCheckoutPage();
    } else if (currentPath === '/') {
      this.optimizeHomePage();
    }
  }

  private optimizeProductPage() {
    const productId = this.extractProductIdFromPath();
    if (!productId) return;
    
    const prediction = advancedBehaviorTracker.getConversionPrediction(productId);
    const strategies: ConversionStrategy[] = [];
    
    // High intent - show urgency
    if (prediction.likelihood > 70) {
      strategies.push({
        type: 'urgency',
        message: 'Limited stock - Only a few left!',
        confidence: prediction.likelihood,
        expectedLift: 15,
        targetProducts: [productId]
      });
    }
    
    // Medium intent - show social proof
    if (prediction.likelihood > 40 && prediction.likelihood <= 70) {
      strategies.push({
        type: 'social-proof',
        message: '23 people are viewing this product',
        confidence: prediction.likelihood,
        expectedLift: 8,
        targetProducts: [productId]
      });
    }
    
    // Low intent - offer discount
    if (prediction.likelihood <= 40) {
      strategies.push({
        type: 'discount',
        message: 'Get 10% off your first order!',
        confidence: 85,
        expectedLift: 12,
        targetProducts: [productId]
      });
    }
    
    this.conversionStrategies.set('product-page', strategies);
    this.applyStrategies(strategies);
  }

  private optimizeCartPage() {
    const cartItems = this.getCartItems();
    const strategies: ConversionStrategy[] = [];
    
    // Bundle opportunity
    if (cartItems.length > 1) {
      strategies.push({
        type: 'bundle',
        message: 'Complete your set and save 15%!',
        confidence: 80,
        expectedLift: 20,
        targetProducts: cartItems
      });
    }
    
    // Free shipping threshold
    const cartTotal = this.calculateCartTotal();
    const freeShippingThreshold = 75;
    if (cartTotal < freeShippingThreshold) {
      const remaining = freeShippingThreshold - cartTotal;
      strategies.push({
        type: 'urgency',
        message: `Add $${remaining.toFixed(2)} more for free shipping!`,
        confidence: 90,
        expectedLift: 18
      });
    }
    
    this.conversionStrategies.set('cart-page', strategies);
    this.applyStrategies(strategies);
  }

  private optimizeCheckoutPage() {
    const strategies: ConversionStrategy[] = [];
    
    // Security reassurance
    strategies.push({
      type: 'social-proof',
      message: '🔒 Secure checkout - SSL encrypted',
      confidence: 95,
      expectedLift: 5
    });
    
    // Scarcity for cart items
    strategies.push({
      type: 'scarcity',
      message: 'Items in your cart are in high demand',
      confidence: 85,
      expectedLift: 10
    });
    
    this.conversionStrategies.set('checkout-page', strategies);
    this.applyStrategies(strategies);
  }

  private optimizeHomePage() {
    const predictions = advancedBehaviorTracker.getPredictedProducts();
    const strategies: ConversionStrategy[] = [];
    
    if (predictions.length > 0) {
      strategies.push({
        type: 'personalized',
        message: 'Recommended just for you',
        confidence: 90,
        expectedLift: 25,
        targetProducts: predictions.map(p => p.productId)
      });
    }
    
    this.conversionStrategies.set('home-page', strategies);
    this.applyStrategies(strategies);
  }

  private applyStrategies(strategies: ConversionStrategy[]) {
    // Emit events for UI components to react to
    strategies.forEach(strategy => {
      window.dispatchEvent(new CustomEvent('conversion-strategy', {
        detail: strategy
      }));
    });
  }

  private updateStrategies() {
    // Update strategies based on performance
    this.conversionStrategies.forEach((strategies, page) => {
      strategies.forEach(strategy => {
        // Adjust confidence based on actual performance
        const performance = this.measureStrategyPerformance(strategy);
        strategy.confidence = Math.min(95, strategy.confidence * performance);
      });
    });
  }

  private measureStrategyPerformance(strategy: ConversionStrategy): number {
    // Measure actual lift vs expected
    // This would need real conversion data
    return 1.0; // Placeholder
  }

  private checkConversionOpportunities() {
    const highIntentProducts = advancedBehaviorTracker.getHighIntentProducts();
    
    if (highIntentProducts.length > 0) {
      // Show exit intent popup with personalized offer
      this.showExitIntentOffer(highIntentProducts[0]);
    }
  }

  private showExitIntentOffer(productId: string) {
    window.dispatchEvent(new CustomEvent('show-exit-intent', {
      detail: {
        productId,
        offer: '15% off if you complete your purchase now!',
        expiresIn: 600000 // 10 minutes
      }
    }));
  }

  private triggerCrossSellOpportunity(productId: string) {
    const recommendations = aiRecommendationEngine.getCrossSellOpportunities([productId]);
    
    if (recommendations.length > 0) {
      window.dispatchEvent(new CustomEvent('cross-sell-opportunity', {
        detail: {
          originalProduct: productId,
          recommendations: recommendations.slice(0, 3)
        }
      }));
    }
  }

  private analyzeSuccessfulConversion(orderData: any) {
    // Learn from successful conversions
    const strategies = this.conversionStrategies.get('checkout-page') || [];
    strategies.forEach(strategy => {
      strategy.confidence = Math.min(95, strategy.confidence * 1.1);
    });
  }

  private extractProductIdFromPath(): string | null {
    const match = window.location.pathname.match(/\/products\/([^\/]+)/);
    return match ? match[1] : null;
  }

  private getCartItems(): string[] {
    // Get cart items from localStorage or cart provider
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      return cart.map((item: any) => item.productId || item.id);
    } catch {
      return [];
    }
  }

  private calculateCartTotal(): number {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      return cart.reduce((total: number, item: any) => {
        return total + (parseFloat(item.price) || 0) * (item.quantity || 1);
      }, 0);
    } catch {
      return 0;
    }
  }

  // Public API methods
  public getUpsellRecommendation(productId: string): UpsellOffer | null {
    const upsells = aiRecommendationEngine.getUpsellOpportunities(productId);
    
    if (upsells.length === 0) return null;
    
    const topUpsell = upsells[0];
    return {
      productId: topUpsell.productId,
      originalProductId: productId,
      discount: 10,
      message: 'Upgrade to premium for better results!',
      reason: topUpsell.reason,
      expectedRevenueLift: topUpsell.predictedConversion * 100
    };
  }

  public getCrossSellBundle(cartItems: string[]): CrossSellBundle | null {
    if (cartItems.length === 0) return null;
    
    const crossSells = aiRecommendationEngine.getCrossSellOpportunities(cartItems);
    
    if (crossSells.length < 2) return null;
    
    const bundleProducts = [...cartItems, ...crossSells.slice(0, 2).map(r => r.productId)];
    const totalValue = bundleProducts.length * 25; // Placeholder pricing
    const bundleDiscount = 15;
    const bundlePrice = totalValue * (1 - bundleDiscount / 100);
    
    return {
      products: bundleProducts,
      bundleDiscount,
      message: 'Complete your collection and save!',
      totalValue,
      bundlePrice,
      savings: totalValue - bundlePrice
    };
  }

  public getPersonalizedOffer(): ConversionStrategy | null {
    const userPreferences = advancedBehaviorTracker.getUserPreferences();
    const predictions = advancedBehaviorTracker.getPredictedProducts();
    
    if (predictions.length === 0) return null;
    
    const topPrediction = predictions[0];
    
    return {
      type: 'personalized',
      message: `Special offer on products you'll love - ${topPrediction.prediction}`,
      confidence: topPrediction.score,
      expectedLift: 30,
      targetProducts: predictions.map(p => p.productId)
    };
  }

  public triggerAbandonmentRecovery() {
    const highIntentProducts = advancedBehaviorTracker.getHighIntentProducts();
    const cartItems = this.getCartItems();
    
    if (highIntentProducts.length > 0 || cartItems.length > 0) {
      const products = [...new Set([...highIntentProducts, ...cartItems])];
      
      window.dispatchEvent(new CustomEvent('abandonment-recovery', {
        detail: {
          products,
          message: "Don't miss out! Complete your purchase and save 10%",
          discountCode: 'COMEBACK10',
          expiresIn: 3600000 // 1 hour
        }
      }));
    }
  }

  public getConversionProbability(): number {
    const predictions = advancedBehaviorTracker.getPredictedProducts();
    const cartItems = this.getCartItems();
    
    if (cartItems.length > 0) {
      // High probability if items in cart
      return Math.min(95, 70 + cartItems.length * 5);
    }
    
    if (predictions.length > 0) {
      // Based on behavior predictions
      return predictions[0].score;
    }
    
    return 10; // Base probability
  }
}

// Export singleton instance
export const conversionOptimizer = new ConversionOptimizer();
export default conversionOptimizer;