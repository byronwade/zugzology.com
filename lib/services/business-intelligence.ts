"use client";

import { shopifyDataContext } from './shopify-data-context';
import { advancedBehaviorTracker } from './advanced-behavior-tracker';

export interface RevenueMetrics {
  dailyRevenuePotential: number;
  avgOrderValue: number;
  conversionRate: number;
  cartAbandonmentRate: number;
  customerLifetimeValue: number;
  topRevenueProducts: Array<{
    productId: string;
    title: string;
    price: number;
    projectedRevenue: number;
    conversionProbability: number;
  }>;
}

export interface InventoryInsights {
  lowStockAlerts: Array<{
    productId: string;
    title: string;
    currentStock: number;
    dailySalesVelocity: number;
    daysUntilStockout: number;
    reorderPriority: 'critical' | 'high' | 'medium' | 'low';
  }>;
  overStockItems: Array<{
    productId: string;
    title: string;
    currentStock: number;
    turnoverRate: number;
    recommendedAction: string;
  }>;
  totalInventoryValue: number;
  turnoverAnalysis: {
    fastMoving: number;
    slowMoving: number;
    deadStock: number;
  };
}

export interface CustomerInsights {
  segmentAnalysis: {
    newVisitors: number;
    returningCustomers: number;
    highValueCustomers: number;
    atRiskCustomers: number;
  };
  behaviorPatterns: {
    avgSessionTime: number;
    pagesPerSession: number;
    bounceRate: number;
    mostViewedCategories: string[];
  };
  conversionFunnelAnalysis: {
    visitors: number;
    productViews: number;
    addToCart: number;
    checkout: number;
    completed: number;
  };
}

export interface MarginOptimization {
  highMarginOpportunities: Array<{
    productId: string;
    title: string;
    currentMargin: number;
    potentialMargin: number;
    priceOptimizationSuggestion: {
      currentPrice: number;
      suggestedPrice: number;
      expectedImpact: string;
    };
  }>;
  bundleOpportunities: Array<{
    primaryProduct: string;
    suggestedBundle: string[];
    expectedUplift: number;
    marginImprovement: number;
  }>;
  seasonalPricingRecommendations: Array<{
    productCategory: string;
    timeframe: string;
    recommendedAdjustment: number;
    reasoning: string;
  }>;
}

class BusinessIntelligenceEngine {
  private sessionStartTime = Date.now();
  private revenueGoals = {
    daily: 1500.00, // Example daily revenue target
    monthly: 45000.00,
    avgOrderTarget: 75.00,
    conversionTarget: 3.50
  };

  /**
   * Calculate comprehensive revenue metrics with realistic projections
   */
  public getRevenueMetrics(): RevenueMetrics {
    const allProducts = shopifyDataContext.getAllProducts();
    const topScoredProducts = shopifyDataContext.getTopScoredProducts(10);
    const behaviorData = advancedBehaviorTracker.getBehaviorData();
    const userPreferences = advancedBehaviorTracker.getUserPreferences();

    // Calculate daily revenue potential based on AI scores and user behavior
    const dailyRevenuePotential = topScoredProducts.reduce((total, item) => {
      const price = parseFloat(item.product.price) || 0;
      const aiConfidence = item.score.totalScore / 100;
      const conversionProbability = Math.min(0.15, aiConfidence * 0.08); // Realistic 2-15% conversion
      
      return total + (price * conversionProbability);
    }, 0);

    // Calculate average order value with proper rounding
    const avgOrderValue = allProducts.reduce((sum, product) => {
      return sum + (parseFloat(product.price) || 0);
    }, 0) / Math.max(1, allProducts.length);

    // Estimate conversion rate based on user engagement
    const totalInteractions = behaviorData.interactions?.length || 0;
    const conversionActions = userPreferences.cart.length + userPreferences.wishlist.length;
    const baseConversionRate = totalInteractions > 0 ? (conversionActions / totalInteractions) * 100 : 2.5;
    const conversionRate = Math.min(15, Math.max(1, baseConversionRate)); // Realistic 1-15% range

    // Calculate cart abandonment rate (industry average ~70%)
    const cartActions = userPreferences.cart.length;
    const completedActions = 0; // Would track actual purchases
    const cartAbandonmentRate = cartActions > 0 ? ((cartActions - completedActions) / cartActions) * 100 : 69.23;

    // Estimate customer lifetime value
    const customerLifetimeValue = avgOrderValue * 2.3 * 1.2; // 2.3 orders per year, 20% growth

    // Top revenue products with realistic projections
    const topRevenueProducts = topScoredProducts.slice(0, 5).map(item => {
      const price = parseFloat(item.product.price) || 0;
      const score = item.score.totalScore;
      const conversionProbability = Math.min(0.25, (score / 100) * 0.12);
      
      return {
        productId: item.product.id,
        title: item.product.title,
        price: Math.round(price * 100) / 100,
        projectedRevenue: Math.round((price * conversionProbability * 30) * 100) / 100, // 30-day projection
        conversionProbability: Math.round(conversionProbability * 10000) / 100 // Convert to percentage with 2 decimals
      };
    });

    return {
      dailyRevenuePotential: Math.round(dailyRevenuePotential * 100) / 100,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
      cartAbandonmentRate: Math.round(cartAbandonmentRate * 100) / 100,
      customerLifetimeValue: Math.round(customerLifetimeValue * 100) / 100,
      topRevenueProducts
    };
  }

  /**
   * Analyze inventory with actionable business insights
   */
  public getInventoryInsights(): InventoryInsights {
    const allProducts = shopifyDataContext.getAllProducts();
    const lowStockProducts = shopifyDataContext.getLowStockProducts();

    // Calculate low stock alerts with business priority
    const lowStockAlerts = lowStockProducts.map(item => {
      const currentStock = item.product.totalInventory;
      const price = parseFloat(item.product.price) || 0;
      
      // Estimate daily sales velocity based on AI score and price
      const aiScore = item.score?.totalScore || 0;
      const dailySalesVelocity = Math.max(0.1, (aiScore / 100) * (price / 50) * 2);
      const daysUntilStockout = currentStock / Math.max(0.1, dailySalesVelocity);
      
      let reorderPriority: 'critical' | 'high' | 'medium' | 'low' = 'low';
      if (daysUntilStockout <= 3) reorderPriority = 'critical';
      else if (daysUntilStockout <= 7) reorderPriority = 'high';
      else if (daysUntilStockout <= 14) reorderPriority = 'medium';

      return {
        productId: item.product.id,
        title: item.product.title,
        currentStock,
        dailySalesVelocity: Math.round(dailySalesVelocity * 100) / 100,
        daysUntilStockout: Math.round(daysUntilStockout * 100) / 100,
        reorderPriority
      };
    });

    // Identify overstock items
    const overStockItems = allProducts
      .filter(product => product.totalInventory > 100)
      .map(product => {
        const currentStock = product.totalInventory;
        const productScore = shopifyDataContext.getProductScore(product.id);
        const turnoverRate = productScore ? (productScore.trendingScore / 100) * 12 : 2; // Annual turnover estimate

        return {
          productId: product.id,
          title: product.title,
          currentStock,
          turnoverRate: Math.round(turnoverRate * 100) / 100,
          recommendedAction: turnoverRate < 3 ? 'Consider promotion or bundling' : 
                           turnoverRate < 6 ? 'Monitor closely' : 'Good stock level'
        };
      })
      .slice(0, 5);

    // Calculate total inventory value
    const totalInventoryValue = allProducts.reduce((total, product) => {
      const price = parseFloat(product.price) || 0;
      const stock = product.totalInventory || 0;
      return total + (price * stock * 0.6); // Assume 60% cost basis
    }, 0);

    // Turnover analysis
    const fastMoving = allProducts.filter(product => {
      const score = shopifyDataContext.getProductScore(product.id);
      return score && score.trendingScore > 15;
    }).length;

    const slowMoving = allProducts.filter(product => {
      const score = shopifyDataContext.getProductScore(product.id);
      return score && score.trendingScore < 5 && product.totalInventory > 20;
    }).length;

    const deadStock = allProducts.filter(product => 
      product.totalInventory > 50 && !product.availableForSale
    ).length;

    return {
      lowStockAlerts,
      overStockItems,
      totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
      turnoverAnalysis: {
        fastMoving,
        slowMoving,
        deadStock
      }
    };
  }

  /**
   * Generate customer insights with behavioral analysis
   */
  public getCustomerInsights(): CustomerInsights {
    const behaviorData = advancedBehaviorTracker.getBehaviorData();
    const userPreferences = advancedBehaviorTracker.getUserPreferences();

    // Session analysis
    const sessionTime = Date.now() - this.sessionStartTime;
    const avgSessionTime = Math.round((sessionTime / 1000) * 100) / 100; // Convert to seconds
    
    // Behavior patterns
    const pagesPerSession = Math.max(1, behaviorData.viewedProducts?.length || 1);
    const bounceRate = pagesPerSession === 1 ? 65.50 : 45.20; // Industry averages
    
    // Most viewed categories
    const categoryViews = new Map();
    userPreferences.topCategories?.forEach(([category, count]) => {
      categoryViews.set(category, count);
    });
    const mostViewedCategories = Array.from(categoryViews.keys()).slice(0, 3);

    // Conversion funnel (simulated based on interactions)
    const totalInteractions = behaviorData.interactions?.length || 0;
    const productViews = behaviorData.viewedProducts?.length || 0;
    const addToCart = userPreferences.cart?.length || 0;
    const checkouts = Math.floor(addToCart * 0.3); // 30% of cart additions reach checkout
    const completed = Math.floor(checkouts * 0.7); // 70% complete after reaching checkout

    return {
      segmentAnalysis: {
        newVisitors: productViews < 3 ? 1 : 0,
        returningCustomers: productViews >= 3 ? 1 : 0,
        highValueCustomers: userPreferences.cart.length > 2 ? 1 : 0,
        atRiskCustomers: 0
      },
      behaviorPatterns: {
        avgSessionTime,
        pagesPerSession,
        bounceRate: Math.round(bounceRate * 100) / 100,
        mostViewedCategories
      },
      conversionFunnelAnalysis: {
        visitors: 1,
        productViews,
        addToCart,
        checkout: checkouts,
        completed
      }
    };
  }

  /**
   * Provide margin optimization recommendations
   */
  public getMarginOptimization(): MarginOptimization {
    const highMarginProducts = shopifyDataContext.getHighMarginProducts(5);
    const allProducts = shopifyDataContext.getAllProducts();

    // High margin opportunities
    const highMarginOpportunities = highMarginProducts.map(item => {
      const currentPrice = parseFloat(item.product.price) || 0;
      const estimatedCost = currentPrice * 0.45; // Assume 45% cost basis
      const currentMargin = ((currentPrice - estimatedCost) / currentPrice) * 100;
      
      // Suggest price optimization
      const suggestedPrice = currentPrice * 1.08; // 8% increase
      const potentialMargin = ((suggestedPrice - estimatedCost) / suggestedPrice) * 100;
      
      return {
        productId: item.product.id,
        title: item.product.title,
        currentMargin: Math.round(currentMargin * 100) / 100,
        potentialMargin: Math.round(potentialMargin * 100) / 100,
        priceOptimizationSuggestion: {
          currentPrice: Math.round(currentPrice * 100) / 100,
          suggestedPrice: Math.round(suggestedPrice * 100) / 100,
          expectedImpact: `+${Math.round((potentialMargin - currentMargin) * 100) / 100}% margin improvement`
        }
      };
    });

    // Bundle opportunities
    const bundleOpportunities = [
      {
        primaryProduct: 'High-selling cultivation kit',
        suggestedBundle: ['Sterilized substrate', 'Growing tools', 'pH testing kit'],
        expectedUplift: 25.50,
        marginImprovement: 12.75
      },
      {
        primaryProduct: 'Mushroom supplements',
        suggestedBundle: ['Related wellness products', 'Dosing guide', 'Storage container'],
        expectedUplift: 18.25,
        marginImprovement: 8.90
      }
    ];

    // Seasonal pricing recommendations
    const seasonalPricingRecommendations = [
      {
        productCategory: 'Growing Kits',
        timeframe: 'Spring Season (Mar-May)',
        recommendedAdjustment: 5.00,
        reasoning: 'High demand for indoor growing during spring planting season'
      },
      {
        productCategory: 'Wellness Supplements',
        timeframe: 'Holiday Season (Nov-Dec)',
        recommendedAdjustment: 8.50,
        reasoning: 'Gift purchasing and health resolutions drive premium pricing tolerance'
      }
    ];

    return {
      highMarginOpportunities,
      bundleOpportunities,
      seasonalPricingRecommendations
    };
  }

  /**
   * Get overall business performance summary
   */
  public getBusinessPerformanceSummary() {
    const revenue = this.getRevenueMetrics();
    const inventory = this.getInventoryInsights();
    const customer = this.getCustomerInsights();
    const margin = this.getMarginOptimization();

    return {
      summary: {
        dailyRevenueVsGoal: Math.round((revenue.dailyRevenuePotential / this.revenueGoals.daily) * 10000) / 100,
        conversionVsTarget: Math.round((revenue.conversionRate / this.revenueGoals.conversionTarget) * 10000) / 100,
        inventoryHealth: Math.round(((inventory.turnoverAnalysis.fastMoving / (inventory.turnoverAnalysis.slowMoving + 1)) * 100) * 100) / 100,
        customerEngagement: Math.round((customer.behaviorPatterns.pagesPerSession * 25) * 100) / 100 // Scale to percentage
      },
      alerts: {
        criticalStockouts: inventory.lowStockAlerts.filter(item => item.reorderPriority === 'critical').length,
        marginOpportunities: margin.highMarginOpportunities.length,
        conversionIssues: revenue.conversionRate < this.revenueGoals.conversionTarget ? 1 : 0
      },
      recommendations: [
        revenue.dailyRevenuePotential < this.revenueGoals.daily ? 
          `Focus on top ${Math.min(3, margin.highMarginOpportunities.length)} margin products to increase daily revenue by $${Math.round((this.revenueGoals.daily - revenue.dailyRevenuePotential) * 100) / 100}` : 
          'Revenue targets on track',
        inventory.lowStockAlerts.length > 0 ? 
          `Reorder ${inventory.lowStockAlerts.filter(item => item.reorderPriority === 'critical').length} critical items immediately` : 
          'Inventory levels healthy',
        revenue.conversionRate < this.revenueGoals.conversionTarget ? 
          'Implement A/B testing on product pages to improve conversion rate' : 
          'Conversion rate meeting targets'
      ].filter(rec => rec !== 'Revenue targets on track' && rec !== 'Inventory levels healthy' && rec !== 'Conversion rate meeting targets')
    };
  }
}

// Export singleton instance
export const businessIntelligence = new BusinessIntelligenceEngine();
export default businessIntelligence;