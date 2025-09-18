"use client";

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { shopifyDataContext } from '@/lib/services/shopify-data-context';
import { aiPerformanceOptimizer } from '@/lib/services/ai-performance-optimizer';
import { aiMLEngine } from '@/lib/services/ai-ml-engine';

// Types for our AI prediction system
export interface UserInteraction {
  productId: string;
  type: 'hover_start' | 'hover_end' | 'view' | 'cart_add' | 'cart_remove' | 'wishlist_add' | 'wishlist_remove' | 'purchase' | 'page_visit' | 'scroll_past' | 'quick_bounce';
  timestamp: number;
  duration?: number; // For hover events
  context?: string; // page context
  sessionId: string;
  metadata?: {
    // Additional tracking data
    scrollSpeed?: number;
    timeOnPage?: number;
    previousAction?: string;
    interactionDepth?: number; // How many times they've interacted with this product
    orderId?: string; // For purchase tracking
    orderValue?: number; // Purchase amount
    quantity?: number; // Items purchased
  };
}

export interface ProductPrediction {
  productId: string;
  score: number; // 0-100 prediction confidence
  trend: 'rising' | 'falling' | 'stable'; // Current trend direction
  factors: {
    purchaseSignals: number; // Past purchase history - ultimate signal
    viewFrequency: number; // How often they view this product
    hoverQuality: number; // Quality of hover interactions (positive/negative)
    cartSignals: number; // Cart-related signals
    wishlistSignals: number; // Wishlist signals
    timeSpent: number; // Total time spent on product
    bounceRate: number; // How often they leave without action
    contextualRelevance: number; // Based on current search/category context
    temporalDecay: number; // How recent the interactions are
  };
  lastUpdated: number;
  confidence: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  reasoning: string[];
}

export interface SessionMetrics {
  sessionId: string;
  startTime: number;
  pageViews: number;
  totalTimeSpent: number;
  productInteractions: number;
  conversionEvents: number; // cart adds, wishlist adds
  abandonmentEvents: number; // hovers without action
  searchQueries: string[];
  categoryFocus: Map<string, number>;
}

// Enhanced AI data structures
export interface AIRecommendation {
  productId: string;
  score: number;
  reason: string;
  type: 'collaborative' | 'market_basket' | 'behavioral' | 'hybrid';
  confidence: number;
  source: string;
}

export interface UserSegmentation {
  segmentId: string;
  name: string;
  confidence: number;
  characteristics: string[];
  marketingStrategy: {
    messaging: string;
    timing: string;
    incentives: string[];
  };
  lastUpdated: number;
}

export interface SentimentAnalysis {
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
  recommendations: string[];
  lastUpdated: number;
}

export interface DemandForecast {
  productId: string;
  predictions: Array<{
    date: string;
    predicted_demand: number;
    confidence_interval: { lower: number; upper: number };
  }>;
  trend_direction: 'increasing' | 'decreasing' | 'stable';
  peak_periods: string[];
  accuracy: number;
  lastUpdated: number;
}

export interface BehaviorPattern {
  patternType: 'impulse_buyer' | 'researcher' | 'price_sensitive' | 'brand_loyal' | 'seasonal' | 'bulk_buyer';
  confidence: number;
  indicators: string[];
  predictedActions: string[];
  timeToConversion?: number;
  averageOrderValue?: number;
  lastAnalyzed: number;
}

interface AIPredictionState {
  // Core behavioral data
  interactions: UserInteraction[];
  predictions: Map<string, ProductPrediction>;
  sessionMetrics: SessionMetrics;
  
  // Advanced AI data
  userSegmentation: UserSegmentation | null;
  behaviorPattern: BehaviorPattern | null;
  recommendations: AIRecommendation[];
  sentimentAnalysis: Map<string, SentimentAnalysis>;
  demandForecasts: Map<string, DemandForecast>;
  
  // AI capabilities status
  aiCapabilities: {
    behaviorAnalysis: boolean;
    collaborativeFiltering: boolean;
    sentimentAnalysis: boolean;
    marketBasketAnalysis: boolean;
    demandForecasting: boolean;
    userSegmentation: boolean;
  };
  
  // Performance optimization
  isProcessing: boolean;
  lastCalculation: number;
  aiProcessingStatus: {
    behaviorAnalysis: 'idle' | 'processing' | 'completed' | 'failed';
    recommendations: 'idle' | 'processing' | 'completed' | 'failed';
    sentiment: 'idle' | 'processing' | 'completed' | 'failed';
    segmentation: 'idle' | 'processing' | 'completed' | 'failed';
  };
  
  // Context tracking
  currentPage: string;
  currentProduct?: string;
  searchContext?: string;
  
  // Enhanced Actions
  trackInteraction: (interaction: Omit<UserInteraction, 'timestamp' | 'sessionId'>) => void;
  trackPurchase: (productIds: string[], orderId: string, orderValue: number) => void;
  calculatePredictions: () => void;
  
  // AI-powered methods
  analyzeUserBehavior: () => Promise<void>;
  generateRecommendations: (context: string, productId?: string) => Promise<void>;
  analyzeSentiment: (productId: string) => Promise<void>;
  updateUserSegmentation: () => Promise<void>;
  forecastDemand: (productIds: string[]) => Promise<void>;
  
  // Data retrieval
  getPredictionsForContext: (context?: string, limit?: number) => ProductPrediction[];
  getTopPredictions: (limit?: number) => ProductPrediction[];
  getRecommendations: (limit?: number) => AIRecommendation[];
  getSentimentForProduct: (productId: string) => SentimentAnalysis | null;
  getUserSegment: () => UserSegmentation | null;
  getBehaviorPattern: () => BehaviorPattern | null;
  getDemandForecast: (productId: string) => DemandForecast | null;
  
  // Utilities
  clearOldData: () => void;
  getAIInsights: () => {
    totalInsights: number;
    behaviorConfidence: number;
    segmentationAccuracy: number;
    recommendationStrength: number;
    overallAIHealth: 'excellent' | 'good' | 'fair' | 'poor';
  };
  
  // Real-time updates (AI Brain only)
  startRealtimeCalculation: () => void;
  stopRealtimeCalculation: () => void;
}

// Advanced AI calculation logic
class PredictionEngine {
  private static readonly WEIGHTS = {
    PURCHASE_SIGNALS: 0.40, // NEW: Past purchases are the ultimate signal
    CART_SIGNALS: 0.25, // Cart additions are second most important
    VIEW_FREQUENCY: 0.15, // Page visits still important but less than purchases
    WISHLIST_SIGNALS: 0.12, // Reduced to make room for purchase signals
    HOVER_QUALITY: 0.08, // Further reduced - least reliable signal
    TIME_SPENT: 0.06,
    BOUNCE_RATE: -0.10, // Negative impact
    CONTEXTUAL_RELEVANCE: 0.08,
    TEMPORAL_DECAY: 0.08
  };

  private static readonly THRESHOLDS = {
    HOVER_MIN_DURATION: 300, // Minimum hover to be considered intentional
    HOVER_QUALITY_THRESHOLD: 1500, // Good hover duration
    HOVER_EXCELLENT_THRESHOLD: 4000, // Excellent hover duration
    BOUNCE_THRESHOLD: 2, // Number of quick bounces before negative impact
    BOUNCE_DURATION: 200, // Duration under this is considered a bounce
    SCROLL_PAST_PENALTY: 5, // Penalty for scrolling past without interaction
    DECAY_FACTOR: 0.96, // How much older interactions matter (higher = slower decay)
    TREND_SENSITIVITY: 3, // Points needed to change trend (lower = more sensitive)
    INTERACTION_DEPTH_BOOST: 1.2, // Multiplier for repeated interactions
    PAGE_VISIT_MULTIPLIER: 2.0 // Multiple page visits boost
  };

  static async calculateProductPrediction(
    productId: string, 
    interactions: UserInteraction[], 
    sessionMetrics: SessionMetrics,
    existingPrediction?: ProductPrediction
  ): Promise<ProductPrediction> {
    // Create cache key based on interaction signatures to avoid redundant calculations
    const interactionSignature = interactions
      .filter(i => i.productId === productId)
      .map(i => `${i.type}-${i.timestamp}-${i.duration || 0}`)
      .join('|');
    
    const cacheKey = `prediction-${productId}-${interactionSignature.slice(-100)}`; // Limit key length
    
    // Try to get from cache first - now async for AI integration
    return aiPerformanceOptimizer.memoize(cacheKey, async () => {
      const productInteractions = interactions.filter(i => i.productId === productId);
      const now = Date.now();
    
    // Initialize factors with new purchase tracking
    const factors = {
      purchaseSignals: 0, // NEW: Track past purchases
      viewFrequency: 0,
      hoverQuality: 0,
      cartSignals: 0,
      wishlistSignals: 0,
      timeSpent: 0,
      bounceRate: 0,
      contextualRelevance: 0,
      temporalDecay: 1
    };

    // Calculate view frequency with intelligence
    const views = productInteractions.filter(i => i.type === 'view' || i.type === 'page_visit');
    factors.viewFrequency = Math.min(views.length * 10, 50); // Cap at 50 points
    
    // Major boost for product page visits - these are the strongest signals
    const pageVisits = productInteractions.filter(i => i.type === 'page_visit');
    factors.viewFrequency += pageVisits.length * 25; // Much stronger signal than hovers
    
    // Extra boost for multiple visits to same product page  
    if (pageVisits.length > 1) {
      factors.viewFrequency += (pageVisits.length - 1) * 20; // Escalating bonus
    }

    // Calculate hover quality with sophisticated intelligence
    const hoverStarts = productInteractions.filter(i => i.type === 'hover_start');
    const hoverEnds = productInteractions.filter(i => i.type === 'hover_end');
    const quickBounces = productInteractions.filter(i => i.type === 'quick_bounce');
    
    let totalHoverTime = 0;
    let excellentHovers = 0; // Long, thoughtful hovers
    let qualityHovers = 0; // Good hovers
    let bounceHovers = 0; // Quick bounces
    let interactionDepth = 0;
    
    // Process hover pairs and analyze patterns
    for (let i = 0; i < hoverStarts.length; i++) {
      const start = hoverStarts[i];
      const end = hoverEnds.find(e => e.timestamp > start.timestamp && 
        Math.abs(e.timestamp - start.timestamp) < 30000); // Within 30 seconds
      
      if (end) {
        const duration = end.timestamp - start.timestamp;
        totalHoverTime += duration;
        interactionDepth++;
        
        if (duration >= this.THRESHOLDS.HOVER_EXCELLENT_THRESHOLD) {
          excellentHovers++; // Excellent engagement
        } else if (duration >= this.THRESHOLDS.HOVER_QUALITY_THRESHOLD) {
          qualityHovers++; // Good hover
        } else if (duration < this.THRESHOLDS.BOUNCE_DURATION) {
          bounceHovers++; // Quick bounce - negative signal
        }
      }
    }
    
    // Add penalty for quick bounces without corresponding end events
    bounceHovers += quickBounces.length;
    
    // Calculate interaction depth boost
    const depthMultiplier = interactionDepth > 1 ? 
      Math.min(this.THRESHOLDS.INTERACTION_DEPTH_BOOST * interactionDepth, 2.5) : 1;
    
    // Calculate hover quality score with intelligence
    let hoverScore = (excellentHovers * 35) + (qualityHovers * 20) - (bounceHovers * 12);
    
    // Apply bounce penalty if there's a pattern of quick exits
    if (bounceHovers >= this.THRESHOLDS.BOUNCE_THRESHOLD) {
      hoverScore -= (bounceHovers - this.THRESHOLDS.BOUNCE_THRESHOLD) * 15; // Escalating penalty
    }
    
    // Apply depth multiplier for repeated engagement
    hoverScore *= depthMultiplier;
    
    factors.hoverQuality = hoverScore;
    factors.timeSpent = Math.min(totalHoverTime / 1000, 40); // Increased cap for more engagement

    // Purchase signals (ULTIMATE indicators) - past purchases predict future purchases
    const purchases = productInteractions.filter(i => i.type === 'purchase').length;
    factors.purchaseSignals = purchases * 100; // Massive score for past purchases
    
    // Recent purchases get temporal boost (returning customers love repurchasing)
    const recentPurchases = productInteractions.filter(i => 
      i.type === 'purchase' && (now - i.timestamp) < 2592000000 // Last 30 days
    ).length;
    if (recentPurchases > 0) {
      factors.purchaseSignals += recentPurchases * 50; // Extra boost for recent purchases
    }
    
    // Cart signals (very strong indicators) - cart adds are serious intent
    const cartAdds = productInteractions.filter(i => i.type === 'cart_add').length;
    const cartRemoves = productInteractions.filter(i => i.type === 'cart_remove').length;
    factors.cartSignals = (cartAdds * 60) - (cartRemoves * 45); // Higher bonus for cart adds
    
    // Apply massive negative decay for recent cart removals
    const recentCartRemovals = productInteractions.filter(i => 
      i.type === 'cart_remove' && (now - i.timestamp) < 300000 // Last 5 minutes
    ).length;
    if (recentCartRemovals > 0) {
      factors.cartSignals -= recentCartRemovals * 35; // Huge penalty for recent cart removals
    }
    
    // Wishlist signals (strong indicators) - removal should nearly cancel the add
    const wishlistAdds = productInteractions.filter(i => i.type === 'wishlist_add').length;
    const wishlistRemoves = productInteractions.filter(i => i.type === 'wishlist_remove').length;
    factors.wishlistSignals = (wishlistAdds * 30) - (wishlistRemoves * 35); // Removal penalty > add bonus
    
    // Apply strong negative decay for recent removals
    const recentRemovals = productInteractions.filter(i => 
      i.type === 'wishlist_remove' && (now - i.timestamp) < 300000 // Last 5 minutes
    ).length;
    if (recentRemovals > 0) {
      factors.wishlistSignals -= recentRemovals * 25; // Heavy penalty for recent removals
    }

    // Calculate bounce rate (negative indicator)
    const totalInteractions = productInteractions.length;
    const actionableInteractions = productInteractions.filter(i => 
      ['cart_add', 'wishlist_add', 'purchase'].includes(i.type)
    ).length;
    
    if (totalInteractions > 3 && actionableInteractions === 0) {
      factors.bounceRate = Math.min(totalInteractions * 5, 25); // Penalty for multiple interactions without action
    }

    // Temporal decay - recent interactions matter more
    const avgAge = productInteractions.reduce((sum, i) => sum + (now - i.timestamp), 0) / 
                   Math.max(productInteractions.length, 1);
    const hoursSinceAvg = avgAge / (1000 * 60 * 60);
    factors.temporalDecay = Math.pow(this.THRESHOLDS.DECAY_FACTOR, hoursSinceAvg);

    // Contextual relevance (boost if currently viewing related products)
    // This would be enhanced with actual product data
    factors.contextualRelevance = 10; // Base relevance

    // Calculate final score using weighted factors (purchases dominate)
    let score = 0;
    score += factors.purchaseSignals * this.WEIGHTS.PURCHASE_SIGNALS; // NEW: Purchases are 40% of score
    score += factors.viewFrequency * this.WEIGHTS.VIEW_FREQUENCY;
    score += factors.hoverQuality * this.WEIGHTS.HOVER_QUALITY;
    score += factors.cartSignals * this.WEIGHTS.CART_SIGNALS;
    score += factors.wishlistSignals * this.WEIGHTS.WISHLIST_SIGNALS;
    score += factors.timeSpent * this.WEIGHTS.TIME_SPENT;
    score += factors.bounceRate * this.WEIGHTS.BOUNCE_RATE; // This is negative
    score += factors.contextualRelevance * this.WEIGHTS.CONTEXTUAL_RELEVANCE;
    score *= factors.temporalDecay; // Apply decay multiplier

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));

    // Determine trend
    let trend: 'rising' | 'falling' | 'stable' = 'stable';
    if (existingPrediction) {
      const scoreDiff = score - existingPrediction.score;
      if (Math.abs(scoreDiff) >= this.THRESHOLDS.TREND_SENSITIVITY) {
        trend = scoreDiff > 0 ? 'rising' : 'falling';
      }
    }

    // Determine confidence level
    let confidence: ProductPrediction['confidence'] = 'low';
    if (score >= 80) confidence = 'very_high';
    else if (score >= 60) confidence = 'high';
    else if (score >= 40) confidence = 'medium';
    else if (score >= 20) confidence = 'low';
    else confidence = 'very_low';

    // Generate reasoning with purchase priority
    const reasoning = [];
    if (factors.purchaseSignals > 50) reasoning.push('RETURNING CUSTOMER: Has purchased this product before!');
    if (factors.purchaseSignals > 0) reasoning.push('Past purchase history indicates high likelihood to repurchase');
    if (factors.cartSignals > 30) reasoning.push('Strong cart activity shows serious purchase intent');
    if (factors.viewFrequency > 30) reasoning.push('High view frequency indicates strong interest');
    if (factors.wishlistSignals > 15) reasoning.push('Wishlist activity shows future purchase intent');
    if (factors.hoverQuality > 20) reasoning.push('Quality hover interactions show consideration');
    if (factors.bounceRate > 10) reasoning.push('Multiple interactions without action may indicate hesitation');
    if (pageVisits.length > 2) reasoning.push('Multiple product page visits show high interest');
    if (trend === 'rising') reasoning.push('Interest is trending upward');
    if (trend === 'falling') reasoning.push('Interest appears to be declining');

    // AI-FIRST APPROACH: Always use AI when available - AI makes ALL decisions
    // Check if any AI API key is configured (these need to be set in .env.local)
    const hasAICapabilities = typeof window !== 'undefined' && 
                             (process.env.NEXT_PUBLIC_AI_BEHAVIOR_ANALYSIS === 'true' ||
                              process.env.NEXT_PUBLIC_OPENAI_API_KEY || 
                              process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || 
                              process.env.NEXT_PUBLIC_AI_API_KEY);
    
    if (hasAICapabilities) {
      try {
        // Enterprise AI/ML engine drives ALL predictions
        console.log('🧠 [AI Engine] Enterprise AI prediction for', productId);
        const aiPrediction = await aiMLEngine.calculateEnhancedPrediction(
          productId,
          interactions,
          sessionMetrics.sessionId
        );
        
        // AI prediction successful - this is the primary path
        console.log(`🎯 [AI Engine] AI prediction complete: ${Math.round(aiPrediction.score)}% confidence`);
        return aiPrediction;
        
      } catch (error) {
        console.error('❌ [AI Engine] AI prediction failed, using statistical fallback:', error);
        // Continue to statistical fallback only if AI completely fails
      }
    } else {
      console.log('⚠️ [AI Engine] No AI capabilities configured - using statistical mode');
    }
    
    // Base prediction (existing logic)
    return {
      productId,
      score,
      trend,
      factors,
      lastUpdated: now,
      confidence,
      reasoning: [
        ...reasoning,
        hasAICapabilities ? 'AI prediction failed - statistical fallback' : 'Statistical prediction (AI disabled)'
      ]
    };
    }); // Close memoize function
  }
}

// Create the high-performance Zustand store
export const useAIPredictionStore = create<AIPredictionState>()(
  subscribeWithSelector(
    immer((set, get) => {
      let realtimeInterval: NodeJS.Timeout | null = null;
      
      return {
        // Core behavioral state
        interactions: [],
        predictions: new Map(),
        sessionMetrics: {
          sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          startTime: Date.now(),
          pageViews: 0,
          totalTimeSpent: 0,
          productInteractions: 0,
          conversionEvents: 0,
          abandonmentEvents: 0,
          searchQueries: [],
          categoryFocus: new Map()
        },
        
        // Advanced AI state
        userSegmentation: null,
        behaviorPattern: null,
        recommendations: [],
        sentimentAnalysis: new Map(),
        demandForecasts: new Map(),
        
        // AI capabilities detection
        aiCapabilities: {
          behaviorAnalysis: !!(process.env.NEXT_PUBLIC_AI_BEHAVIOR_ANALYSIS === 'true' || process.env.AI_API_KEY),
          collaborativeFiltering: !!(process.env.NEXT_PUBLIC_AI_COLLABORATIVE_FILTERING === 'true' || process.env.AI_API_KEY),
          sentimentAnalysis: !!(process.env.NEXT_PUBLIC_AI_SENTIMENT_ANALYSIS === 'true' || process.env.AI_API_KEY),
          marketBasketAnalysis: !!(process.env.NEXT_PUBLIC_AI_MARKET_BASKET_ANALYSIS === 'true' || process.env.AI_API_KEY),
          demandForecasting: !!(process.env.NEXT_PUBLIC_AI_TIME_SERIES_FORECASTING === 'true' || process.env.AI_API_KEY),
          userSegmentation: !!(process.env.NEXT_PUBLIC_AI_USER_SEGMENTATION === 'true' || process.env.AI_API_KEY)
        },
        
        // Processing state
        isProcessing: false,
        lastCalculation: 0,
        aiProcessingStatus: {
          behaviorAnalysis: 'idle',
          recommendations: 'idle',
          sentiment: 'idle',
          segmentation: 'idle'
        },
        
        // Context
        currentPage: '',

        // Track purchases - the ultimate conversion event
        trackPurchase: (productIds, orderId, orderValue) => {
          set((state) => {
            const timestamp = Date.now();
            const valuePerProduct = orderValue / productIds.length;
            
            productIds.forEach(productId => {
              const fullInteraction: UserInteraction = {
                productId,
                type: 'purchase',
                timestamp,
                sessionId: state.sessionMetrics.sessionId,
                context: 'checkout',
                metadata: {
                  orderId,
                  orderValue: valuePerProduct,
                  quantity: 1 // Could be enhanced to track actual quantities
                }
              };

              state.interactions.push(fullInteraction);
              state.sessionMetrics.conversionEvents++;
            });

            console.log('🛒💰 [AI Store] PURCHASE TRACKED:', {
              products: productIds.length,
              orderId,
              orderValue,
              timestamp
            });

            // Save to localStorage for returning customer data
            if (typeof window !== 'undefined') {
              PurchaseHistoryManager.savePurchaseHistory(productIds, orderId, orderValue);
            }

            // Force immediate recalculation for purchases (ultimate signal)
            setTimeout(() => {
              useAIPredictionStore.getState().calculatePredictions();
            }, 100);
          });
        },

        // Track interactions with high performance
        trackInteraction: (interaction) => {
          set((state) => {
            const fullInteraction: UserInteraction = {
              ...interaction,
              timestamp: Date.now(),
              sessionId: state.sessionMetrics.sessionId
            };

            // Add interaction
            state.interactions.push(fullInteraction);
            
            // Update session metrics
            state.sessionMetrics.productInteractions++;
            
            if (['cart_add', 'wishlist_add'].includes(interaction.type)) {
              state.sessionMetrics.conversionEvents++;
            }
            
            if (interaction.type === 'hover_end' && interaction.duration && interaction.duration < 500) {
              state.sessionMetrics.abandonmentEvents++;
            }

            // Track search queries
            if (interaction.context === 'search' && interaction.metadata?.searchQuery) {
              if (!state.sessionMetrics.searchQueries.includes(interaction.metadata.searchQuery)) {
                state.sessionMetrics.searchQueries.push(interaction.metadata.searchQuery);
              }
            }

            // For critical state changes (cart/wishlist removals), force immediate recalculation
            // This ensures the AI Brain shows accurate data immediately
            if (['cart_remove', 'wishlist_remove'].includes(interaction.type)) {
              // Force immediate recalculation for removed items to show accurate predictions
              setTimeout(() => {
                get().calculatePredictions();
              }, 100); // Small delay to batch multiple removals
            }
            
            // Emit events for real-time monitoring dashboard updates
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('ai-interaction-tracked', {
                detail: {
                  type: interaction.type,
                  productId: interaction.productId,
                  context: interaction.context,
                  timestamp: fullInteraction.timestamp,
                  duration: interaction.duration
                }
              }));
            }

            console.log('🧠 [AI Store] Tracked interaction:', {
              type: interaction.type,
              productId: interaction.productId,
              context: interaction.context,
              timestamp: fullInteraction.timestamp
            });
          });
        },

        // Ultra-high-performance prediction calculation with AI/ML optimization
        calculatePredictions: aiPerformanceOptimizer.debounce(async () => {
          const state = get();
          if (state.isProcessing) return; // Prevent concurrent calculations

          set((draft) => {
            draft.isProcessing = true;
          });

          // Use batched calculation for optimal performance (now async)
          aiPerformanceOptimizer.batchCalculation('main-predictions', async () => {
            const { interactions, sessionMetrics, predictions } = get();
            const now = Date.now();
            
            // Get unique product IDs from interactions
            const productIds = [...new Set(interactions.map(i => i.productId))];
            
            // Only recalculate if there are meaningful changes
            const significantChanges = interactions.filter(i => 
              ['cart_add', 'cart_remove', 'wishlist_add', 'wishlist_remove', 'page_visit'].includes(i.type) &&
              (now - i.timestamp) < 5000 // Only recent high-impact changes
            );

            if (significantChanges.length === 0 && predictions.size > 0 && (now - state.lastCalculation) < 15000) {
              set((draft) => { draft.isProcessing = false; });
              return; // Skip calculation if no significant changes
            }
            
            const newPredictions = new Map<string, ProductPrediction>();
            
            // Batch process products for optimal performance (now async for AI)
            const processInBatches = await aiPerformanceOptimizer.batchOperation(
              productIds,
              async (batch: string[]) => {
                const results = [];
                for (const productId of batch) {
                  const existingPrediction = predictions.get(productId);
                  
                  // Skip calculation if no new interactions for this product
                  const recentInteractions = interactions.filter(i => 
                    i.productId === productId && (now - i.timestamp) < 60000 // Last minute
                  );
                  
                  if (recentInteractions.length === 0 && existingPrediction && 
                      (now - existingPrediction.lastUpdated) < 30000) {
                    results.push({ productId, prediction: existingPrediction });
                    continue;
                  }
                  
                  const newPrediction = await PredictionEngine.calculateProductPrediction(
                    productId,
                    interactions,
                    sessionMetrics,
                    existingPrediction
                  );
                  
                  results.push({ productId, prediction: newPrediction });
                }
                return results;
              },
              10 // Process 10 products at a time for async operations
            );

            // Update predictions map
            if (Array.isArray(processInBatches)) {
              processInBatches.forEach(({ productId, prediction }) => {
                newPredictions.set(productId, prediction);
              });
            }

            set((draft) => {
              draft.predictions = newPredictions;
              draft.lastCalculation = now;
              draft.isProcessing = false;
            });

            console.log('🧠 [AI Store] Load-time calculation complete for', productIds.length, 'products');
          }, 200); // Batch calculations over 200ms
        }, 500), // Debounce to prevent spam calculations

        // Get predictions for specific context
        getPredictionsForContext: (context, limit = 10) => {
          const { predictions } = get();
          const allPredictions = Array.from(predictions.values());
          
          // Sort by score descending
          return allPredictions
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
        },

        // Get top predictions
        getTopPredictions: (limit = 10) => {
          const { predictions } = get();
          return Array.from(predictions.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
        },

        // Clean old data for performance
        clearOldData: () => {
          set((state) => {
            const now = Date.now();
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours
            
            // Keep only recent interactions
            state.interactions = state.interactions.filter(
              i => (now - i.timestamp) < maxAge
            );
            
            // Remove old predictions that have no recent interactions
            const recentProductIds = new Set(state.interactions.map(i => i.productId));
            const newPredictions = new Map();
            
            state.predictions.forEach((prediction, productId) => {
              if (recentProductIds.has(productId) || prediction.score > 20) {
                newPredictions.set(productId, prediction);
              }
            });
            
            state.predictions = newPredictions;
          });
        },

        // AI-powered behavioral analysis
        analyzeUserBehavior: async () => {
          const { interactions, sessionMetrics, aiCapabilities } = get();
          
          if (!aiCapabilities.behaviorAnalysis || interactions.length === 0) return;
          
          set((state) => { state.aiProcessingStatus.behaviorAnalysis = 'processing'; });
          
          try {
            const response = await fetch('/api/ai/behavior-analysis', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                interactions,
                sessionId: sessionMetrics.sessionId,
                timestamp: Date.now()
              })
            });
            
            if (response.ok) {
              const data = await response.json();
              set((state) => {
                state.behaviorPattern = {
                  patternType: data.analysis.primaryPattern,
                  confidence: data.analysis.confidence,
                  indicators: data.analysis.indicators,
                  predictedActions: data.analysis.predictedActions,
                  timeToConversion: data.analysis.timeToConversion,
                  averageOrderValue: data.analysis.expectedOrderValue,
                  lastAnalyzed: Date.now()
                };
                state.aiProcessingStatus.behaviorAnalysis = 'completed';
              });
              
              console.log('🧠 [AI Store] Behavior analysis completed:', data.analysis.primaryPattern);
            }
          } catch (error) {
            console.error('🚨 [AI Store] Behavior analysis failed:', error);
            set((state) => { state.aiProcessingStatus.behaviorAnalysis = 'failed'; });
          }
        },
        
        // Generate AI recommendations
        generateRecommendations: async (context: string, productId?: string) => {
          const { interactions, sessionMetrics, aiCapabilities } = get();
          
          if (!aiCapabilities.collaborativeFiltering) return;
          
          set((state) => { state.aiProcessingStatus.recommendations = 'processing'; });
          
          try {
            const response = await fetch('/api/ai/recommendations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: sessionMetrics.sessionId,
                currentProductId: productId,
                userBehavior: interactions,
                context,
                limit: 20
              })
            });
            
            if (response.ok) {
              const data = await response.json();
              set((state) => {
                state.recommendations = data.recommendations.map((rec: any) => ({
                  productId: rec.productId,
                  score: rec.score,
                  reason: rec.reason,
                  type: rec.type,
                  confidence: rec.confidence,
                  source: 'ai_api'
                }));
                state.aiProcessingStatus.recommendations = 'completed';
              });
              
              console.log('🎯 [AI Store] Generated', data.recommendations.length, 'AI recommendations');
            }
          } catch (error) {
            console.error('🚨 [AI Store] Recommendation generation failed:', error);
            set((state) => { state.aiProcessingStatus.recommendations = 'failed'; });
          }
        },
        
        // Analyze sentiment for specific product
        analyzeSentiment: async (productId: string) => {
          const { interactions, aiCapabilities } = get();
          
          if (!aiCapabilities.sentimentAnalysis) return;
          
          set((state) => { state.aiProcessingStatus.sentiment = 'processing'; });
          
          try {
            const response = await fetch('/api/ai/sentiment-analysis', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                productId,
                interactions,
                context: 'real_time_analysis',
                realtime: true
              })
            });
            
            if (response.ok) {
              const data = await response.json();
              set((state) => {
                state.sentimentAnalysis.set(productId, {
                  productId,
                  sentiment: data.sentiment.sentiment,
                  confidence: data.sentiment.confidence,
                  emotions: data.sentiment.emotions,
                  behaviorTriggers: data.sentiment.behaviorTriggers,
                  recommendations: data.sentiment.recommendations,
                  lastUpdated: Date.now()
                });
                state.aiProcessingStatus.sentiment = 'completed';
              });
              
              console.log('❤️ [AI Store] Sentiment analysis for', productId, ':', data.sentiment.sentiment);
            }
          } catch (error) {
            console.error('🚨 [AI Store] Sentiment analysis failed:', error);
            set((state) => { state.aiProcessingStatus.sentiment = 'failed'; });
          }
        },
        
        // Update user segmentation
        updateUserSegmentation: async () => {
          const { interactions, sessionMetrics, aiCapabilities } = get();
          
          if (!aiCapabilities.userSegmentation || interactions.length < 3) return;
          
          set((state) => { state.aiProcessingStatus.segmentation = 'processing'; });
          
          try {
            const response = await fetch('/api/ai/user-segmentation', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: sessionMetrics.sessionId,
                userBehavior: interactions
              })
            });
            
            if (response.ok) {
              const data = await response.json();
              const segment = data.segmentation.user_cluster;
              
              set((state) => {
                state.userSegmentation = {
                  segmentId: segment.segmentId,
                  name: segment.name,
                  confidence: segment.confidence,
                  characteristics: segment.characteristics,
                  marketingStrategy: segment.marketing_strategy,
                  lastUpdated: Date.now()
                };
                state.aiProcessingStatus.segmentation = 'completed';
              });
              
              console.log('👥 [AI Store] User segmented as:', segment.name);
            }
          } catch (error) {
            console.error('🚨 [AI Store] User segmentation failed:', error);
            set((state) => { state.aiProcessingStatus.segmentation = 'failed'; });
          }
        },
        
        // Forecast demand for products
        forecastDemand: async (productIds: string[]) => {
          const { aiCapabilities } = get();
          
          if (!aiCapabilities.demandForecasting || productIds.length === 0) return;
          
          try {
            const response = await fetch('/api/ai/demand-forecasting', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                productIds,
                timeHorizon: 30,
                granularity: 'daily',
                includeSeasonality: true,
                includeExternalFactors: false
              })
            });
            
            if (response.ok) {
              const data = await response.json();
              
              set((state) => {
                data.forecasts.forEach((forecast: any) => {
                  state.demandForecasts.set(forecast.productId, {
                    productId: forecast.productId,
                    predictions: forecast.predictions,
                    trend_direction: forecast.insights.trend_direction,
                    peak_periods: forecast.insights.peak_periods,
                    accuracy: forecast.model_performance.accuracy,
                    lastUpdated: Date.now()
                  });
                });
              });
              
              console.log('📈 [AI Store] Demand forecasted for', productIds.length, 'products');
            }
          } catch (error) {
            console.error('🚨 [AI Store] Demand forecasting failed:', error);
          }
        },
        
        // Data retrieval methods
        getRecommendations: (limit = 10) => {
          const { recommendations } = get();
          return recommendations
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
        },
        
        getSentimentForProduct: (productId: string) => {
          const { sentimentAnalysis } = get();
          return sentimentAnalysis.get(productId) || null;
        },
        
        getUserSegment: () => {
          const { userSegmentation } = get();
          return userSegmentation;
        },
        
        getBehaviorPattern: () => {
          const { behaviorPattern } = get();
          return behaviorPattern;
        },
        
        getDemandForecast: (productId: string) => {
          const { demandForecasts } = get();
          return demandForecasts.get(productId) || null;
        },
        
        // AI insights summary
        getAIInsights: () => {
          const { behaviorPattern, userSegmentation, recommendations, sentimentAnalysis } = get();
          
          const totalInsights = 
            (behaviorPattern ? 1 : 0) +
            (userSegmentation ? 1 : 0) +
            recommendations.length +
            sentimentAnalysis.size;
            
          const behaviorConfidence = behaviorPattern?.confidence || 0;
          const segmentationAccuracy = userSegmentation?.confidence || 0;
          const recommendationStrength = recommendations.length > 0 
            ? recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / recommendations.length 
            : 0;
            
          const overallScore = (behaviorConfidence + segmentationAccuracy + recommendationStrength) / 3;
          
          let overallAIHealth: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';
          if (overallScore > 0.8) overallAIHealth = 'excellent';
          else if (overallScore > 0.6) overallAIHealth = 'good';
          else if (overallScore > 0.4) overallAIHealth = 'fair';
          
          return {
            totalInsights,
            behaviorConfidence,
            segmentationAccuracy,
            recommendationStrength,
            overallAIHealth
          };
        },
        
        // Enterprise AI real-time system
        startRealtimeCalculation: () => {
          const { aiCapabilities } = get();
          
          if (realtimeInterval) clearInterval(realtimeInterval);
          
          realtimeInterval = setInterval(() => {
            const state = get();
            
            // Trigger comprehensive AI analysis if we have enough data
            if (state.interactions.length > 5) {
              // Analyze behavior every 30 seconds
              if (aiCapabilities.behaviorAnalysis) {
                state.analyzeUserBehavior();
              }
              
              // Update segmentation every 60 seconds (offset by 15s)
              if (aiCapabilities.userSegmentation && state.interactions.length > 10) {
                setTimeout(() => state.updateUserSegmentation(), 15000);
              }
              
              // Generate recommendations every 45 seconds (offset by 30s)
              if (aiCapabilities.collaborativeFiltering) {
                setTimeout(() => state.generateRecommendations('real_time'), 30000);
              }
            }
          }, 30000); // Every 30 seconds
          
          console.log('🚀 [AI Store] Enterprise real-time AI system activated');
        },

        stopRealtimeCalculation: () => {
          if (realtimeInterval) {
            clearInterval(realtimeInterval);
            realtimeInterval = null;
            console.log('⏹️ [AI Store] Real-time AI system stopped');
          }
        }
      };
    })
  )
);

// Utility functions for purchase history persistence
export const PurchaseHistoryManager = {
  // Save purchase to localStorage for returning customers
  savePurchaseHistory: (productIds: string[], orderId: string, orderValue: number) => {
    try {
      const existingHistory = localStorage.getItem('ai_purchase_history');
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      
      const newPurchase = {
        productIds,
        orderId,
        orderValue,
        timestamp: Date.now()
      };
      
      history.push(newPurchase);
      
      // Keep only last 50 purchases to prevent bloat
      const recentHistory = history.slice(-50);
      localStorage.setItem('ai_purchase_history', JSON.stringify(recentHistory));
      
      console.log('💾 [AI Store] Purchase history saved:', newPurchase);
    } catch (error) {
      console.warn('Failed to save purchase history:', error);
    }
  },
  
  // Load purchase history for returning customers
  loadPurchaseHistory: () => {
    try {
      const history = localStorage.getItem('ai_purchase_history');
      if (!history) return [];
      
      const parsed = JSON.parse(history);
      const sixMonthsAgo = Date.now() - (6 * 30 * 24 * 60 * 60 * 1000); // 6 months
      
      // Only return purchases from last 6 months
      const recentHistory = parsed.filter((purchase: any) => 
        purchase.timestamp > sixMonthsAgo
      );
      
      console.log('📚 [AI Store] Loaded purchase history:', recentHistory.length, 'purchases');
      return recentHistory;
    } catch (error) {
      console.warn('Failed to load purchase history:', error);
      return [];
    }
  },
  
  // Initialize store with purchase history for returning customers
  initializeWithHistory: () => {
    const history = PurchaseHistoryManager.loadPurchaseHistory();
    const store = useAIPredictionStore.getState();
    
    // Convert purchase history to interactions
    history.forEach((purchase: any) => {
      purchase.productIds.forEach((productId: string) => {
        store.trackInteraction({
          productId,
          type: 'purchase',
          context: 'historical-data',
          metadata: {
            orderId: purchase.orderId,
            orderValue: purchase.orderValue / purchase.productIds.length,
            quantity: 1
          }
        });
      });
    });
    
    if (history.length > 0) {
      console.log('🔄 [AI Store] Initialized with', history.length, 'historical purchases');
      store.calculatePredictions();
    }
  }
};

// Initialize the store when it's first used
if (typeof window !== 'undefined') {
  // Load historical purchase data for returning customers
  setTimeout(() => {
    PurchaseHistoryManager.initializeWithHistory();
  }, 1000); // Small delay to let store initialize
  
  // Calculate predictions once on initial load
  useAIPredictionStore.getState().calculatePredictions();
  
  // Clean old data periodically
  setInterval(() => {
    useAIPredictionStore.getState().clearOldData();
  }, 10 * 60 * 1000); // Every 10 minutes
}