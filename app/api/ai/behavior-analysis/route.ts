import { NextRequest, NextResponse } from 'next/server';

/**
 * AI Behavior Analysis API Route
 * Uses OpenAI/Claude/Groq to analyze user behavior patterns
 */

interface BehaviorAnalysisRequest {
  interactions: any[];
  sessionId: string;
  userAgent?: string;
  timestamp?: number;
}

interface BehaviorData {
  totalInteractions: number;
  pageVisits: number;
  avgHoverDuration: number;
  cartActions: number;
  wishlistActions: number;
  quickBounces: number;
  sessionDuration: number;
  categories: string[];
  timePatterns: any;
  sequencePatterns: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: BehaviorAnalysisRequest = await request.json();
    const { interactions, sessionId, behaviorData } = body as any;

    // If behaviorData is already provided, use it directly
    if (behaviorData && !interactions?.length) {
      const aiAnalysis = await analyzeWithAI(behaviorData);
      return NextResponse.json({
        success: true,
        sessionId,
        analysis: aiAnalysis,
        behaviorData,
        timestamp: Date.now()
      });
    }

    if (!interactions || !Array.isArray(interactions) || interactions.length === 0) {
      // Return a default successful response instead of error
      return NextResponse.json({
        success: true,
        sessionId,
        analysis: getFallbackAnalysis({
          totalInteractions: 0,
          pageVisits: 0,
          avgHoverDuration: 0,
          cartActions: 0,
          wishlistActions: 0,
          quickBounces: 0,
          sessionDuration: 0,
          categories: [],
          timePatterns: {},
          sequencePatterns: ''
        }),
        behaviorData: null,
        timestamp: Date.now()
      });
    }

    // Extract behavior features
    const extractedBehaviorData = extractBehaviorFeatures(interactions);
    
    // Get AI analysis
    const aiAnalysis = await analyzeWithAI(extractedBehaviorData);

    return NextResponse.json({
      success: true,
      sessionId,
      analysis: aiAnalysis,
      behaviorData: extractedBehaviorData,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('AI Behavior Analysis Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze behavior',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Extract behavior features for AI analysis
 */
function extractBehaviorFeatures(interactions: any[]): BehaviorData {
  const now = Date.now();
  const sessionStart = Math.min(...interactions.map((i: any) => i.timestamp));
  
  // Calculate hover durations
  const hoverStarts = interactions.filter((i: any) => i.type === 'hover_start');
  const hoverEnds = interactions.filter((i: any) => i.type === 'hover_end');
  const hoverDurations: number[] = [];
  
  hoverStarts.forEach(start => {
    const correspondingEnd = hoverEnds.find(end => 
      end.productId === start.productId && 
      end.timestamp > start.timestamp &&
      end.timestamp - start.timestamp < 30000 // Within 30 seconds
    );
    
    if (correspondingEnd) {
      hoverDurations.push(correspondingEnd.timestamp - start.timestamp);
    }
  });

  // Extract categories from interactions
  const categories = [...new Set(
    interactions
      .map((i: any) => i.metadata?.category || i.context)
      .filter(Boolean)
  )];

  // Analyze time patterns
  const timePatterns = analyzeTimePatterns(interactions);
  
  // Create sequence pattern
  const sequencePatterns = interactions
    .slice(-20) // Last 20 interactions
    .map((i: any) => i.type)
    .join(' -> ');

  return {
    totalInteractions: interactions.length,
    pageVisits: interactions.filter((i: any) => i.type === 'page_visit').length,
    avgHoverDuration: hoverDurations.length > 0 
      ? hoverDurations.reduce((sum, dur) => sum + dur, 0) / hoverDurations.length 
      : 0,
    cartActions: interactions.filter((i: any) => i.type.includes('cart')).length,
    wishlistActions: interactions.filter((i: any) => i.type.includes('wishlist')).length,
    quickBounces: interactions.filter((i: any) => i.type === 'quick_bounce').length,
    sessionDuration: now - sessionStart,
    categories,
    timePatterns,
    sequencePatterns
  };
}

/**
 * Analyze time patterns in user behavior
 */
function analyzeTimePatterns(interactions: any[]) {
  const timestamps = interactions.map((i: any) => new Date(i.timestamp));
  
  // Calculate time gaps between interactions
  const timeGaps = [];
  for (let i = 1; i < timestamps.length; i++) {
    timeGaps.push(timestamps[i].getTime() - timestamps[i-1].getTime());
  }

  const avgGap = timeGaps.length > 0 
    ? timeGaps.reduce((sum, gap) => sum + gap, 0) / timeGaps.length 
    : 0;

  return {
    averageTimeBetweenActions: avgGap,
    fastActionCount: timeGaps.filter(gap => gap < 1000).length, // <1 second
    slowActionCount: timeGaps.filter(gap => gap > 10000).length, // >10 seconds
    sessionLength: interactions.length > 0 
      ? timestamps[timestamps.length - 1].getTime() - timestamps[0].getTime()
      : 0
  };
}

/**
 * Use AI API to analyze behavior patterns
 */
async function analyzeWithAI(behaviorData: BehaviorData): Promise<any> {
  // Try different AI providers in order of preference
  const providers = [
    { name: 'groq', apiKey: process.env.AI_API_KEY, baseUrl: process.env.AI_BASE_URL },
    { name: 'openai', apiKey: process.env.OPENAI_API_KEY, baseUrl: 'https://api.openai.com/v1' },
    { name: 'anthropic', apiKey: process.env.ANTHROPIC_API_KEY, baseUrl: 'https://api.anthropic.com/v1' }
  ];

  for (const provider of providers) {
    if (provider.apiKey) {
      try {
        return await callAIProvider(provider, behaviorData);
      } catch (error) {
        console.warn(`${provider.name} AI provider failed:`, error);
        continue;
      }
    }
  }

  // Fallback to rule-based analysis if no AI providers work
  return getFallbackAnalysis(behaviorData);
}

/**
 * Call specific AI provider
 */
async function callAIProvider(provider: any, behaviorData: BehaviorData): Promise<any> {
  const prompt = createAnalysisPrompt(behaviorData);
  
  if (provider.name === 'anthropic') {
    return await callClaude(provider, prompt);
  } else {
    return await callOpenAICompatible(provider, prompt);
  }
}

/**
 * Create analysis prompt for AI
 */
function createAnalysisPrompt(data: BehaviorData): string {
  return `
Analyze this e-commerce user behavior and classify the user type. Return ONLY valid JSON.

Behavior Data:
- Total interactions: ${data.totalInteractions}
- Page visits: ${data.pageVisits}
- Average hover duration: ${Math.round(data.avgHoverDuration)}ms
- Cart actions: ${data.cartActions}
- Wishlist actions: ${data.wishlistActions}
- Quick bounces: ${data.quickBounces}
- Session duration: ${Math.round(data.sessionDuration / 1000)}s
- Categories viewed: ${data.categories.join(', ')}
- Sequence pattern: ${data.sequencePatterns}

Classify as one of: impulse_buyer, researcher, price_sensitive, brand_loyal, seasonal, bulk_buyer

Return JSON:
{
  "primaryPattern": "user_type",
  "confidence": 0.85,
  "indicators": ["specific behavioral indicator"],
  "predictedActions": ["likely next action"],
  "timeToConversion": 45,
  "expectedOrderValue": 75.50
}`;
}

/**
 * Call OpenAI-compatible API (OpenAI, Groq, etc.)
 */
async function callOpenAICompatible(provider: any, prompt: string): Promise<any> {
  const response = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${provider.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.NEXT_PUBLIC_AI_MODEL || 'llama-3.3-70b-versatile',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert e-commerce behavior analyst. Return only valid JSON responses.' 
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: parseInt(process.env.AI_MAX_TOKENS || '500'),
      temperature: parseFloat(process.env.AI_TEMPERATURE || '0.3')
    })
  });

  if (!response.ok) {
    throw new Error(`AI API call failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('No AI response content');
  }

  try {
    return JSON.parse(content);
  } catch {
    return parseAIResponseManually(content);
  }
}

/**
 * Call Claude API (Anthropic)
 */
async function callClaude(provider: any, prompt: string): Promise<any> {
  const response = await fetch(`${provider.baseUrl}/messages`, {
    method: 'POST',
    headers: {
      'x-api-key': provider.apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 500,
      messages: [
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Claude API call failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.content[0]?.text;
  
  if (!content) {
    throw new Error('No Claude response content');
  }

  try {
    return JSON.parse(content);
  } catch {
    return parseAIResponseManually(content);
  }
}

/**
 * Parse AI response manually if JSON parsing fails
 */
function parseAIResponseManually(content: string): any {
  // Extract key information using regex patterns
  const patterns = {
    primaryPattern: /["']?primaryPattern["']?\s*:\s*["']([^"']+)["']/i,
    confidence: /["']?confidence["']?\s*:\s*([0-9.]+)/i,
    timeToConversion: /["']?timeToConversion["']?\s*:\s*([0-9]+)/i,
    expectedOrderValue: /["']?expectedOrderValue["']?\s*:\s*([0-9.]+)/i
  };

  const result: any = {
    primaryPattern: 'researcher',
    confidence: 0.5,
    indicators: ['Mixed behavior signals'],
    predictedActions: ['continue browsing'],
    timeToConversion: 60,
    expectedOrderValue: 50
  };

  // Try to extract values
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = content.match(pattern);
    if (match && match[1]) {
      if (key === 'confidence' || key === 'expectedOrderValue') {
        result[key] = parseFloat(match[1]);
      } else if (key === 'timeToConversion') {
        result[key] = parseInt(match[1]);
      } else {
        result[key] = match[1];
      }
    }
  }

  return result;
}

/**
 * Fallback analysis if AI providers fail
 */
function getFallbackAnalysis(data: BehaviorData): any {
  let primaryPattern = 'researcher';
  let confidence = 0.6;
  const indicators = [];
  const predictedActions = [];
  let timeToConversion = 60;
  let expectedOrderValue = 50;

  // Rule-based classification
  if (data.avgHoverDuration < 1000 && data.cartActions > 0) {
    primaryPattern = 'impulse_buyer';
    confidence = 0.8;
    indicators.push('Quick decisions with immediate cart actions');
    predictedActions.push('complete purchase quickly');
    timeToConversion = 15;
    expectedOrderValue = 40;
  } else if (data.pageVisits > 3 && data.avgHoverDuration > 3000) {
    primaryPattern = 'researcher';
    confidence = 0.7;
    indicators.push('Multiple page visits with long engagement');
    predictedActions.push('compare more options', 'read reviews');
    timeToConversion = 120;
    expectedOrderValue = 80;
  } else if (data.wishlistActions > data.cartActions && data.wishlistActions > 0) {
    primaryPattern = 'price_sensitive';
    confidence = 0.6;
    indicators.push('Saves items to wishlist rather than purchasing');
    predictedActions.push('wait for sales', 'compare prices');
    timeToConversion = 180;
    expectedOrderValue = 35;
  }

  return {
    primaryPattern,
    confidence,
    indicators,
    predictedActions,
    timeToConversion,
    expectedOrderValue
  };
}