import { NextRequest, NextResponse } from 'next/server';

/**
 * Advanced AI Recommendations API
 * Implements collaborative filtering, market basket analysis, and behavioral recommendations
 */

interface RecommendationRequest {
  userId?: string;
  currentProductId?: string;
  userBehavior: any[];
  context: 'product-page' | 'cart' | 'homepage' | 'search';
  limit?: number;
}

interface Recommendation {
  productId: string;
  score: number;
  reason: string;
  type: 'collaborative' | 'market_basket' | 'behavioral' | 'hybrid';
  confidence: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: RecommendationRequest = await request.json();
    const { userId, currentProductId, userBehavior, context, limit = 10 } = body;

    // Generate different types of recommendations
    const collaborativeRecs = await getCollaborativeRecommendations(currentProductId, userId);
    const marketBasketRecs = await getMarketBasketRecommendations(currentProductId, userBehavior);
    const behavioralRecs = await getBehavioralRecommendations(userBehavior, context);
    
    // Combine and score recommendations
    const combinedRecs = combineRecommendations(collaborativeRecs, marketBasketRecs, behavioralRecs);
    
    // Sort by score and return top results
    const topRecommendations = combinedRecs
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      recommendations: topRecommendations,
      metadata: {
        context,
        totalCandidates: combinedRecs.length,
        collaborativeCount: collaborativeRecs.length,
        marketBasketCount: marketBasketRecs.length,
        behavioralCount: behavioralRecs.length,
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('AI Recommendations Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Collaborative Filtering - "Users who liked this also liked"
 */
async function getCollaborativeRecommendations(
  currentProductId?: string, 
  userId?: string
): Promise<Recommendation[]> {
  if (!currentProductId) return [];

  // In a real implementation, this would query your database for:
  // 1. Users who interacted with currentProductId
  // 2. Other products those users interacted with
  // 3. Calculate similarity scores

  // For now, simulate collaborative filtering
  const mockCollaborativeData = getMockCollaborativeData();
  const similarProducts = mockCollaborativeData[currentProductId] || [];

  return similarProducts.map(item => ({
    productId: item.productId,
    score: item.similarity * 0.4, // 40% weight for collaborative
    reason: `${Math.round(item.similarity * 100)}% of similar users also liked this`,
    type: 'collaborative' as const,
    confidence: item.similarity
  }));
}

/**
 * Market Basket Analysis - "Frequently bought together"
 */
async function getMarketBasketRecommendations(
  currentProductId?: string,
  userBehavior: any[]
): Promise<Recommendation[]> {
  if (!currentProductId) return [];

  // Get products user has interacted with
  const userProducts = new Set(
    userBehavior
      .filter(interaction => ['view', 'cart_add', 'wishlist_add'].includes(interaction.type))
      .map(interaction => interaction.productId)
  );

  // Find products frequently bought together
  const marketBasketRules = getMockMarketBasketRules();
  const recommendations: Recommendation[] = [];

  marketBasketRules.forEach(rule => {
    // If user has the antecedent products, recommend the consequent
    const hasAntecedent = rule.antecedent.every(productId => 
      userProducts.has(productId) || productId === currentProductId
    );
    
    if (hasAntecedent) {
      rule.consequent.forEach(productId => {
        if (!userProducts.has(productId) && productId !== currentProductId) {
          recommendations.push({
            productId,
            score: rule.confidence * rule.lift * 0.3, // 30% weight for market basket
            reason: `${Math.round(rule.confidence * 100)}% of customers buy this together (${rule.lift.toFixed(1)}x more likely)`,
            type: 'market_basket',
            confidence: rule.confidence
          });
        }
      });
    }
  });

  return recommendations;
}

/**
 * Behavioral Recommendations based on user pattern
 */
async function getBehavioralRecommendations(
  userBehavior: any[],
  context: string
): Promise<Recommendation[]> {
  if (userBehavior.length === 0) return [];

  // Analyze user behavior pattern
  const behaviorPattern = analyzeBehaviorPattern(userBehavior);
  
  // Get recommendations based on behavior
  const behaviorBasedRecs = getBehaviorSpecificRecommendations(behaviorPattern, context);

  return behaviorBasedRecs.map(rec => ({
    productId: rec.productId,
    score: rec.score * 0.3, // 30% weight for behavioral
    reason: `Matches your ${behaviorPattern.type} shopping pattern`,
    type: 'behavioral' as const,
    confidence: rec.confidence
  }));
}

/**
 * Combine different recommendation types using ensemble methods
 */
function combineRecommendations(
  collaborative: Recommendation[],
  marketBasket: Recommendation[],
  behavioral: Recommendation[]
): Recommendation[] {
  const combinedMap = new Map<string, Recommendation>();

  // Process all recommendations
  [...collaborative, ...marketBasket, ...behavioral].forEach(rec => {
    if (combinedMap.has(rec.productId)) {
      // Combine scores for the same product
      const existing = combinedMap.get(rec.productId)!;
      existing.score += rec.score;
      existing.reason += ` + ${rec.reason}`;
      existing.confidence = Math.max(existing.confidence, rec.confidence);
      existing.type = 'hybrid';
    } else {
      combinedMap.set(rec.productId, { ...rec });
    }
  });

  return Array.from(combinedMap.values());
}

/**
 * Analyze user behavior to determine pattern type
 */
function analyzeBehaviorPattern(userBehavior: any[]): { type: string; confidence: number } {
  const totalInteractions = userBehavior.length;
  const pageVisits = userBehavior.filter(i => i.type === 'page_visit').length;
  const cartActions = userBehavior.filter(i => i.type.includes('cart')).length;
  const wishlistActions = userBehavior.filter(i => i.type.includes('wishlist')).length;
  
  // Calculate average time between interactions
  const timestamps = userBehavior.map(i => i.timestamp).sort((a, b) => a - b);
  const avgTimeBetween = timestamps.length > 1 
    ? (timestamps[timestamps.length - 1] - timestamps[0]) / (timestamps.length - 1)
    : 0;

  // Classify behavior pattern
  if (cartActions > 0 && avgTimeBetween < 60000) { // Fast cart actions
    return { type: 'impulse_buyer', confidence: 0.8 };
  } else if (pageVisits > 3 && wishlistActions > cartActions) {
    return { type: 'researcher', confidence: 0.7 };
  } else if (wishlistActions > cartActions) {
    return { type: 'price_sensitive', confidence: 0.6 };
  } else {
    return { type: 'browser', confidence: 0.5 };
  }
}

/**
 * Get recommendations specific to behavior pattern
 */
function getBehaviorSpecificRecommendations(
  pattern: { type: string; confidence: number },
  context: string
): Array<{ productId: string; score: number; confidence: number }> {
  // Mock behavior-specific recommendations
  // In real implementation, this would use ML models trained on user segments
  
  const recommendations: Array<{ productId: string; score: number; confidence: number }> = [];
  
  switch (pattern.type) {
    case 'impulse_buyer':
      // Recommend trending, popular items
      recommendations.push(
        { productId: 'trending-1', score: 0.8, confidence: 0.9 },
        { productId: 'popular-1', score: 0.7, confidence: 0.8 }
      );
      break;
      
    case 'researcher':
      // Recommend detailed, high-quality products
      recommendations.push(
        { productId: 'detailed-1', score: 0.9, confidence: 0.8 },
        { productId: 'premium-1', score: 0.8, confidence: 0.7 }
      );
      break;
      
    case 'price_sensitive':
      // Recommend deals and value products
      recommendations.push(
        { productId: 'value-1', score: 0.7, confidence: 0.8 },
        { productId: 'sale-1', score: 0.8, confidence: 0.9 }
      );
      break;
      
    default:
      // General recommendations
      recommendations.push(
        { productId: 'general-1', score: 0.6, confidence: 0.6 }
      );
  }
  
  return recommendations;
}

/**
 * Mock collaborative filtering data
 * In real implementation, this would be computed from your order/interaction database
 */
function getMockCollaborativeData(): Record<string, Array<{ productId: string; similarity: number }>> {
  return {
    'product-1': [
      { productId: 'product-2', similarity: 0.85 },
      { productId: 'product-3', similarity: 0.72 },
      { productId: 'product-4', similarity: 0.68 }
    ],
    'product-2': [
      { productId: 'product-1', similarity: 0.85 },
      { productId: 'product-5', similarity: 0.79 },
      { productId: 'product-6', similarity: 0.65 }
    ]
    // Add more collaborative relationships...
  };
}

/**
 * Mock market basket analysis rules
 * In real implementation, these would be computed using Apriori algorithm on transaction data
 */
function getMockMarketBasketRules(): Array<{
  antecedent: string[];
  consequent: string[];
  support: number;
  confidence: number;
  lift: number;
}> {
  return [
    {
      antecedent: ['mushroom-kit-1'],
      consequent: ['growing-medium-1'],
      support: 0.15,
      confidence: 0.75,
      lift: 2.1
    },
    {
      antecedent: ['substrate-1', 'spores-1'],
      consequent: ['sterilization-kit-1'],
      support: 0.08,
      confidence: 0.68,
      lift: 3.2
    },
    {
      antecedent: ['beginner-kit-1'],
      consequent: ['growing-guide-1', 'ph-strips-1'],
      support: 0.12,
      confidence: 0.82,
      lift: 1.9
    }
    // Add more market basket rules...
  ];
}