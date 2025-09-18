import { NextRequest, NextResponse } from 'next/server';

/**
 * AI Sentiment Analysis API
 * Analyzes user behavior sentiment in real-time
 */

interface SentimentRequest {
  productId: string;
  interactions: any[];
  context?: string;
  realtime?: boolean;
}

interface SentimentResponse {
  productId: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  score: number; // -1 to 1 scale
  emotions: {
    excitement: number;
    hesitation: number;
    interest: number;
    frustration: number;
  };
  behaviorTriggers: string[];
  recommendations: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: SentimentRequest = await request.json();
    const { productId, interactions, context = 'general', realtime = false } = body;

    if (!productId || !interactions || !Array.isArray(interactions)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Filter interactions for this product
    const productInteractions = interactions.filter(i => i.productId === productId);

    if (productInteractions.length === 0) {
      return NextResponse.json({
        success: true,
        sentiment: getDefaultSentiment(productId)
      });
    }

    // Analyze sentiment using multiple approaches
    const behaviorSentiment = analyzeBehaviorSentiment(productInteractions);
    const sequenceSentiment = analyzeSequenceSentiment(productInteractions);
    const timingSentiment = analyzeTimingSentiment(productInteractions);
    
    // Combine sentiment analyses
    const finalSentiment = combineSentimentAnalyses([
      behaviorSentiment,
      sequenceSentiment,
      timingSentiment
    ]);

    // Add AI-powered sentiment if enabled
    if (process.env.AI_API_KEY) {
      try {
        const aiSentiment = await getAISentimentAnalysis(productInteractions, context);
        finalSentiment.confidence = Math.max(finalSentiment.confidence, aiSentiment.confidence);
        finalSentiment.behaviorTriggers.push(...aiSentiment.triggers);
      } catch (error) {
        console.warn('AI sentiment analysis failed:', error);
      }
    }

    return NextResponse.json({
      success: true,
      sentiment: finalSentiment,
      metadata: {
        interactionCount: productInteractions.length,
        analysisType: process.env.AI_API_KEY ? 'hybrid_ai' : 'behavioral_only',
        context,
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('Sentiment Analysis Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze sentiment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Analyze sentiment based on behavior patterns
 */
function analyzeBehaviorSentiment(interactions: any[]): SentimentResponse {
  const now = Date.now();
  
  // Calculate behavior metrics
  const hoverDurations = interactions
    .filter(i => i.type === 'hover_end' && i.duration)
    .map(i => i.duration);
    
  const avgHoverDuration = hoverDurations.length > 0 
    ? hoverDurations.reduce((sum, dur) => sum + dur, 0) / hoverDurations.length 
    : 0;
    
  const quickBounces = interactions.filter(i => i.type === 'quick_bounce').length;
  const pageVisits = interactions.filter(i => i.type === 'page_visit').length;
  const cartActions = interactions.filter(i => i.type.includes('cart')).length;
  const wishlistActions = interactions.filter(i => i.type.includes('wishlist')).length;
  const totalInteractions = interactions.length;

  // Calculate sentiment score (-1 to 1)
  let sentimentScore = 0;
  const behaviorTriggers: string[] = [];
  
  // Positive indicators
  if (avgHoverDuration > 3000) {
    sentimentScore += 0.3;
    behaviorTriggers.push('Extended engagement time');
  }
  
  if (pageVisits > 1) {
    sentimentScore += 0.4;
    behaviorTriggers.push('Multiple page visits show strong interest');
  }
  
  if (cartActions > 0) {
    sentimentScore += 0.5;
    behaviorTriggers.push('Added to cart - high purchase intent');
  }
  
  if (wishlistActions > 0) {
    sentimentScore += 0.3;
    behaviorTriggers.push('Added to wishlist - future purchase consideration');
  }

  // Negative indicators
  const bounceRate = totalInteractions > 0 ? quickBounces / totalInteractions : 0;
  if (bounceRate > 0.5) {
    sentimentScore -= 0.4;
    behaviorTriggers.push('High bounce rate indicates lack of interest');
  }
  
  if (avgHoverDuration < 500 && totalInteractions > 2) {
    sentimentScore -= 0.2;
    behaviorTriggers.push('Very short engagement times');
  }

  // Normalize score to -1 to 1 range
  sentimentScore = Math.max(-1, Math.min(1, sentimentScore));
  
  // Determine sentiment category
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (sentimentScore > 0.2) sentiment = 'positive';
  else if (sentimentScore < -0.2) sentiment = 'negative';
  
  // Calculate emotions (0-1 scale)
  const emotions = {
    excitement: Math.max(0, sentimentScore * 0.8 + (cartActions > 0 ? 0.3 : 0)),
    hesitation: Math.max(0, (wishlistActions - cartActions) * 0.2 + bounceRate * 0.3),
    interest: Math.max(0, (avgHoverDuration / 5000) * 0.7 + (pageVisits * 0.1)),
    frustration: Math.max(0, bounceRate * 0.6 + (sentimentScore < -0.3 ? 0.4 : 0))
  };

  // Calculate confidence based on interaction volume and clarity
  const confidence = Math.min(1, 
    (totalInteractions / 10) * 0.5 + // Volume factor
    Math.abs(sentimentScore) * 0.5   // Clarity factor
  );

  return {
    productId: interactions[0]?.productId || 'unknown',
    sentiment,
    confidence,
    score: sentimentScore,
    emotions,
    behaviorTriggers,
    recommendations: generateSentimentRecommendations(sentiment, emotions)
  };
}

/**
 * Analyze sentiment based on interaction sequence
 */
function analyzeSequenceSentiment(interactions: any[]): Partial<SentimentResponse> {
  if (interactions.length < 3) {
    return { confidence: 0.3 };
  }

  // Sort by timestamp to get sequence
  const sequence = interactions
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(i => i.type);

  let sequenceScore = 0;
  const triggers: string[] = [];

  // Analyze positive sequences
  if (sequence.includes('view') && sequence.includes('page_visit') && sequence.includes('cart_add')) {
    sequenceScore += 0.6;
    triggers.push('Classic conversion funnel: view → visit → add to cart');
  }
  
  if (sequence.includes('wishlist_add') && sequence.includes('cart_add')) {
    sequenceScore += 0.4;
    triggers.push('Moved from wishlist to cart - strong buying intent');
  }

  // Analyze negative sequences  
  if (sequence.filter(type => type === 'quick_bounce').length > 2) {
    sequenceScore -= 0.5;
    triggers.push('Multiple quick bounces indicate disinterest');
  }
  
  if (sequence.includes('cart_add') && sequence.includes('cart_remove')) {
    sequenceScore -= 0.3;
    triggers.push('Added then removed from cart - hesitation or price sensitivity');
  }

  return {
    score: Math.max(-1, Math.min(1, sequenceScore)),
    behaviorTriggers: triggers,
    confidence: Math.min(1, interactions.length / 8) // More interactions = higher confidence
  };
}

/**
 * Analyze sentiment based on timing patterns
 */
function analyzeTimingSentiment(interactions: any[]): Partial<SentimentResponse> {
  if (interactions.length < 2) {
    return { confidence: 0.2 };
  }

  const timestamps = interactions.map(i => i.timestamp).sort((a, b) => a - b);
  const timeGaps = [];
  
  for (let i = 1; i < timestamps.length; i++) {
    timeGaps.push(timestamps[i] - timestamps[i-1]);
  }

  const avgTimeGap = timeGaps.reduce((sum, gap) => sum + gap, 0) / timeGaps.length;
  const sessionLength = timestamps[timestamps.length - 1] - timestamps[0];
  
  let timingScore = 0;
  const triggers: string[] = [];

  // Fast interactions can indicate excitement or impulsiveness
  if (avgTimeGap < 2000 && interactions.length > 3) {
    timingScore += 0.2;
    triggers.push('Rapid interactions suggest high engagement');
  }

  // Very long session shows deep interest
  if (sessionLength > 300000 && interactions.length > 5) { // 5+ minutes
    timingScore += 0.3;
    triggers.push('Extended session shows serious consideration');
  }

  // Very short session with few interactions is negative
  if (sessionLength < 30000 && interactions.length < 3) { // <30 seconds
    timingScore -= 0.4;
    triggers.push('Brief visit with minimal engagement');
  }

  return {
    score: Math.max(-1, Math.min(1, timingScore)),
    behaviorTriggers: triggers,
    confidence: 0.6
  };
}

/**
 * Combine multiple sentiment analyses
 */
function combineSentimentAnalyses(analyses: Array<Partial<SentimentResponse>>): SentimentResponse {
  let totalScore = 0;
  let totalConfidence = 0;
  let weightSum = 0;
  const allTriggers: string[] = [];

  analyses.forEach(analysis => {
    if (analysis.score !== undefined && analysis.confidence !== undefined) {
      const weight = analysis.confidence;
      totalScore += analysis.score * weight;
      totalConfidence += analysis.confidence;
      weightSum += weight;
      
      if (analysis.behaviorTriggers) {
        allTriggers.push(...analysis.behaviorTriggers);
      }
    }
  });

  const finalScore = weightSum > 0 ? totalScore / weightSum : 0;
  const finalConfidence = totalConfidence / analyses.length;
  
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (finalScore > 0.2) sentiment = 'positive';
  else if (finalScore < -0.2) sentiment = 'negative';

  return {
    productId: 'combined',
    sentiment,
    confidence: finalConfidence,
    score: finalScore,
    emotions: {
      excitement: Math.max(0, finalScore * 0.8),
      hesitation: Math.max(0, -finalScore * 0.6),
      interest: Math.max(0, Math.abs(finalScore) * 0.5),
      frustration: Math.max(0, -finalScore * 0.7)
    },
    behaviorTriggers: [...new Set(allTriggers)], // Remove duplicates
    recommendations: generateSentimentRecommendations(sentiment, {
      excitement: Math.max(0, finalScore * 0.8),
      hesitation: Math.max(0, -finalScore * 0.6),
      interest: Math.max(0, Math.abs(finalScore) * 0.5),
      frustration: Math.max(0, -finalScore * 0.7)
    })
  };
}

/**
 * Get AI-powered sentiment analysis using configured AI provider
 */
async function getAISentimentAnalysis(
  interactions: any[], 
  context: string
): Promise<{ confidence: number; triggers: string[] }> {
  const behaviorSummary = {
    totalInteractions: interactions.length,
    types: interactions.map(i => i.type).join(', '),
    timeSpan: interactions.length > 1 
      ? interactions[interactions.length - 1].timestamp - interactions[0].timestamp
      : 0,
    context
  };

  const prompt = `
Analyze this user behavior for emotional sentiment. Return JSON only.

Behavior: ${JSON.stringify(behaviorSummary)}

Determine:
1. Emotional state (excited, hesitant, interested, frustrated)
2. Confidence in analysis (0-1)
3. Key behavioral triggers

Return: {"confidence": 0.85, "triggers": ["specific behavior observation"]}
`;

  // Use the same AI endpoint selection as behavior analysis
  const response = await fetch('/api/ai/behavior-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      interactions,
      sessionId: 'sentiment-analysis',
      customPrompt: prompt
    })
  });

  if (!response.ok) {
    throw new Error('AI sentiment analysis failed');
  }

  const data = await response.json();
  
  return {
    confidence: data.confidence || 0.6,
    triggers: data.triggers || ['AI-powered behavioral analysis']
  };
}

/**
 * Generate recommendations based on sentiment
 */
function generateSentimentRecommendations(
  sentiment: 'positive' | 'neutral' | 'negative',
  emotions: any
): string[] {
  const recommendations: string[] = [];

  if (sentiment === 'positive') {
    if (emotions.excitement > 0.6) {
      recommendations.push('Show limited-time offers to capitalize on excitement');
      recommendations.push('Display social proof and reviews');
    }
    if (emotions.interest > 0.7) {
      recommendations.push('Provide detailed product information');
      recommendations.push('Suggest complementary products');
    }
  } else if (sentiment === 'negative') {
    if (emotions.frustration > 0.5) {
      recommendations.push('Simplify the user experience');
      recommendations.push('Offer customer support chat');
    }
    if (emotions.hesitation > 0.6) {
      recommendations.push('Show money-back guarantee');
      recommendations.push('Display customer testimonials');
      recommendations.push('Offer price match or discount');
    }
  } else {
    recommendations.push('Provide more engaging content');
    recommendations.push('Show customer reviews and ratings');
  }

  return recommendations;
}

/**
 * Default sentiment for products with no interactions
 */
function getDefaultSentiment(productId: string): SentimentResponse {
  return {
    productId,
    sentiment: 'neutral',
    confidence: 0.1,
    score: 0,
    emotions: {
      excitement: 0,
      hesitation: 0,
      interest: 0.2,
      frustration: 0
    },
    behaviorTriggers: ['No interactions yet'],
    recommendations: ['Monitor initial user interactions']
  };
}