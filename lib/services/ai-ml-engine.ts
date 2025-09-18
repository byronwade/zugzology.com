"use client";

/**
 * Advanced AI/ML Engine for E-commerce Intelligence
 * Integrates with OpenAI/Claude and implements enterprise-grade ML techniques
 */

import { aiPerformanceOptimizer } from './ai-performance-optimizer';
import type { UserInteraction, ProductPrediction } from '@/stores/ai-prediction-store';
import type { ShopifyProduct } from '@/lib/types';

// Enterprise ML Models Configuration
interface AIModelConfig {
  openaiApiKey?: string;
  claudeApiKey?: string;
  huggingFaceApiKey?: string;
  enableRealTimeML: boolean;
  enableCollaborativeFiltering: boolean;
  enableSentimentAnalysis: boolean;
  enableTimeSeriesForecasting: boolean;
  batchSize: number;
  confidenceThreshold: number;
}

// Advanced user behavior patterns
interface BehaviorPattern {
  patternType: 'impulse_buyer' | 'researcher' | 'price_sensitive' | 'brand_loyal' | 'seasonal' | 'bulk_buyer';
  confidence: number;
  indicators: string[];
  predictedActions: string[];
  timeToConversion?: number;
  averageOrderValue?: number;
}

// Market basket analysis results
interface MarketBasketRule {
  antecedent: string[]; // Products often bought first
  consequent: string[]; // Products bought together
  support: number; // How often this combination occurs
  confidence: number; // Probability of consequent given antecedent
  lift: number; // How much more likely consequent is with antecedent
}

// Real-time sentiment analysis
interface SentimentScore {
  productId: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  emotions: {
    excitement: number;
    hesitation: number;
    interest: number;
    frustration: number;
  };
  behaviorTriggers: string[];
}

class AdvancedAIMLEngine {
  private static instance: AdvancedAIMLEngine;
  private config: AIModelConfig;
  private userBehaviorPatterns = new Map<string, BehaviorPattern>();
  private marketBasketRules: MarketBasketRule[] = [];
  private sentimentCache = new Map<string, SentimentScore>();
  private collaborativeMatrix = new Map<string, Map<string, number>>();
  
  // Enterprise ML Models
  private behaviorClassifier: any = null;
  private recommendationEngine: any = null;
  private demandForecaster: any = null;

  constructor(config: AIModelConfig) {
    this.config = config;
    this.initializeMLModels();
  }

  public static getInstance(config?: AIModelConfig): AdvancedAIMLEngine {
    if (!AdvancedAIMLEngine.instance) {
      AdvancedAIMLEngine.instance = new AdvancedAIMLEngine(config || {
        enableRealTimeML: true,
        enableCollaborativeFiltering: true,
        enableSentimentAnalysis: true,
        enableTimeSeriesForecasting: true,
        batchSize: 50,
        confidenceThreshold: 0.7
      });
    }
    return AdvancedAIMLEngine.instance;
  }

  /**
   * Initialize ML models and AI APIs
   */
  private async initializeMLModels() {
    try {
      // Initialize collaborative filtering matrix
      await this.buildCollaborativeFilteringMatrix();
      
      // Initialize market basket analysis
      await this.performMarketBasketAnalysis();
      
      console.log('🤖 [AI ML Engine] Advanced models initialized');
    } catch (error) {
      console.error('Failed to initialize ML models:', error);
    }
  }

  /**
   * Use OpenAI/Claude API for intelligent behavior analysis
   */
  public async analyzeUserBehaviorWithAI(
    interactions: UserInteraction[],
    sessionId: string
  ): Promise<BehaviorPattern> {
    const cacheKey = `behavior-analysis-${sessionId}`;
    
    return aiPerformanceOptimizer.memoize(cacheKey, async () => {
      try {
        const behaviorData = this.extractBehaviorFeatures(interactions);
        
        // Use AI API to analyze behavior patterns
        const aiAnalysis = await this.callAIBehaviorAPI(behaviorData);
        
        const pattern: BehaviorPattern = {
          patternType: aiAnalysis.primaryPattern,
          confidence: aiAnalysis.confidence,
          indicators: aiAnalysis.indicators,
          predictedActions: aiAnalysis.predictedActions,
          timeToConversion: aiAnalysis.timeToConversion,
          averageOrderValue: aiAnalysis.expectedOrderValue
        };

        this.userBehaviorPatterns.set(sessionId, pattern);
        
        console.log(`🧠 [AI Analysis] User pattern: ${pattern.patternType} (${Math.round(pattern.confidence * 100)}% confidence)`);
        
        return pattern;
      } catch (error) {
        console.error('AI behavior analysis failed:', error);
        return this.getFallbackBehaviorPattern(interactions);
      }
    }, 300000); // Cache for 5 minutes
  }

  /**
   * Call AI Behavior Analysis API route (uses configured AI providers)
   */
  private async callAIBehaviorAPI(behaviorData: any): Promise<any> {
    // Use our internal API route which handles multiple AI providers
    const response = await fetch('/api/ai/behavior-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        interactions: [], // Would include full interactions in real implementation
        sessionId: behaviorData.sessionId || 'anonymous',
        behaviorData // Pass pre-computed behavior data
      })
    });

    if (!response.ok) {
      throw new Error(`AI Behavior API call failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'AI analysis failed');
    }

    return data.analysis;
  }

  /**
   * Extract behavior features for AI analysis
   */
  private extractBehaviorFeatures(interactions: UserInteraction[]) {
    const now = Date.now();
    const sessionStart = Math.min(...interactions.map(i => i.timestamp));
    
    return {
      totalInteractions: interactions.length,
      pageVisits: interactions.filter(i => i.type === 'page_visit').length,
      avgHoverDuration: this.calculateAverageHoverDuration(interactions),
      cartActions: interactions.filter(i => i.type.includes('cart')).length,
      wishlistActions: interactions.filter(i => i.type.includes('wishlist')).length,
      quickBounces: interactions.filter(i => i.type === 'quick_bounce').length,
      sessionDuration: now - sessionStart,
      categories: this.extractViewedCategories(interactions),
      timePatterns: this.analyzeTimePatterns(interactions),
      sequencePatterns: this.analyzeSequencePatterns(interactions)
    };
  }

  /**
   * Collaborative Filtering - like Amazon's "Customers who bought X also bought Y"
   */
  public async buildCollaborativeFilteringMatrix(): Promise<void> {
    try {
      // In a real app, this would load from your order database
      // For now, we'll simulate with localStorage purchase history
      const purchaseHistory = this.loadPurchaseHistory();
      
      // Build user-item matrix
      const userItemMatrix = new Map<string, Map<string, number>>();
      
      purchaseHistory.forEach(purchase => {
        const userId = purchase.sessionId || 'anonymous';
        if (!userItemMatrix.has(userId)) {
          userItemMatrix.set(userId, new Map());
        }
        
        purchase.productIds.forEach(productId => {
          userItemMatrix.get(userId)!.set(productId, (purchase.orderValue || 1));
        });
      });

      // Calculate item-item similarity matrix using cosine similarity
      const items = Array.from(new Set(
        Array.from(userItemMatrix.values())
          .flatMap(userItems => Array.from(userItems.keys()))
      ));

      items.forEach(itemA => {
        if (!this.collaborativeMatrix.has(itemA)) {
          this.collaborativeMatrix.set(itemA, new Map());
        }
        
        items.forEach(itemB => {
          if (itemA !== itemB) {
            const similarity = this.calculateCosineSimilarity(itemA, itemB, userItemMatrix);
            if (similarity > 0.1) { // Only store meaningful similarities
              this.collaborativeMatrix.get(itemA)!.set(itemB, similarity);
            }
          }
        });
      });

      console.log(`🤝 [Collaborative Filtering] Built similarity matrix for ${items.length} products`);
    } catch (error) {
      console.error('Failed to build collaborative filtering matrix:', error);
    }
  }

  /**
   * Calculate cosine similarity between two items
   */
  private calculateCosineSimilarity(
    itemA: string, 
    itemB: string, 
    userItemMatrix: Map<string, Map<string, number>>
  ): number {
    const usersA = new Set<string>();
    const usersB = new Set<string>();
    
    userItemMatrix.forEach((items, userId) => {
      if (items.has(itemA)) usersA.add(userId);
      if (items.has(itemB)) usersB.add(userId);
    });

    const intersection = new Set([...usersA].filter(x => usersB.has(x)));
    const union = new Set([...usersA, ...usersB]);

    if (union.size === 0) return 0;
    
    // Cosine similarity
    const dotProduct = intersection.size;
    const magnitudeA = Math.sqrt(usersA.size);
    const magnitudeB = Math.sqrt(usersB.size);
    
    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Market Basket Analysis - Find products frequently bought together
   */
  public async performMarketBasketAnalysis(): Promise<void> {
    try {
      const purchaseHistory = this.loadPurchaseHistory();
      const transactions = purchaseHistory.map(p => p.productIds);
      
      if (transactions.length < 10) {
        console.log('📊 [Market Basket] Not enough transaction data');
        return;
      }

      // Find frequent itemsets using Apriori algorithm (simplified)
      const minSupport = 0.05; // 5% minimum support
      const minConfidence = 0.3; // 30% minimum confidence

      const itemCounts = new Map<string, number>();
      const pairCounts = new Map<string, number>();

      // Count single items and pairs
      transactions.forEach(transaction => {
        transaction.forEach(item => {
          itemCounts.set(item, (itemCounts.get(item) || 0) + 1);
        });

        // Count pairs
        for (let i = 0; i < transaction.length; i++) {
          for (let j = i + 1; j < transaction.length; j++) {
            const pair = [transaction[i], transaction[j]].sort().join('|');
            pairCounts.set(pair, (pairCounts.get(pair) || 0) + 1);
          }
        }
      });

      // Generate association rules
      this.marketBasketRules = [];
      
      pairCounts.forEach((pairCount, pair) => {
        const [itemA, itemB] = pair.split('|');
        const support = pairCount / transactions.length;
        
        if (support >= minSupport) {
          const confidenceAB = pairCount / (itemCounts.get(itemA) || 1);
          const confidenceBA = pairCount / (itemCounts.get(itemB) || 1);
          
          if (confidenceAB >= minConfidence) {
            this.marketBasketRules.push({
              antecedent: [itemA],
              consequent: [itemB],
              support,
              confidence: confidenceAB,
              lift: confidenceAB / ((itemCounts.get(itemB) || 1) / transactions.length)
            });
          }
          
          if (confidenceBA >= minConfidence) {
            this.marketBasketRules.push({
              antecedent: [itemB],
              consequent: [itemA],
              support,
              confidence: confidenceBA,
              lift: confidenceBA / ((itemCounts.get(itemA) || 1) / transactions.length)
            });
          }
        }
      });

      console.log(`📊 [Market Basket] Found ${this.marketBasketRules.length} association rules`);
    } catch (error) {
      console.error('Market basket analysis failed:', error);
    }
  }

  /**
   * Real-time sentiment analysis of user behavior
   */
  public async analyzeBehaviorSentiment(
    productId: string,
    interactions: UserInteraction[]
  ): Promise<SentimentScore> {
    const cacheKey = `sentiment-${productId}`;
    
    return aiPerformanceOptimizer.memoize(cacheKey, async () => {
      const productInteractions = interactions.filter(i => i.productId === productId);
      
      // Analyze behavior patterns for sentiment
      const behaviorMetrics = {
        avgHoverDuration: this.calculateAverageHoverDuration(productInteractions),
        bounceRate: productInteractions.filter(i => i.type === 'quick_bounce').length / Math.max(productInteractions.length, 1),
        engagementDepth: productInteractions.filter(i => ['page_visit', 'cart_add', 'wishlist_add'].includes(i.type)).length,
        timeSpent: productInteractions.reduce((sum, i) => sum + (i.duration || 0), 0),
        actionSequence: productInteractions.map(i => i.type).join('->')
      };

      // Use AI to analyze sentiment from behavior
      let sentiment: SentimentScore['sentiment'] = 'neutral';
      let confidence = 0.5;
      const emotions = { excitement: 0, hesitation: 0, interest: 0, frustration: 0 };
      const behaviorTriggers: string[] = [];

      // Rule-based sentiment analysis (can be enhanced with AI API)
      if (behaviorMetrics.avgHoverDuration > 3000 && behaviorMetrics.engagementDepth > 2) {
        sentiment = 'positive';
        confidence = 0.8;
        emotions.excitement = 0.7;
        emotions.interest = 0.9;
        behaviorTriggers.push('Long engagement time', 'Multiple interactions');
      } else if (behaviorMetrics.bounceRate > 0.7) {
        sentiment = 'negative';
        confidence = 0.6;
        emotions.frustration = 0.8;
        emotions.hesitation = 0.6;
        behaviorTriggers.push('High bounce rate', 'Quick exits');
      } else if (behaviorMetrics.engagementDepth > 0) {
        sentiment = 'positive';
        confidence = 0.6;
        emotions.interest = 0.7;
        behaviorTriggers.push('Engaged browsing');
      }

      const sentimentScore: SentimentScore = {
        productId,
        sentiment,
        confidence,
        emotions,
        behaviorTriggers
      };

      this.sentimentCache.set(productId, sentimentScore);
      return sentimentScore;
    }, 120000); // Cache for 2 minutes
  }

  /**
   * Generate enterprise-grade product recommendations
   */
  public async generateAdvancedRecommendations(
    userId: string,
    currentProductId: string,
    userBehavior: UserInteraction[]
  ): Promise<{ productId: string; score: number; reason: string; }[]> {
    const recommendations: { productId: string; score: number; reason: string; }[] = [];

    // 1. Collaborative Filtering recommendations
    const collaborativeRecs = this.getCollaborativeRecommendations(currentProductId);
    collaborativeRecs.forEach(rec => {
      recommendations.push({
        productId: rec.productId,
        score: rec.score * 0.4, // 40% weight
        reason: `Users who liked this also liked (${Math.round(rec.score * 100)}% similarity)`
      });
    });

    // 2. Market basket analysis recommendations
    const basketRecs = this.getMarketBasketRecommendations(currentProductId);
    basketRecs.forEach(rec => {
      recommendations.push({
        productId: rec.productId,
        score: rec.score * 0.3, // 30% weight
        reason: `Frequently bought together (${Math.round(rec.confidence * 100)}% confidence)`
      });
    });

    // 3. Behavior-based recommendations
    const behaviorPattern = this.userBehaviorPatterns.get(userId);
    if (behaviorPattern) {
      const behaviorRecs = await this.getBehaviorBasedRecommendations(behaviorPattern, userBehavior);
      behaviorRecs.forEach(rec => {
        recommendations.push({
          productId: rec.productId,
          score: rec.score * 0.3, // 30% weight
          reason: `Matches your ${behaviorPattern.patternType} shopping pattern`
        });
      });
    }

    // Aggregate and deduplicate recommendations
    const aggregated = new Map<string, { score: number; reasons: string[] }>();
    
    recommendations.forEach(rec => {
      if (!aggregated.has(rec.productId)) {
        aggregated.set(rec.productId, { score: 0, reasons: [] });
      }
      const current = aggregated.get(rec.productId)!;
      current.score += rec.score;
      current.reasons.push(rec.reason);
    });

    return Array.from(aggregated.entries())
      .map(([productId, data]) => ({
        productId,
        score: Math.min(data.score, 1), // Cap at 100%
        reason: data.reasons.join(' + ')
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 20); // Top 20 recommendations
  }

  /**
   * Enterprise-grade prediction scoring using comprehensive AI/ML techniques
   */
  public async calculateEnhancedPrediction(
    productId: string,
    interactions: UserInteraction[],
    sessionId: string
  ): Promise<ProductPrediction> {
    console.log('🤖 [AI ML Engine] Calculating enhanced prediction for', productId);
    
    // Get base prediction (existing logic)
    const baseScore = this.calculateBasePredictionScore(productId, interactions);
    
    // Apply comprehensive AI enhancements
    let enhancedScore = baseScore;
    const reasoningFactors: string[] = [];

    try {
      // 1. Advanced Behavior Pattern Analysis using AI APIs
      const behaviorPattern = await this.analyzeUserBehaviorWithAI(interactions, sessionId);
      const behaviorMultiplier = this.getBehaviorMultiplier(behaviorPattern, productId);
      enhancedScore *= behaviorMultiplier;
      
      if (behaviorMultiplier > 1.2) {
        reasoningFactors.push(`AI detected ${behaviorPattern.patternType} pattern (+${Math.round((behaviorMultiplier - 1) * 100)}%)`);
      }

      // 2. Real-time Sentiment Analysis
      const sentiment = await this.getAdvancedSentimentAnalysis(productId, interactions);
      if (sentiment && sentiment.sentiment === 'positive' && sentiment.confidence > 0.6) {
        const sentimentBoost = sentiment.confidence * 0.4;
        enhancedScore *= (1 + sentimentBoost);
        reasoningFactors.push(`Positive sentiment: ${Math.round(sentiment.confidence * 100)}% confidence (+${Math.round(sentimentBoost * 100)}%)`);
      }

      // 3. Advanced Collaborative Filtering
      const collabRecommendations = await this.getCollaborativeRecommendations(productId, sessionId, interactions);
      if (collabRecommendations.length > 0) {
        const avgCollabScore = collabRecommendations.reduce((sum, rec) => sum + rec.score, 0) / collabRecommendations.length;
        enhancedScore += avgCollabScore * 25;
        reasoningFactors.push(`Collaborative filtering: ${collabRecommendations.length} similar user patterns (+${Math.round(avgCollabScore * 25)} points)`);
      }

      // 4. Market Basket Analysis
      const basketScore = this.getMarketBasketScore(productId, interactions);
      if (basketScore > 0.3) {
        enhancedScore += basketScore * 20;
        reasoningFactors.push(`Market basket analysis: frequently bought together (+${Math.round(basketScore * 20)} points)`);
      }

      // 5. User Segmentation Boost
      const segmentationInsights = await this.getUserSegmentationBoost(sessionId, interactions);
      if (segmentationInsights.boost > 1.1) {
        enhancedScore *= segmentationInsights.boost;
        reasoningFactors.push(`${segmentationInsights.segment} segment match (+${Math.round((segmentationInsights.boost - 1) * 100)}%)`);
      }

      // 6. Demand Forecasting Intelligence
      const demandForecast = await this.getDemandForecastBoost(productId);
      if (demandForecast.multiplier !== 1.0) {
        enhancedScore *= demandForecast.multiplier;
        reasoningFactors.push(`Demand forecast: ${demandForecast.trend} trend (${demandForecast.multiplier > 1 ? '+' : ''}${Math.round((demandForecast.multiplier - 1) * 100)}%)`);
      }

    } catch (error) {
      console.error('🚨 [AI ML Engine] Enhancement failed, using base score:', error);
      reasoningFactors.push('AI enhancement partially failed - using statistical fallback');
    }

    // Ensure score stays within bounds
    enhancedScore = Math.max(0, Math.min(100, enhancedScore));

    console.log(`🎯 [AI ML Engine] Enhanced prediction: ${Math.round(baseScore)} → ${Math.round(enhancedScore)} (${reasoningFactors.length} AI factors)`);

    return {
      productId,
      score: enhancedScore,
      trend: enhancedScore > baseScore * 1.1 ? 'rising' : enhancedScore < baseScore * 0.9 ? 'falling' : 'stable',
      factors: {
        purchaseSignals: this.calculatePurchaseSignals(productId, interactions),
        viewFrequency: this.calculateViewFrequency(productId, interactions),
        hoverQuality: this.calculateHoverQuality(productId, interactions),
        cartSignals: this.calculateCartSignals(productId, interactions),
        wishlistSignals: this.calculateWishlistSignals(productId, interactions),
        timeSpent: this.calculateTimeSpent(productId, interactions),
        bounceRate: this.calculateBounceRate(productId, interactions),
        contextualRelevance: 50, // Base relevance
        temporalDecay: this.calculateTemporalDecay(interactions)
      },
      lastUpdated: Date.now(),
      confidence: this.determineConfidence(enhancedScore),
      reasoning: [
        `Enterprise AI/ML prediction (base: ${Math.round(baseScore)}%)`,
        ...reasoningFactors
      ]
    };
  }

  /**
   * Get advanced sentiment analysis from API
   */
  private async getAdvancedSentimentAnalysis(productId: string, interactions: UserInteraction[]) {
    try {
      const response = await fetch('/api/ai/sentiment-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          interactions,
          context: 'prediction_enhancement',
          realtime: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.sentiment;
      }
    } catch (error) {
      console.warn('Advanced sentiment analysis failed:', error);
    }
    return null;
  }

  /**
   * Get collaborative filtering recommendations from API
   */
  private async getCollaborativeRecommendations(productId: string, userId: string, interactions: UserInteraction[]) {
    try {
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          currentProductId: productId,
          userBehavior: interactions,
          context: 'prediction_enhancement',
          limit: 5
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.recommendations.filter((rec: any) => rec.type === 'collaborative' || rec.type === 'hybrid');
      }
    } catch (error) {
      console.warn('Collaborative recommendations failed:', error);
    }
    return [];
  }

  /**
   * Get user segmentation boost from API
   */
  private async getUserSegmentationBoost(sessionId: string, interactions: UserInteraction[]) {
    try {
      const response = await fetch('/api/ai/user-segmentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: sessionId,
          userBehavior: interactions
        })
      });

      if (response.ok) {
        const data = await response.json();
        const segment = data.segmentation.user_cluster;
        
        // Apply segment-specific boosts
        const segmentBoosts: Record<string, number> = {
          'impulse_buyers': 1.3, // 30% boost for impulse buyers
          'loyal_customers': 1.4, // 40% boost for loyal customers
          'researchers': 1.1, // 10% boost for researchers
          'bargain_hunters': 0.9, // 10% reduction for price-sensitive users
          'casual_browsers': 0.8 // 20% reduction for casual browsers
        };
        
        return {
          segment: segment.name,
          boost: segmentBoosts[segment.segmentId] || 1.0
        };
      }
    } catch (error) {
      console.warn('User segmentation boost failed:', error);
    }
    return { segment: 'unknown', boost: 1.0 };
  }

  /**
   * Get demand forecasting boost from API
   */
  private async getDemandForecastBoost(productId: string) {
    try {
      const response = await fetch('/api/ai/demand-forecasting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productIds: [productId],
          timeHorizon: 7, // 7 day forecast
          granularity: 'daily',
          includeSeasonality: true,
          includeExternalFactors: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        const forecast = data.forecasts[0];
        
        if (forecast && forecast.insights) {
          const trendMultipliers: Record<string, number> = {
            'increasing': 1.2, // 20% boost for increasing demand
            'stable': 1.0, // No change for stable demand
            'decreasing': 0.85 // 15% reduction for decreasing demand
          };
          
          return {
            trend: forecast.insights.trend_direction,
            multiplier: trendMultipliers[forecast.insights.trend_direction] || 1.0
          };
        }
      }
    } catch (error) {
      console.warn('Demand forecast boost failed:', error);
    }
    return { trend: 'stable', multiplier: 1.0 };
  }

  /**
   * Calculate purchase signals factor
   */
  private calculatePurchaseSignals(productId: string, interactions: UserInteraction[]): number {
    const purchases = interactions.filter(i => i.productId === productId && i.type === 'purchase').length;
    return purchases * 100; // 100 points per purchase
  }

  // Helper methods (implementations would go here)
  private calculateBasePredictionScore(productId: string, interactions: UserInteraction[]): number {
    // Simplified base calculation - would use existing logic
    const productInteractions = interactions.filter(i => i.productId === productId);
    return Math.min(productInteractions.length * 10, 80);
  }

  private getBehaviorMultiplier(pattern: BehaviorPattern, productId: string): number {
    // Different multipliers based on behavior patterns
    switch (pattern.patternType) {
      case 'impulse_buyer': return 1.5; // Impulse buyers convert faster
      case 'researcher': return 1.2; // Researchers eventually buy after research
      case 'price_sensitive': return 0.9; // Need deals to convert
      case 'brand_loyal': return 1.8; // Very likely to buy preferred brands
      default: return 1.0;
    }
  }

  private getCollaborativeFilteringScore(productId: string, interactions: UserInteraction[]): number {
    const similarities = this.collaborativeMatrix.get(productId);
    if (!similarities) return 0;

    // Get products user has interacted with
    const userProducts = new Set(interactions.map(i => i.productId));
    let totalScore = 0;
    let count = 0;

    similarities.forEach((similarity, otherProductId) => {
      if (userProducts.has(otherProductId)) {
        totalScore += similarity;
        count++;
      }
    });

    return count > 0 ? totalScore / count : 0;
  }

  private getMarketBasketScore(productId: string, interactions: UserInteraction[]): number {
    const userProducts = new Set(interactions.map(i => i.productId));
    let bestScore = 0;

    this.marketBasketRules.forEach(rule => {
      if (rule.consequent.includes(productId)) {
        const hasAntecedent = rule.antecedent.every(item => userProducts.has(item));
        if (hasAntecedent) {
          bestScore = Math.max(bestScore, rule.confidence);
        }
      }
    });

    return bestScore;
  }

  // Additional helper methods would be implemented here...
  private calculateAverageHoverDuration(interactions: UserInteraction[]): number {
    const hoverDurations = interactions
      .filter(i => i.type === 'hover_end' && i.duration)
      .map(i => i.duration!);
    
    return hoverDurations.length > 0 
      ? hoverDurations.reduce((sum, dur) => sum + dur, 0) / hoverDurations.length 
      : 0;
  }

  private extractViewedCategories(interactions: UserInteraction[]): string[] {
    // Would extract product categories from viewed products
    return ['example-category'];
  }

  private analyzeTimePatterns(interactions: UserInteraction[]): any {
    // Would analyze timing patterns in user behavior
    return {};
  }

  private analyzeSequencePatterns(interactions: UserInteraction[]): any {
    // Would analyze sequence patterns in user actions
    return {};
  }

  private parseAIResponse(content: string): any {
    // Fallback parser for non-JSON AI responses
    return {
      primaryPattern: 'researcher',
      confidence: 0.5,
      indicators: ['Mixed behavior signals'],
      predictedActions: ['continue browsing'],
      timeToConversion: 60,
      expectedOrderValue: 50
    };
  }

  private getFallbackBehaviorPattern(interactions: UserInteraction[]): BehaviorPattern {
    return {
      patternType: 'researcher',
      confidence: 0.5,
      indicators: ['Insufficient data for AI analysis'],
      predictedActions: ['continue browsing'],
      timeToConversion: 60,
      averageOrderValue: 50
    };
  }

  private loadPurchaseHistory(): any[] {
    try {
      if (typeof window === 'undefined') return [];
      const history = localStorage.getItem('ai_purchase_history');
      return history ? JSON.parse(history) : [];
    } catch {
      return [];
    }
  }

  private getCollaborativeRecommendations(productId: string): { productId: string; score: number }[] {
    const similarities = this.collaborativeMatrix.get(productId);
    if (!similarities) return [];

    return Array.from(similarities.entries())
      .map(([id, score]) => ({ productId: id, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  private getMarketBasketRecommendations(productId: string): { productId: string; score: number; confidence: number }[] {
    return this.marketBasketRules
      .filter(rule => rule.antecedent.includes(productId))
      .map(rule => ({
        productId: rule.consequent[0],
        score: rule.lift,
        confidence: rule.confidence
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  private async getBehaviorBasedRecommendations(
    pattern: BehaviorPattern,
    interactions: UserInteraction[]
  ): Promise<{ productId: string; score: number }[]> {
    // Would implement behavior-based recommendations
    return [];
  }

  private calculateViewFrequency(productId: string, interactions: UserInteraction[]): number {
    return interactions.filter(i => i.productId === productId && i.type === 'view').length * 10;
  }

  private calculateHoverQuality(productId: string, interactions: UserInteraction[]): number {
    const hovers = interactions.filter(i => i.productId === productId && i.type === 'hover_end');
    const avgDuration = hovers.length > 0 
      ? hovers.reduce((sum, h) => sum + (h.duration || 0), 0) / hovers.length 
      : 0;
    return Math.min(avgDuration / 100, 50); // Scale to 0-50 points
  }

  private calculateCartSignals(productId: string, interactions: UserInteraction[]): number {
    const adds = interactions.filter(i => i.productId === productId && i.type === 'cart_add').length;
    const removes = interactions.filter(i => i.productId === productId && i.type === 'cart_remove').length;
    return (adds * 40) - (removes * 20);
  }

  private calculateWishlistSignals(productId: string, interactions: UserInteraction[]): number {
    const adds = interactions.filter(i => i.productId === productId && i.type === 'wishlist_add').length;
    const removes = interactions.filter(i => i.productId === productId && i.type === 'wishlist_remove').length;
    return (adds * 30) - (removes * 15);
  }

  private calculateTimeSpent(productId: string, interactions: UserInteraction[]): number {
    return interactions
      .filter(i => i.productId === productId)
      .reduce((sum, i) => sum + (i.duration || 0), 0) / 1000; // Convert to seconds
  }

  private calculateBounceRate(productId: string, interactions: UserInteraction[]): number {
    const productInteractions = interactions.filter(i => i.productId === productId);
    const bounces = productInteractions.filter(i => i.type === 'quick_bounce').length;
    return productInteractions.length > 0 ? (bounces / productInteractions.length) * 100 : 0;
  }

  private calculateTemporalDecay(interactions: UserInteraction[]): number {
    const now = Date.now();
    const avgAge = interactions.reduce((sum, i) => sum + (now - i.timestamp), 0) / interactions.length;
    const hoursAge = avgAge / (1000 * 60 * 60);
    return Math.pow(0.95, hoursAge); // Decay factor
  }

  private determineConfidence(score: number): ProductPrediction['confidence'] {
    if (score >= 85) return 'very_high';
    if (score >= 70) return 'high';
    if (score >= 50) return 'medium';
    if (score >= 30) return 'low';
    return 'very_low';
  }
}

// Export singleton instance
export const aiMLEngine = AdvancedAIMLEngine.getInstance();
export default aiMLEngine;