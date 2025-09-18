"use client";

import { advancedBehaviorTracker } from './advanced-behavior-tracker';
import { aiContentManipulator } from './ai-content-manipulator';
import { aiABTestingFramework } from './ai-ab-testing';

export interface PerformanceMetric {
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: number;
}

export interface AIImpactAnalysis {
  overall: {
    conversionRate: PerformanceMetric;
    averageOrderValue: PerformanceMetric;
    revenue: PerformanceMetric;
    engagement: PerformanceMetric;
    bounceRate: PerformanceMetric;
  };
  byFeature: {
    productReordering: PerformanceMetric;
    componentArrangement: PerformanceMetric;
    personalization: PerformanceMetric;
    marginOptimization: PerformanceMetric;
  };
  byUserSegment: Map<string, {
    segment: string;
    metrics: PerformanceMetric[];
    sampleSize: number;
  }>;
  confidence: number;
  statistically_significant: boolean;
}

class AIPerformanceTracker {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private baselineMetrics: Map<string, number> = new Map();
  private performanceHistory: Map<string, number[]> = new Map();
  private sessionStartTime: number;
  private trackingEnabled: boolean = true;

  constructor() {
    this.sessionStartTime = Date.now();
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private initialize() {
    this.loadBaselineMetrics();
    this.setupPerformanceTracking();
    this.startPeriodicAnalysis();
  }

  private loadBaselineMetrics() {
    // Load historical baseline data from localStorage
    try {
      const saved = localStorage.getItem('ai_baseline_metrics');
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.entries(parsed).forEach(([key, value]) => {
          this.baselineMetrics.set(key, value as number);
        });
      } else {
        // Set default baselines
        this.setDefaultBaselines();
      }
    } catch (error) {
      console.error('Failed to load baseline metrics:', error);
      this.setDefaultBaselines();
    }
  }

  private setDefaultBaselines() {
    this.baselineMetrics.set('conversion_rate', 2.5); // 2.5% baseline
    this.baselineMetrics.set('average_order_value', 45.00);
    this.baselineMetrics.set('bounce_rate', 65.0);
    this.baselineMetrics.set('time_on_site', 120000); // 2 minutes
    this.baselineMetrics.set('pages_per_session', 3.2);
    this.baselineMetrics.set('cart_abandonment_rate', 70.0);
  }

  private setupPerformanceTracking() {
    // Track conversion events
    window.addEventListener('cart-add', (event: any) => {
      this.trackConversionEvent('cart_add', event.detail);
    });

    window.addEventListener('purchase-complete', (event: any) => {
      this.trackConversionEvent('purchase', event.detail);
    });

    // Track AI manipulation events
    window.addEventListener('product-reorder-applied', (event: any) => {
      this.trackAIEvent('product_reorder', event.detail);
    });

    window.addEventListener('component-arrangement-changed', (event: any) => {
      this.trackAIEvent('component_arrangement', event.detail);
    });

    // Track user engagement
    window.addEventListener('behavior-tracked', (event: any) => {
      this.trackEngagementEvent(event.detail);
    });

    // Track page performance
    this.trackPagePerformance();
  }

  private startPeriodicAnalysis() {
    // Run analysis every 2 minutes
    setInterval(() => {
      this.analyzePerformance();
      this.calculateAIImpact();
    }, 2 * 60 * 1000);

    // Save metrics every 30 seconds
    setInterval(() => {
      this.saveMetrics();
    }, 30 * 1000);
  }

  private trackConversionEvent(type: string, data: any) {
    const timestamp = Date.now();
    const sessionDuration = timestamp - this.sessionStartTime;

    // Update conversion metrics
    this.updateMetric('conversions', 1);
    
    if (type === 'purchase' && data.orderValue) {
      this.updateMetric('revenue', data.orderValue);
      this.updateMetric('average_order_value', data.orderValue);
    }

    // Track conversion timing
    this.updateMetric('time_to_conversion', sessionDuration);

    // Analyze AI influence on this conversion
    this.analyzeAIInfluenceOnConversion(data);
  }

  private trackAIEvent(type: string, data: any) {
    const timestamp = Date.now();
    
    // Track AI intervention frequency
    this.updateMetric(`ai_${type}_frequency`, 1);
    
    // Track effectiveness based on subsequent user behavior
    setTimeout(() => {
      this.measureAIEventEffectiveness(type, timestamp);
    }, 30000); // Measure effectiveness after 30 seconds
  }

  private trackEngagementEvent(data: any) {
    switch (data.type) {
      case 'hover':
        this.updateMetric('hover_events', 1);
        this.updateMetric('average_hover_duration', data.duration || 0);
        break;
      case 'view':
        this.updateMetric('page_views', 1);
        break;
      case 'search':
        this.updateMetric('search_events', 1);
        break;
      case 'scroll':
        this.updateMetric('scroll_depth', data.depth || 0);
        break;
    }
  }

  private trackPagePerformance() {
    // Track Core Web Vitals
    if ('web-vital' in window) {
      const vitals = (window as any)['web-vital'];
      
      vitals.getCLS((metric: any) => {
        this.updateMetric('cls', metric.value);
      });
      
      vitals.getFID((metric: any) => {
        this.updateMetric('fid', metric.value);
      });
      
      vitals.getLCP((metric: any) => {
        this.updateMetric('lcp', metric.value);
      });
    }

    // Track loading performance
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.updateMetric('page_load_time', navigation.loadEventEnd - navigation.fetchStart);
        this.updateMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart);
      }
    });
  }

  private updateMetric(name: string, value: number) {
    const existing = this.metrics.get(name);
    const previousValue = existing?.value || 0;
    
    let newValue: number;
    
    // Different update strategies based on metric type
    if (name.includes('rate') || name.includes('average') || name.includes('duration')) {
      // Use moving average for rates and averages
      newValue = existing ? (previousValue * 0.8 + value * 0.2) : value;
    } else {
      // Use cumulative for counts
      newValue = (existing?.value || 0) + value;
    }

    const change = newValue - previousValue;
    const changePercent = previousValue !== 0 ? (change / previousValue) * 100 : 0;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(changePercent) > 1) {
      trend = changePercent > 0 ? 'up' : 'down';
    }

    const metric: PerformanceMetric = {
      name,
      value: newValue,
      previousValue,
      change,
      changePercent,
      trend,
      lastUpdated: Date.now()
    };

    this.metrics.set(name, metric);
    
    // Track history
    const history = this.performanceHistory.get(name) || [];
    history.push(newValue);
    if (history.length > 100) {
      history.shift(); // Keep last 100 values
    }
    this.performanceHistory.set(name, history);
  }

  private analyzeAIInfluenceOnConversion(conversionData: any) {
    const activeManipulations = aiContentManipulator.getActiveManipulations();
    const userBehavior = advancedBehaviorTracker.getBehaviorData();
    
    // Calculate AI influence score
    let aiInfluenceScore = 0;
    const influences: string[] = [];

    // Check for recent AI manipulations
    const recentManipulations = activeManipulations.filter(
      m => Date.now() - m.timestamp < 5 * 60 * 1000 // Last 5 minutes
    );

    if (recentManipulations.length > 0) {
      aiInfluenceScore += recentManipulations.length * 0.2;
      influences.push(`${recentManipulations.length} recent AI optimizations`);
    }

    // Check for high prediction confidence
    const predictions = advancedBehaviorTracker.getPredictedProducts();
    const highConfidencePredictions = predictions.filter(p => p.score > 70);
    
    if (highConfidencePredictions.length > 0) {
      aiInfluenceScore += 0.3;
      influences.push('High confidence predictions');
    }

    // Check for personalization
    if (userBehavior.searchHistory?.length > 0 || userBehavior.viewedProducts?.length > 3) {
      aiInfluenceScore += 0.2;
      influences.push('Personalized experience');
    }

    // Track AI-influenced conversion
    if (aiInfluenceScore > 0.3) {
      this.updateMetric('ai_influenced_conversions', 1);
      this.updateMetric('ai_influence_score', aiInfluenceScore);
      
      // Emit AI success event
      window.dispatchEvent(new CustomEvent('ai-conversion-success', {
        detail: {
          conversionData,
          aiInfluenceScore,
          influences,
          timestamp: Date.now()
        }
      }));
    }
  }

  private measureAIEventEffectiveness(eventType: string, eventTimestamp: number) {
    const timeSinceEvent = Date.now() - eventTimestamp;
    const behaviorData = advancedBehaviorTracker.getBehaviorData();
    
    // Measure effectiveness based on subsequent behavior
    let effectivenessScore = 0;
    
    // Check for increased engagement
    const recentInteractions = behaviorData.interactions?.filter(
      (i: any) => i.timestamp > eventTimestamp
    ) || [];
    
    if (recentInteractions.length > 0) {
      effectivenessScore += Math.min(1.0, recentInteractions.length * 0.2);
    }

    // Check for conversions
    const conversions = recentInteractions.filter((i: any) => 
      i.type === 'cart' || i.type === 'wishlist'
    );
    
    if (conversions.length > 0) {
      effectivenessScore += conversions.length * 0.5;
    }

    this.updateMetric(`ai_${eventType}_effectiveness`, effectivenessScore);
  }

  private analyzePerformance() {
    const currentMetrics = Object.fromEntries(this.metrics);
    
    // Calculate overall performance score
    const conversionRate = this.metrics.get('conversions')?.value || 0;
    const baseline = this.baselineMetrics.get('conversion_rate') || 2.5;
    const performanceScore = (conversionRate / baseline) * 100;
    
    this.updateMetric('overall_performance_score', performanceScore);
    
    // Analyze trends
    this.analyzeTrends();
    
    // Calculate confidence intervals
    this.calculateConfidenceIntervals();
  }

  private analyzeTrends() {
    this.performanceHistory.forEach((history, metricName) => {
      if (history.length < 10) return;
      
      // Calculate trend over last 10 data points
      const recent = history.slice(-10);
      const older = history.slice(-20, -10);
      
      if (older.length === 0) return;
      
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
      
      const trendStrength = ((recentAvg - olderAvg) / olderAvg) * 100;
      
      this.updateMetric(`${metricName}_trend_strength`, trendStrength);
    });
  }

  private calculateConfidenceIntervals() {
    // Simple confidence calculation based on sample size and variance
    this.metrics.forEach((metric, name) => {
      const history = this.performanceHistory.get(name) || [];
      
      if (history.length < 30) {
        this.updateMetric(`${name}_confidence`, Math.min(95, history.length * 3));
      } else {
        // Calculate variance
        const mean = history.reduce((a, b) => a + b, 0) / history.length;
        const variance = history.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / history.length;
        const stdDev = Math.sqrt(variance);
        
        // Lower variance = higher confidence
        const confidence = Math.max(50, Math.min(95, 95 - (stdDev / mean) * 100));
        this.updateMetric(`${name}_confidence`, confidence);
      }
    });
  }

  private calculateAIImpact(): AIImpactAnalysis {
    const baseline = {
      conversionRate: this.baselineMetrics.get('conversion_rate') || 2.5,
      averageOrderValue: this.baselineMetrics.get('average_order_value') || 45,
      bounceRate: this.baselineMetrics.get('bounce_rate') || 65,
      timeOnSite: this.baselineMetrics.get('time_on_site') || 120000,
    };

    const current = {
      conversionRate: this.getMetricValue('conversions') || baseline.conversionRate,
      averageOrderValue: this.getMetricValue('average_order_value') || baseline.averageOrderValue,
      bounceRate: this.getMetricValue('bounce_rate') || baseline.bounceRate,
      timeOnSite: this.getMetricValue('time_on_site') || baseline.timeOnSite,
    };

    // Calculate overall impact
    const overall = {
      conversionRate: this.createMetricComparison('Conversion Rate', current.conversionRate, baseline.conversionRate),
      averageOrderValue: this.createMetricComparison('Average Order Value', current.averageOrderValue, baseline.averageOrderValue),
      revenue: this.createMetricComparison('Revenue', current.conversionRate * current.averageOrderValue, baseline.conversionRate * baseline.averageOrderValue),
      engagement: this.createMetricComparison('Engagement', current.timeOnSite, baseline.timeOnSite),
      bounceRate: this.createMetricComparison('Bounce Rate', baseline.bounceRate, current.bounceRate), // Inverted (lower is better)
    };

    // Calculate feature-specific impact
    const byFeature = {
      productReordering: this.createMetricComparison('Product Reordering', this.getMetricValue('ai_product_reorder_effectiveness') || 0, 0),
      componentArrangement: this.createMetricComparison('Component Arrangement', this.getMetricValue('ai_component_arrangement_effectiveness') || 0, 0),
      personalization: this.createMetricComparison('Personalization', this.getMetricValue('ai_influence_score') || 0, 0),
      marginOptimization: this.createMetricComparison('Margin Optimization', this.getMetricValue('ai_influenced_conversions') || 0, 0),
    };

    // Calculate statistical significance
    const conversionImprovement = overall.conversionRate.changePercent;
    const sampleSize = this.getMetricValue('page_views') || 0;
    const confidence = this.calculateStatisticalSignificance(conversionImprovement, sampleSize);

    return {
      overall,
      byFeature,
      byUserSegment: new Map(), // TODO: Implement segment-specific analysis
      confidence,
      statistically_significant: confidence >= 95
    };
  }

  private createMetricComparison(name: string, current: number, baseline: number): PerformanceMetric {
    const change = current - baseline;
    const changePercent = baseline !== 0 ? (change / baseline) * 100 : 0;
    
    return {
      name,
      value: current,
      previousValue: baseline,
      change,
      changePercent,
      trend: changePercent > 1 ? 'up' : changePercent < -1 ? 'down' : 'stable',
      lastUpdated: Date.now()
    };
  }

  private calculateStatisticalSignificance(improvement: number, sampleSize: number): number {
    // Simplified significance calculation
    if (sampleSize < 100) return Math.min(70, sampleSize);
    if (Math.abs(improvement) < 1) return 50;
    
    const significance = Math.min(95, 50 + (Math.abs(improvement) * 10) + (sampleSize / 100 * 5));
    return Math.round(significance);
  }

  private getMetricValue(name: string): number | undefined {
    return this.metrics.get(name)?.value;
  }

  private saveMetrics() {
    try {
      const metricsToSave = Object.fromEntries(this.metrics);
      localStorage.setItem('ai_performance_metrics', JSON.stringify(metricsToSave));
      
      const baselineToSave = Object.fromEntries(this.baselineMetrics);
      localStorage.setItem('ai_baseline_metrics', JSON.stringify(baselineToSave));
    } catch (error) {
      console.error('Failed to save performance metrics:', error);
    }
  }

  // Public API methods
  public getMetrics(): Map<string, PerformanceMetric> {
    return new Map(this.metrics);
  }

  public getAIImpactAnalysis(): AIImpactAnalysis {
    return this.calculateAIImpact();
  }

  public getPerformanceSummary() {
    const impact = this.calculateAIImpact();
    const totalManipulations = aiContentManipulator.getActiveManipulations().length;
    const optimizationStats = aiContentManipulator.getOptimizationStats();
    
    return {
      aiImpact: impact,
      totalAIManipulations: totalManipulations,
      optimizationStats,
      confidence: impact.confidence,
      isSignificant: impact.statistically_significant,
      lastUpdate: Date.now()
    };
  }

  public resetBaseline() {
    this.setDefaultBaselines();
    this.metrics.clear();
    this.performanceHistory.clear();
  }

  public setCustomBaseline(metricName: string, value: number) {
    this.baselineMetrics.set(metricName, value);
    this.saveMetrics();
  }

  public enableTracking(enabled: boolean) {
    this.trackingEnabled = enabled;
  }

  public exportData() {
    return {
      metrics: Object.fromEntries(this.metrics),
      baselines: Object.fromEntries(this.baselineMetrics),
      history: Object.fromEntries(this.performanceHistory),
      impact: this.calculateAIImpact(),
      exportedAt: Date.now()
    };
  }
}

// Export singleton instance
export const aiPerformanceTracker = new AIPerformanceTracker();
export default aiPerformanceTracker;