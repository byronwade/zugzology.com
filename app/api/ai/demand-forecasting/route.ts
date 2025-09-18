import { NextRequest, NextResponse } from 'next/server';

/**
 * AI Demand Forecasting API
 * Predicts future demand using time series analysis and behavioral data
 */

interface ForecastRequest {
  productIds?: string[];
  timeHorizon: number; // forecast period in days
  granularity: 'daily' | 'weekly' | 'monthly';
  includeSeasonality: boolean;
  includeExternalFactors: boolean;
  historicalData?: any[];
  currentBehaviorData?: any[];
}

interface DemandForecast {
  productId: string;
  predictions: Array<{
    date: string;
    predicted_demand: number;
    confidence_interval: {
      lower: number;
      upper: number;
    };
    factors: {
      trend: number;
      seasonality: number;
      behavioral_signals: number;
      external_factors: number;
    };
  }>;
  model_performance: {
    accuracy: number;
    model_type: string;
    training_period: string;
    last_updated: number;
  };
  insights: {
    trend_direction: 'increasing' | 'decreasing' | 'stable';
    peak_periods: string[];
    risk_factors: string[];
    opportunities: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ForecastRequest = await request.json();
    const { 
      productIds = [], 
      timeHorizon, 
      granularity = 'daily',
      includeSeasonality = true,
      includeExternalFactors = false,
      historicalData = [],
      currentBehaviorData = []
    } = body;

    if (!timeHorizon || timeHorizon <= 0 || timeHorizon > 365) {
      return NextResponse.json(
        { error: 'Invalid time horizon (1-365 days)' },
        { status: 400 }
      );
    }

    // Generate forecasts for each product
    const forecasts: DemandForecast[] = [];
    
    for (const productId of productIds) {
      const forecast = await generateProductForecast(
        productId,
        timeHorizon,
        granularity,
        {
          includeSeasonality,
          includeExternalFactors,
          historicalData,
          currentBehaviorData
        }
      );
      forecasts.push(forecast);
    }

    // If no specific products requested, generate overall demand forecast
    if (productIds.length === 0) {
      const overallForecast = await generateOverallDemandForecast(
        timeHorizon,
        granularity,
        { includeSeasonality, currentBehaviorData }
      );
      forecasts.push(overallForecast);
    }

    return NextResponse.json({
      success: true,
      forecasts,
      metadata: {
        time_horizon_days: timeHorizon,
        granularity,
        products_analyzed: forecasts.length,
        model_features: {
          seasonality: includeSeasonality,
          external_factors: includeExternalFactors,
          behavioral_data: currentBehaviorData.length > 0
        },
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Demand Forecasting Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate demand forecast',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Generate demand forecast for a specific product
 */
async function generateProductForecast(
  productId: string,
  timeHorizon: number,
  granularity: 'daily' | 'weekly' | 'monthly',
  options: any
): Promise<DemandForecast> {
  // Analyze historical patterns (mock implementation)
  const historicalAnalysis = analyzeHistoricalPatterns(productId, options.historicalData);
  
  // Analyze current behavioral signals
  const behavioralSignals = analyzeBehavioralSignals(productId, options.currentBehaviorData);
  
  // Generate time series predictions
  const predictions = generateTimeSeriesPredictions(
    productId,
    timeHorizon,
    granularity,
    historicalAnalysis,
    behavioralSignals,
    options
  );

  // Get AI-enhanced forecasting if available
  if (process.env.AI_API_KEY && predictions.length > 0) {
    try {
      const aiEnhancements = await getAIForecastEnhancements(
        productId,
        predictions,
        behavioralSignals
      );
      // Apply AI enhancements to predictions
      predictions.forEach((pred, index) => {
        if (aiEnhancements[index]) {
          pred.predicted_demand *= aiEnhancements[index].adjustment_factor;
          pred.confidence_interval.lower *= aiEnhancements[index].adjustment_factor;
          pred.confidence_interval.upper *= aiEnhancements[index].adjustment_factor;
        }
      });
    } catch (error) {
      console.warn('AI forecast enhancement failed:', error);
    }
  }

  return {
    productId,
    predictions,
    model_performance: {
      accuracy: calculateModelAccuracy(historicalAnalysis),
      model_type: 'hybrid_behavioral_timeseries',
      training_period: '90_days',
      last_updated: Date.now()
    },
    insights: generateForecastInsights(predictions, behavioralSignals)
  };
}

/**
 * Analyze historical demand patterns
 */
function analyzeHistoricalPatterns(productId: string, historicalData: any[]) {
  // Mock historical analysis - in real implementation would analyze:
  // - Sales data over time
  // - Seasonal patterns
  // - Growth trends
  // - Cyclical behaviors
  
  const mockPatterns = {
    trend: Math.random() * 0.4 - 0.2, // -20% to +20% trend
    seasonality_amplitude: Math.random() * 0.3, // 0-30% seasonal variation
    base_demand: Math.floor(Math.random() * 100) + 10, // 10-110 base demand
    volatility: Math.random() * 0.2 + 0.05, // 5-25% volatility
    peak_seasons: ['winter', 'spring'], // Mock seasonal peaks
    declining_periods: ['summer'] // Mock decline periods
  };

  return mockPatterns;
}

/**
 * Analyze current behavioral signals for demand prediction
 */
function analyzeBehavioralSignals(productId: string, behaviorData: any[]) {
  if (!behaviorData || behaviorData.length === 0) {
    return {
      interest_score: 0.5,
      conversion_probability: 0.05,
      urgency_signals: 0.2,
      competitive_threat: 0.1,
      viral_potential: 0.1
    };
  }

  const productInteractions = behaviorData.filter(b => b.productId === productId);
  
  // Calculate behavioral indicators
  const viewCount = productInteractions.filter(b => b.type === 'view').length;
  const cartAdds = productInteractions.filter(b => b.type === 'cart_add').length;
  const wishlistAdds = productInteractions.filter(b => b.type === 'wishlist_add').length;
  const searches = behaviorData.filter(b => b.context === 'search').length;
  
  const totalInteractions = behaviorData.length;
  
  return {
    interest_score: Math.min(1, (viewCount + cartAdds * 2 + wishlistAdds) / Math.max(totalInteractions, 1)),
    conversion_probability: Math.min(1, cartAdds / Math.max(viewCount, 1)),
    urgency_signals: Math.min(1, cartAdds / Math.max(productInteractions.length, 1)),
    competitive_threat: Math.random() * 0.3, // Mock - would analyze competitor activity
    viral_potential: Math.min(1, searches / Math.max(totalInteractions, 1))
  };
}

/**
 * Generate time series predictions using statistical and behavioral models
 */
function generateTimeSeriesPredictions(
  productId: string,
  timeHorizon: number,
  granularity: 'daily' | 'weekly' | 'monthly',
  historical: any,
  behavioral: any,
  options: any
): DemandForecast['predictions'] {
  const predictions: DemandForecast['predictions'] = [];
  const startDate = new Date();
  
  // Determine time step based on granularity
  const timeStep = granularity === 'daily' ? 1 : granularity === 'weekly' ? 7 : 30;
  const periods = Math.ceil(timeHorizon / timeStep);
  
  for (let i = 0; i < periods; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + (i * timeStep));
    
    // Base demand from historical trends
    let baseDemand = historical.base_demand * (1 + historical.trend * (i / periods));
    
    // Apply seasonality if enabled
    if (options.includeSeasonality) {
      const seasonalMultiplier = calculateSeasonalMultiplier(date, historical);
      baseDemand *= seasonalMultiplier;
    }
    
    // Apply behavioral signals
    const behaviorMultiplier = 1 + (behavioral.interest_score * 0.5) + (behavioral.urgency_signals * 0.3);
    baseDemand *= behaviorMultiplier;
    
    // Add noise and volatility
    const noise = (Math.random() - 0.5) * historical.volatility * baseDemand;
    const predictedDemand = Math.max(0, Math.round(baseDemand + noise));
    
    // Calculate confidence intervals
    const confidenceRange = baseDemand * historical.volatility;
    
    predictions.push({
      date: date.toISOString().split('T')[0],
      predicted_demand: predictedDemand,
      confidence_interval: {
        lower: Math.max(0, Math.round(predictedDemand - confidenceRange)),
        upper: Math.round(predictedDemand + confidenceRange)
      },
      factors: {
        trend: historical.trend,
        seasonality: options.includeSeasonality ? calculateSeasonalMultiplier(date, historical) - 1 : 0,
        behavioral_signals: (behaviorMultiplier - 1),
        external_factors: options.includeExternalFactors ? Math.random() * 0.1 - 0.05 : 0
      }
    });
  }
  
  return predictions;
}

/**
 * Calculate seasonal multiplier for a given date
 */
function calculateSeasonalMultiplier(date: Date, historical: any): number {
  const month = date.getMonth();
  const season = getSeason(month);
  
  // Mock seasonal patterns - in real implementation would use historical data
  const seasonalPatterns: Record<string, number> = {
    'winter': 1.2, // 20% increase in winter
    'spring': 1.1, // 10% increase in spring  
    'summer': 0.8, // 20% decrease in summer
    'fall': 1.0   // No change in fall
  };
  
  return seasonalPatterns[season] || 1.0;
}

/**
 * Get season from month
 */
function getSeason(month: number): string {
  if (month >= 11 || month <= 1) return 'winter';
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  return 'fall';
}

/**
 * Generate overall demand forecast when no specific products requested
 */
async function generateOverallDemandForecast(
  timeHorizon: number,
  granularity: 'daily' | 'weekly' | 'monthly',
  options: any
): Promise<DemandForecast> {
  // Mock overall demand analysis
  const historicalAnalysis = {
    trend: 0.05, // 5% growth trend
    seasonality_amplitude: 0.15,
    base_demand: 500, // Overall daily demand
    volatility: 0.1,
    peak_seasons: ['winter', 'spring'],
    declining_periods: []
  };
  
  const behavioralSignals = {
    interest_score: 0.6,
    conversion_probability: 0.08,
    urgency_signals: 0.3,
    competitive_threat: 0.2,
    viral_potential: 0.25
  };
  
  const predictions = generateTimeSeriesPredictions(
    'overall',
    timeHorizon,
    granularity,
    historicalAnalysis,
    behavioralSignals,
    options
  );

  return {
    productId: 'overall_demand',
    predictions,
    model_performance: {
      accuracy: 0.78,
      model_type: 'aggregate_demand_model',
      training_period: '180_days',
      last_updated: Date.now()
    },
    insights: generateForecastInsights(predictions, behavioralSignals)
  };
}

/**
 * Calculate model accuracy based on historical analysis
 */
function calculateModelAccuracy(historical: any): number {
  // Mock accuracy calculation - in real implementation would validate against holdout data
  const baseAccuracy = 0.7;
  const trendBonus = Math.abs(historical.trend) < 0.1 ? 0.1 : 0; // More accurate for stable trends
  const volatilityPenalty = historical.volatility * 0.3; // Less accurate for volatile products
  
  return Math.max(0.4, Math.min(0.95, baseAccuracy + trendBonus - volatilityPenalty));
}

/**
 * Generate insights from forecast predictions
 */
function generateForecastInsights(
  predictions: DemandForecast['predictions'],
  behavioral: any
): DemandForecast['insights'] {
  if (predictions.length === 0) {
    return {
      trend_direction: 'stable',
      peak_periods: [],
      risk_factors: ['Insufficient data for analysis'],
      opportunities: []
    };
  }

  // Analyze trend direction
  const firstPrediction = predictions[0].predicted_demand;
  const lastPrediction = predictions[predictions.length - 1].predicted_demand;
  const trendDirection = lastPrediction > firstPrediction * 1.1 ? 'increasing' 
                      : lastPrediction < firstPrediction * 0.9 ? 'decreasing' 
                      : 'stable';

  // Find peak periods
  const avgDemand = predictions.reduce((sum, p) => sum + p.predicted_demand, 0) / predictions.length;
  const peakPeriods = predictions
    .filter(p => p.predicted_demand > avgDemand * 1.2)
    .map(p => p.date);

  // Identify risk factors
  const riskFactors = [];
  if (behavioral.competitive_threat > 0.3) {
    riskFactors.push('High competitive pressure detected');
  }
  if (predictions.some(p => p.confidence_interval.upper - p.confidence_interval.lower > p.predicted_demand)) {
    riskFactors.push('High forecast uncertainty');
  }
  if (trendDirection === 'decreasing') {
    riskFactors.push('Declining demand trend');
  }

  // Identify opportunities
  const opportunities = [];
  if (behavioral.viral_potential > 0.4) {
    opportunities.push('High viral marketing potential');
  }
  if (trendDirection === 'increasing') {
    opportunities.push('Growing market demand');
  }
  if (peakPeriods.length > 0) {
    opportunities.push(`Peak demand periods identified: ${peakPeriods.slice(0, 3).join(', ')}`);
  }

  return {
    trend_direction: trendDirection as DemandForecast['insights']['trend_direction'],
    peak_periods: peakPeriods.slice(0, 5), // Top 5 peak periods
    risk_factors: riskFactors,
    opportunities: opportunities
  };
}

/**
 * Get AI-enhanced forecasting adjustments
 */
async function getAIForecastEnhancements(
  productId: string,
  predictions: DemandForecast['predictions'],
  behavioral: any
): Promise<Array<{ adjustment_factor: number; reasoning: string }>> {
  const prompt = `
Analyze this demand forecast and provide adjustment factors:

Product: ${productId}
Predicted Demand Range: ${Math.min(...predictions.map(p => p.predicted_demand))} - ${Math.max(...predictions.map(p => p.predicted_demand))}
Behavioral Signals: Interest=${behavioral.interest_score}, Urgency=${behavioral.urgency_signals}
Forecast Period: ${predictions.length} periods

Consider:
1. Market trends and external factors
2. Behavioral signal strength
3. Seasonal adjustments
4. Competitive landscape

Return JSON array with adjustment factors (0.5-2.0 range):
[{"adjustment_factor": 1.1, "reasoning": "Strong behavioral signals"}, ...]
`;

  try {
    const response = await fetch('/api/ai/behavior-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        interactions: [],
        sessionId: 'forecast-enhancement',
        customPrompt: prompt
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.adjustments || predictions.map(() => ({ adjustment_factor: 1.0, reasoning: 'No AI adjustment' }));
    }
  } catch (error) {
    console.warn('AI forecast enhancement failed:', error);
  }

  // Return neutral adjustments as fallback
  return predictions.map(() => ({ adjustment_factor: 1.0, reasoning: 'AI enhancement unavailable' }));
}