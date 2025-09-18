import { NextRequest, NextResponse } from 'next/server';

/**
 * AI User Segmentation & Clustering API
 * Implements advanced user clustering for personalized experiences
 */

interface UserSegmentationRequest {
  userId?: string;
  userBehavior: any[];
  demographicData?: any;
  purchaseHistory?: any[];
  sessionData?: any;
}

interface UserSegment {
  segmentId: string;
  name: string;
  description: string;
  characteristics: string[];
  behavior_patterns: {
    avg_session_duration: number;
    avg_pages_per_session: number;
    conversion_rate: number;
    avg_order_value: number;
    preferred_categories: string[];
    shopping_time_preference: string;
  };
  marketing_strategy: {
    messaging: string;
    channels: string[];
    timing: string;
    incentives: string[];
  };
  confidence: number;
}

interface ClusterAnalysis {
  user_cluster: UserSegment;
  similar_users: string[];
  segment_metrics: {
    size: number;
    growth_rate: number;
    revenue_contribution: number;
  };
  personalization_recommendations: {
    homepage_layout: string;
    product_recommendations: string[];
    pricing_strategy: string;
    content_preferences: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: UserSegmentationRequest = await request.json();
    const { userId, userBehavior, demographicData, purchaseHistory, sessionData } = body;

    if (!userBehavior || !Array.isArray(userBehavior)) {
      return NextResponse.json(
        { error: 'Invalid user behavior data' },
        { status: 400 }
      );
    }

    // Extract user features for clustering
    const userFeatures = extractUserFeatures(userBehavior, purchaseHistory, sessionData);
    
    // Perform clustering analysis
    const clusterAnalysis = await performUserClustering(userFeatures, userId);
    
    // Get AI-powered segment insights if available
    if (process.env.AI_API_KEY) {
      try {
        const aiInsights = await getAISegmentInsights(userFeatures, clusterAnalysis);
        clusterAnalysis.user_cluster = {
          ...clusterAnalysis.user_cluster,
          ...aiInsights
        };
      } catch (error) {
        console.warn('AI segment insights failed:', error);
      }
    }

    return NextResponse.json({
      success: true,
      segmentation: clusterAnalysis,
      metadata: {
        userId,
        features_analyzed: Object.keys(userFeatures).length,
        confidence: clusterAnalysis.user_cluster.confidence,
        analysis_type: process.env.AI_API_KEY ? 'ai_enhanced' : 'statistical',
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('User Segmentation Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to perform user segmentation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Extract comprehensive user features for clustering
 */
function extractUserFeatures(
  behavior: any[], 
  purchaseHistory?: any[], 
  sessionData?: any
): Record<string, number> {
  const now = Date.now();
  const features: Record<string, number> = {};

  // Behavioral features
  features.total_interactions = behavior.length;
  features.page_visits = behavior.filter(i => i.type === 'page_visit').length;
  features.cart_actions = behavior.filter(i => i.type.includes('cart')).length;
  features.wishlist_actions = behavior.filter(i => i.type.includes('wishlist')).length;
  features.search_actions = behavior.filter(i => i.context === 'search').length;
  
  // Timing features
  if (behavior.length > 1) {
    const timestamps = behavior.map(i => i.timestamp).sort((a, b) => a - b);
    features.session_duration = timestamps[timestamps.length - 1] - timestamps[0];
    features.avg_time_between_actions = features.session_duration / (behavior.length - 1);
    
    // Calculate action intensity (actions per minute)
    features.action_intensity = (behavior.length / (features.session_duration / 60000)) || 0;
  } else {
    features.session_duration = 0;
    features.avg_time_between_actions = 0;
    features.action_intensity = 0;
  }

  // Engagement quality features
  const hoverDurations = behavior
    .filter(i => i.type === 'hover_end' && i.duration)
    .map(i => i.duration);
  
  features.avg_hover_duration = hoverDurations.length > 0 
    ? hoverDurations.reduce((sum, dur) => sum + dur, 0) / hoverDurations.length 
    : 0;
    
  features.quick_bounce_rate = behavior.length > 0 
    ? behavior.filter(i => i.type === 'quick_bounce').length / behavior.length 
    : 0;

  // Purchase history features
  if (purchaseHistory && purchaseHistory.length > 0) {
    features.total_purchases = purchaseHistory.length;
    features.total_spent = purchaseHistory.reduce((sum, p) => sum + (p.orderValue || 0), 0);
    features.avg_order_value = features.total_spent / features.total_purchases;
    
    // Purchase timing features
    const purchaseTimestamps = purchaseHistory.map(p => p.timestamp).sort((a, b) => a - b);
    if (purchaseTimestamps.length > 1) {
      const purchaseGaps = [];
      for (let i = 1; i < purchaseTimestamps.length; i++) {
        purchaseGaps.push(purchaseTimestamps[i] - purchaseTimestamps[i-1]);
      }
      features.avg_purchase_frequency = purchaseGaps.reduce((sum, gap) => sum + gap, 0) / purchaseGaps.length;
    }
    
    features.days_since_last_purchase = purchaseHistory.length > 0 
      ? (now - Math.max(...purchaseTimestamps)) / (1000 * 60 * 60 * 24)
      : 999;
  } else {
    features.total_purchases = 0;
    features.total_spent = 0;
    features.avg_order_value = 0;
    features.days_since_last_purchase = 999;
  }

  // Session context features
  if (sessionData) {
    features.pages_per_session = sessionData.pageViews || 0;
    features.bounce_rate = sessionData.bounceRate || 0;
    features.conversion_events = sessionData.conversionEvents || 0;
  }

  // Category preference features (simplified)
  const categoryInteractions = behavior.filter(i => i.metadata?.category);
  const categoryCount = new Map();
  categoryInteractions.forEach(i => {
    const category = i.metadata.category;
    categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
  });
  
  // Add top 3 category preferences as features
  const topCategories = Array.from(categoryCount.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);
    
  topCategories.forEach(([category, count], index) => {
    features[`category_${index + 1}_affinity`] = count / behavior.length;
  });

  return features;
}

/**
 * Perform statistical clustering using K-means-like approach
 */
async function performUserClustering(
  userFeatures: Record<string, number>, 
  userId?: string
): Promise<ClusterAnalysis> {
  // Predefined segments based on e-commerce research
  const segments = getEcommerceSegments();
  
  // Calculate similarity to each segment
  let bestMatch = segments[0];
  let highestScore = 0;
  
  segments.forEach(segment => {
    const score = calculateSegmentSimilarity(userFeatures, segment);
    if (score > highestScore) {
      highestScore = score;
      bestMatch = segment;
    }
  });
  
  // Generate personalization recommendations
  const personalizations = generatePersonalizationRecommendations(bestMatch, userFeatures);

  return {
    user_cluster: {
      ...bestMatch,
      confidence: Math.min(1, highestScore)
    },
    similar_users: [], // Would be populated from user database in real implementation
    segment_metrics: {
      size: Math.floor(Math.random() * 1000) + 100, // Mock data
      growth_rate: Math.random() * 0.2 - 0.1, // -10% to +10%
      revenue_contribution: Math.random() * 0.3 // 0-30%
    },
    personalization_recommendations: personalizations
  };
}

/**
 * Calculate similarity between user features and segment profile
 */
function calculateSegmentSimilarity(
  userFeatures: Record<string, number>, 
  segment: UserSegment
): number {
  let totalScore = 0;
  let weightSum = 0;

  // Define feature weights and segment expectations
  const segmentProfiles: Record<string, Record<string, { weight: number; expected: number }>> = {
    'impulse_buyers': {
      action_intensity: { weight: 3, expected: 10 }, // High action intensity
      avg_hover_duration: { weight: 2, expected: 1500 }, // Lower hover time
      cart_actions: { weight: 3, expected: 2 }, // Quick cart adds
      quick_bounce_rate: { weight: 1, expected: 0.3 } // Some bouncing is normal
    },
    'researchers': {
      session_duration: { weight: 3, expected: 300000 }, // Long sessions
      page_visits: { weight: 3, expected: 5 }, // Multiple page visits
      avg_hover_duration: { weight: 2, expected: 4000 }, // Long hover times
      search_actions: { weight: 2, expected: 3 } // Lots of searching
    },
    'bargain_hunters': {
      wishlist_actions: { weight: 3, expected: 3 }, // Save items for later
      search_actions: { weight: 2, expected: 4 }, // Search for deals
      days_since_last_purchase: { weight: 2, expected: 30 }, // Wait for sales
      conversion_events: { weight: 1, expected: 1 } // Lower conversion
    },
    'loyal_customers': {
      total_purchases: { weight: 4, expected: 5 }, // Multiple purchases
      avg_order_value: { weight: 3, expected: 100 }, // Higher AOV
      days_since_last_purchase: { weight: 2, expected: 15 }, // Recent activity
      quick_bounce_rate: { weight: 2, expected: 0.1 } // Low bounce rate
    },
    'casual_browsers': {
      quick_bounce_rate: { weight: 3, expected: 0.6 }, // High bounce rate
      action_intensity: { weight: 2, expected: 2 }, // Low action intensity
      total_purchases: { weight: 3, expected: 0 }, // Few/no purchases
      session_duration: { weight: 1, expected: 60000 } // Short sessions
    }
  };

  const profile = segmentProfiles[segment.segmentId] || {};
  
  Object.entries(profile).forEach(([feature, { weight, expected }]) => {
    const userValue = userFeatures[feature] || 0;
    
    // Calculate similarity score (closer to expected = higher score)
    const maxDiff = Math.abs(expected); // Normalize by expected value
    const actualDiff = Math.abs(userValue - expected);
    const similarity = Math.max(0, 1 - (actualDiff / (maxDiff + 1)));
    
    totalScore += similarity * weight;
    weightSum += weight;
  });

  return weightSum > 0 ? totalScore / weightSum : 0;
}

/**
 * Get predefined e-commerce user segments
 */
function getEcommerceSegments(): UserSegment[] {
  return [
    {
      segmentId: 'impulse_buyers',
      name: 'Impulse Buyers',
      description: 'Users who make quick purchase decisions with minimal research',
      characteristics: [
        'Fast decision making',
        'Responds well to urgency',
        'Price sensitive to deals',
        'Influenced by social proof'
      ],
      behavior_patterns: {
        avg_session_duration: 180000, // 3 minutes
        avg_pages_per_session: 2.5,
        conversion_rate: 0.08,
        avg_order_value: 45,
        preferred_categories: ['trending', 'deals', 'featured'],
        shopping_time_preference: 'evening'
      },
      marketing_strategy: {
        messaging: 'Limited time offers, urgency, social proof',
        channels: ['email', 'push_notifications', 'social_ads'],
        timing: 'evening_weekends',
        incentives: ['flash_sales', 'countdown_timers', 'social_proof']
      },
      confidence: 0.8
    },
    {
      segmentId: 'researchers',
      name: 'Researchers',
      description: 'Users who extensively research before making purchase decisions',
      characteristics: [
        'Thorough product research',
        'Reads reviews and comparisons',
        'Higher price tolerance for quality',
        'Longer conversion funnel'
      ],
      behavior_patterns: {
        avg_session_duration: 420000, // 7 minutes
        avg_pages_per_session: 6.8,
        conversion_rate: 0.12,
        avg_order_value: 85,
        preferred_categories: ['detailed_products', 'premium', 'reviews'],
        shopping_time_preference: 'weekday_afternoon'
      },
      marketing_strategy: {
        messaging: 'Detailed information, quality emphasis, expert reviews',
        channels: ['email_courses', 'content_marketing', 'retargeting'],
        timing: 'weekday_business_hours',
        incentives: ['detailed_guides', 'expert_recommendations', 'quality_guarantees']
      },
      confidence: 0.8
    },
    {
      segmentId: 'bargain_hunters',
      name: 'Bargain Hunters',
      description: 'Price-sensitive users who actively seek deals and discounts',
      characteristics: [
        'Highly price sensitive',
        'Waits for sales and promotions',
        'Uses wishlist frequently',
        'Compares prices across platforms'
      ],
      behavior_patterns: {
        avg_session_duration: 300000, // 5 minutes
        avg_pages_per_session: 4.2,
        conversion_rate: 0.06,
        avg_order_value: 35,
        preferred_categories: ['sale', 'clearance', 'bulk_deals'],
        shopping_time_preference: 'weekend_morning'
      },
      marketing_strategy: {
        messaging: 'Savings, deals, price comparisons, value emphasis',
        channels: ['deal_alerts', 'email_newsletters', 'price_drop_notifications'],
        timing: 'sale_periods',
        incentives: ['percentage_discounts', 'bulk_discounts', 'price_matching']
      },
      confidence: 0.8
    },
    {
      segmentId: 'loyal_customers',
      name: 'Loyal Customers',
      description: 'Repeat customers with strong brand affinity and higher lifetime value',
      characteristics: [
        'Multiple previous purchases',
        'Brand loyal behavior',
        'Higher average order value',
        'Responds to loyalty programs'
      ],
      behavior_patterns: {
        avg_session_duration: 240000, // 4 minutes
        avg_pages_per_session: 3.5,
        conversion_rate: 0.18,
        avg_order_value: 120,
        preferred_categories: ['new_arrivals', 'exclusive', 'recommended'],
        shopping_time_preference: 'consistent_weekly'
      },
      marketing_strategy: {
        messaging: 'Exclusive access, loyalty rewards, personalized recommendations',
        channels: ['vip_email', 'app_notifications', 'loyalty_program'],
        timing: 'regular_cadence',
        incentives: ['loyalty_points', 'early_access', 'exclusive_products']
      },
      confidence: 0.8
    },
    {
      segmentId: 'casual_browsers',
      name: 'Casual Browsers',
      description: 'Users who browse casually with low purchase intent',
      characteristics: [
        'High bounce rates',
        'Minimal engagement',
        'Rare purchases',
        'Needs strong incentives to convert'
      ],
      behavior_patterns: {
        avg_session_duration: 90000, // 1.5 minutes
        avg_pages_per_session: 1.8,
        conversion_rate: 0.02,
        avg_order_value: 25,
        preferred_categories: ['popular', 'trending', 'featured'],
        shopping_time_preference: 'random'
      },
      marketing_strategy: {
        messaging: 'Easy discovery, low commitment, gentle nurturing',
        channels: ['social_media', 'content_marketing', 'retargeting'],
        timing: 'broad_reach',
        incentives: ['first_time_discounts', 'free_shipping', 'easy_returns']
      },
      confidence: 0.8
    }
  ];
}

/**
 * Generate personalization recommendations based on segment
 */
function generatePersonalizationRecommendations(
  segment: UserSegment, 
  userFeatures: Record<string, number>
): ClusterAnalysis['personalization_recommendations'] {
  const recommendations: ClusterAnalysis['personalization_recommendations'] = {
    homepage_layout: 'default',
    product_recommendations: [],
    pricing_strategy: 'standard',
    content_preferences: []
  };

  switch (segment.segmentId) {
    case 'impulse_buyers':
      recommendations.homepage_layout = 'urgency_focused';
      recommendations.product_recommendations = ['trending', 'flash_sales', 'social_proof'];
      recommendations.pricing_strategy = 'dynamic_urgency';
      recommendations.content_preferences = ['countdown_timers', 'limited_stock_alerts', 'social_validation'];
      break;
      
    case 'researchers':
      recommendations.homepage_layout = 'information_rich';
      recommendations.product_recommendations = ['detailed_comparisons', 'expert_picks', 'comprehensive_reviews'];
      recommendations.pricing_strategy = 'value_based';
      recommendations.content_preferences = ['detailed_specs', 'comparison_tables', 'expert_reviews'];
      break;
      
    case 'bargain_hunters':
      recommendations.homepage_layout = 'deals_focused';
      recommendations.product_recommendations = ['sale_items', 'bulk_deals', 'price_drops'];
      recommendations.pricing_strategy = 'promotional';
      recommendations.content_preferences = ['savings_calculator', 'price_history', 'deal_alerts'];
      break;
      
    case 'loyal_customers':
      recommendations.homepage_layout = 'personalized';
      recommendations.product_recommendations = ['based_on_history', 'exclusive_items', 'new_arrivals'];
      recommendations.pricing_strategy = 'loyalty_based';
      recommendations.content_preferences = ['personalized_content', 'loyalty_rewards', 'exclusive_access'];
      break;
      
    case 'casual_browsers':
      recommendations.homepage_layout = 'discovery_focused';
      recommendations.product_recommendations = ['popular_items', 'curated_collections', 'easy_categories'];
      recommendations.pricing_strategy = 'incentive_based';
      recommendations.content_preferences = ['visual_discovery', 'trending_content', 'low_commitment_options'];
      break;
  }

  return recommendations;
}

/**
 * Get AI-enhanced segment insights
 */
async function getAISegmentInsights(
  userFeatures: Record<string, number>, 
  clusterAnalysis: ClusterAnalysis
): Promise<Partial<UserSegment>> {
  const prompt = `
Analyze this user profile and enhance the segmentation insights:

User Features: ${JSON.stringify(userFeatures)}
Current Segment: ${clusterAnalysis.user_cluster.name}

Provide enhanced insights in JSON:
{
  "refined_characteristics": ["specific behavioral trait"],
  "marketing_timing": "optimal timing",
  "conversion_triggers": ["what motivates this user"],
  "risk_factors": ["what might prevent conversion"]
}
`;

  try {
    // Use the behavior analysis API for AI insights
    const response = await fetch('/api/ai/behavior-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        interactions: [],
        sessionId: 'segmentation-analysis',
        customPrompt: prompt
      })
    });

    if (response.ok) {
      const data = await response.json();
      return {
        characteristics: data.refined_characteristics || clusterAnalysis.user_cluster.characteristics
      };
    }
  } catch (error) {
    console.warn('AI segment enhancement failed:', error);
  }

  return {};
}