"use client";

import { advancedBehaviorTracker } from './advanced-behavior-tracker';
import { conversionOptimizer } from './conversion-optimizer';

export interface ABTestVariant {
  id: string;
  name: string;
  weight: number; // 0-1, percentage of traffic
  config: {
    subtletyMode: 'aggressive' | 'balanced' | 'subtle';
    reorderingEnabled: boolean;
    componentRearrangementEnabled: boolean;
    personalizationStrength: number; // 0-1
    marginOptimizationEnabled: boolean;
  };
  performance: {
    impressions: number;
    conversions: number;
    conversionRate: number;
    averageOrderValue: number;
    bounceRate: number;
    timeOnSite: number;
    confidenceInterval: number;
  };
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: ABTestVariant[];
  primaryMetric: 'conversion_rate' | 'revenue' | 'engagement' | 'retention';
  segments: string[]; // user segments to include
  pages: string[]; // pages to run test on
  minSampleSize: number;
  confidenceLevel: number; // 0.95 = 95% confidence
  winner?: string; // variant ID
}

class AIABTestingFramework {
  private activeTests: Map<string, ABTest> = new Map();
  private userAssignments: Map<string, Map<string, string>> = new Map(); // userId -> testId -> variantId
  private testResults: Map<string, any> = new Map();
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private generateSessionId(): string {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initialize() {
    this.loadActiveTests();
    this.loadUserAssignments();
    this.setupEventTracking();
    this.startAutoOptimization();
  }

  private loadActiveTests() {
    // Default AI optimization tests
    const defaultTests: ABTest[] = [
      {
        id: 'ai-subtlety-test',
        name: 'AI Subtlety Optimization',
        description: 'Test different levels of AI manipulation subtlety',
        startDate: new Date(),
        status: 'running',
        variants: [
          {
            id: 'control',
            name: 'No AI Optimization',
            weight: 0.2,
            config: {
              subtletyMode: 'subtle',
              reorderingEnabled: false,
              componentRearrangementEnabled: false,
              personalizationStrength: 0,
              marginOptimizationEnabled: false
            },
            performance: this.initializePerformanceMetrics()
          },
          {
            id: 'subtle',
            name: 'Subtle AI Optimization',
            weight: 0.3,
            config: {
              subtletyMode: 'subtle',
              reorderingEnabled: true,
              componentRearrangementEnabled: true,
              personalizationStrength: 0.3,
              marginOptimizationEnabled: true
            },
            performance: this.initializePerformanceMetrics()
          },
          {
            id: 'balanced',
            name: 'Balanced AI Optimization',
            weight: 0.3,
            config: {
              subtletyMode: 'balanced',
              reorderingEnabled: true,
              componentRearrangementEnabled: true,
              personalizationStrength: 0.6,
              marginOptimizationEnabled: true
            },
            performance: this.initializePerformanceMetrics()
          },
          {
            id: 'aggressive',
            name: 'Aggressive AI Optimization',
            weight: 0.2,
            config: {
              subtletyMode: 'aggressive',
              reorderingEnabled: true,
              componentRearrangementEnabled: true,
              personalizationStrength: 1.0,
              marginOptimizationEnabled: true
            },
            performance: this.initializePerformanceMetrics()
          }
        ],
        primaryMetric: 'conversion_rate',
        segments: ['all'],
        pages: ['/', '/collections/*', '/products/*'],
        minSampleSize: 100,
        confidenceLevel: 0.95
      },
      {
        id: 'personalization-strength-test',
        name: 'Personalization Strength Test',
        description: 'Test different levels of personalization strength',
        startDate: new Date(),
        status: 'running',
        variants: [
          {
            id: 'low-personalization',
            name: 'Low Personalization',
            weight: 0.33,
            config: {
              subtletyMode: 'balanced',
              reorderingEnabled: true,
              componentRearrangementEnabled: false,
              personalizationStrength: 0.2,
              marginOptimizationEnabled: false
            },
            performance: this.initializePerformanceMetrics()
          },
          {
            id: 'medium-personalization',
            name: 'Medium Personalization',
            weight: 0.34,
            config: {
              subtletyMode: 'balanced',
              reorderingEnabled: true,
              componentRearrangementEnabled: true,
              personalizationStrength: 0.6,
              marginOptimizationEnabled: true
            },
            performance: this.initializePerformanceMetrics()
          },
          {
            id: 'high-personalization',
            name: 'High Personalization',
            weight: 0.33,
            config: {
              subtletyMode: 'balanced',
              reorderingEnabled: true,
              componentRearrangementEnabled: true,
              personalizationStrength: 1.0,
              marginOptimizationEnabled: true
            },
            performance: this.initializePerformanceMetrics()
          }
        ],
        primaryMetric: 'revenue',
        segments: ['returning', 'loyal', 'high-value'],
        pages: ['/', '/collections/*'],
        minSampleSize: 150,
        confidenceLevel: 0.95
      }
    ];

    defaultTests.forEach(test => {
      this.activeTests.set(test.id, test);
    });
  }

  private initializePerformanceMetrics() {
    return {
      impressions: 0,
      conversions: 0,
      conversionRate: 0,
      averageOrderValue: 0,
      bounceRate: 0,
      timeOnSite: 0,
      confidenceInterval: 0
    };
  }

  private loadUserAssignments() {
    try {
      const saved = localStorage.getItem('ai_ab_assignments');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.userAssignments = new Map(Object.entries(parsed).map(([userId, tests]: [string, any]) => [
          userId,
          new Map(Object.entries(tests))
        ]));
      }
    } catch (error) {
      console.error('Failed to load user assignments:', error);
    }
  }

  private saveUserAssignments() {
    try {
      const toSave = Object.fromEntries(
        Array.from(this.userAssignments.entries()).map(([userId, tests]) => [
          userId,
          Object.fromEntries(tests)
        ])
      );
      localStorage.setItem('ai_ab_assignments', JSON.stringify(toSave));
    } catch (error) {
      console.error('Failed to save user assignments:', error);
    }
  }

  private setupEventTracking() {
    // Track conversions
    window.addEventListener('cart-add', (event: any) => {
      this.trackEvent('cart_add', event.detail);
    });

    window.addEventListener('purchase-complete', (event: any) => {
      this.trackEvent('conversion', event.detail);
    });

    // Track engagement
    window.addEventListener('behavior-tracked', (event: any) => {
      this.trackEvent('engagement', event.detail);
    });

    // Track page views
    this.trackEvent('page_view', { path: window.location.pathname });
  }

  private startAutoOptimization() {
    // Run statistical analysis every 5 minutes
    setInterval(() => {
      this.analyzeTestResults();
      this.optimizeTrafficAllocation();
    }, 5 * 60 * 1000);
  }

  public assignUserToTests(userId: string): Map<string, string> {
    if (!this.userAssignments.has(userId)) {
      this.userAssignments.set(userId, new Map());
    }

    const userTests = this.userAssignments.get(userId)!;
    const userSegment = this.getUserSegment();
    const currentPage = window.location.pathname;

    this.activeTests.forEach((test, testId) => {
      // Check if user should be included in this test
      if (!this.shouldIncludeUserInTest(test, userSegment, currentPage)) {
        return;
      }

      // Assign to variant if not already assigned
      if (!userTests.has(testId)) {
        const variantId = this.selectVariant(test);
        userTests.set(testId, variantId);
        
        // Track assignment
        this.trackEvent('test_assignment', {
          testId,
          variantId,
          userSegment,
          userId
        });
      }
    });

    this.saveUserAssignments();
    return userTests;
  }

  private shouldIncludeUserInTest(test: ABTest, userSegment: string, currentPage: string): boolean {
    // Check if user segment is included
    if (!test.segments.includes('all') && !test.segments.includes(userSegment)) {
      return false;
    }

    // Check if current page is included
    const pageMatch = test.pages.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(currentPage);
      }
      return pattern === currentPage;
    });

    return pageMatch;
  }

  private selectVariant(test: ABTest): string {
    const random = Math.random();
    let cumulative = 0;

    for (const variant of test.variants) {
      cumulative += variant.weight;
      if (random <= cumulative) {
        return variant.id;
      }
    }

    // Fallback to first variant
    return test.variants[0].id;
  }

  public getActiveVariant(testId: string, userId: string = this.sessionId): ABTestVariant | null {
    const test = this.activeTests.get(testId);
    if (!test) return null;

    const assignments = this.assignUserToTests(userId);
    const variantId = assignments.get(testId);
    
    if (!variantId) return null;

    return test.variants.find(v => v.id === variantId) || null;
  }

  public applyVariantConfiguration(variant: ABTestVariant) {
    const { config } = variant;
    
    // Apply configuration to AI systems
    const { aiContentManipulator } = require('./ai-content-manipulator');
    
    aiContentManipulator.setSubtletyMode(config.subtletyMode);
    
    // Emit configuration change event
    window.dispatchEvent(new CustomEvent('ai-config-changed', {
      detail: {
        variant: variant.id,
        config,
        timestamp: Date.now()
      }
    }));

    // Track configuration application
    this.trackEvent('variant_applied', {
      variantId: variant.id,
      config
    });
  }

  private trackEvent(eventType: string, data: any) {
    const userId = this.sessionId;
    const assignments = this.userAssignments.get(userId);
    
    if (!assignments) return;

    // Update performance metrics for each active test
    assignments.forEach((variantId, testId) => {
      const test = this.activeTests.get(testId);
      if (!test) return;

      const variant = test.variants.find(v => v.id === variantId);
      if (!variant) return;

      // Update metrics based on event type
      switch (eventType) {
        case 'page_view':
          variant.performance.impressions++;
          break;
        case 'cart_add':
        case 'conversion':
          variant.performance.conversions++;
          variant.performance.conversionRate = 
            variant.performance.conversions / Math.max(1, variant.performance.impressions);
          
          if (data.orderValue) {
            variant.performance.averageOrderValue = 
              (variant.performance.averageOrderValue + data.orderValue) / 2;
          }
          break;
        case 'engagement':
          // Track time on site
          if (data.timeSpent) {
            variant.performance.timeOnSite = 
              (variant.performance.timeOnSite + data.timeSpent) / 2;
          }
          break;
      }
    });

    // Save test results
    this.saveTestResults();
  }

  private saveTestResults() {
    try {
      const results = Object.fromEntries(this.activeTests);
      localStorage.setItem('ai_ab_test_results', JSON.stringify(results));
    } catch (error) {
      console.error('Failed to save test results:', error);
    }
  }

  private analyzeTestResults() {
    this.activeTests.forEach((test, testId) => {
      // Calculate statistical significance
      const results = this.calculateStatisticalSignificance(test);
      
      if (results.isSignificant && results.winner) {
        // Auto-declare winner if significantly better
        if (!test.winner && this.shouldAutoDeclareWinner(test, results)) {
          test.winner = results.winner;
          test.status = 'completed';
          
          // Emit winner event
          window.dispatchEvent(new CustomEvent('ab-test-winner', {
            detail: {
              testId,
              winner: results.winner,
              confidence: results.confidence,
              improvement: results.improvement
            }
          }));
        }
      }
    });
  }

  private calculateStatisticalSignificance(test: ABTest) {
    const variants = test.variants.filter(v => v.performance.impressions >= test.minSampleSize);
    
    if (variants.length < 2) {
      return { isSignificant: false, winner: null, confidence: 0, improvement: 0 };
    }

    // Find best performing variant
    const bestVariant = variants.reduce((best, current) => {
      const bestMetric = this.getMetricValue(best, test.primaryMetric);
      const currentMetric = this.getMetricValue(current, test.primaryMetric);
      return currentMetric > bestMetric ? current : best;
    });

    // Simple significance calculation (in real implementation, use proper statistical tests)
    const controlVariant = variants.find(v => v.id === 'control') || variants[0];
    const bestMetric = this.getMetricValue(bestVariant, test.primaryMetric);
    const controlMetric = this.getMetricValue(controlVariant, test.primaryMetric);
    
    const improvement = ((bestMetric - controlMetric) / controlMetric) * 100;
    const confidence = Math.min(95, Math.max(50, 
      (bestVariant.performance.impressions / test.minSampleSize) * 90
    ));

    return {
      isSignificant: confidence >= test.confidenceLevel * 100,
      winner: bestVariant.id,
      confidence,
      improvement
    };
  }

  private getMetricValue(variant: ABTestVariant, metric: string): number {
    switch (metric) {
      case 'conversion_rate':
        return variant.performance.conversionRate;
      case 'revenue':
        return variant.performance.averageOrderValue * variant.performance.conversions;
      case 'engagement':
        return variant.performance.timeOnSite;
      default:
        return variant.performance.conversionRate;
    }
  }

  private shouldAutoDeclareWinner(test: ABTest, results: any): boolean {
    return results.confidence >= 95 && results.improvement >= 5; // 5% improvement minimum
  }

  private optimizeTrafficAllocation() {
    // Multi-armed bandit approach - allocate more traffic to better performing variants
    this.activeTests.forEach(test => {
      if (test.status !== 'running') return;

      const totalPerformance = test.variants.reduce((sum, variant) => {
        return sum + this.getMetricValue(variant, test.primaryMetric);
      }, 0);

      if (totalPerformance > 0) {
        test.variants.forEach(variant => {
          const performanceRatio = this.getMetricValue(variant, test.primaryMetric) / totalPerformance;
          // Gradually shift traffic towards better performers
          variant.weight = variant.weight * 0.9 + performanceRatio * 0.1;
        });

        // Normalize weights
        const totalWeight = test.variants.reduce((sum, v) => sum + v.weight, 0);
        test.variants.forEach(variant => {
          variant.weight = variant.weight / totalWeight;
        });
      }
    });
  }

  private getUserSegment(): string {
    const userPreferences = advancedBehaviorTracker.getUserPreferences();
    const predictions = advancedBehaviorTracker.getPredictedProducts();
    
    if (userPreferences.cart.length > 5 || userPreferences.wishlist.length > 10) {
      return 'high-value';
    } else if (predictions.length > 5) {
      return 'loyal';
    } else if (userPreferences.searchHistory.length > 3) {
      return 'returning';
    } else {
      return 'new';
    }
  }

  // Public API methods
  public getCurrentTests(): ABTest[] {
    return Array.from(this.activeTests.values()).filter(test => test.status === 'running');
  }

  public getTestResults(testId: string): ABTest | undefined {
    return this.activeTests.get(testId);
  }

  public initializeForUser(userId: string = this.sessionId) {
    const assignments = this.assignUserToTests(userId);
    
    // Apply configurations for all assigned variants
    assignments.forEach((variantId, testId) => {
      const variant = this.getActiveVariant(testId, userId);
      if (variant) {
        this.applyVariantConfiguration(variant);
      }
    });

    return assignments;
  }

  public getOptimizationConfig(): any {
    const userId = this.sessionId;
    const assignments = this.userAssignments.get(userId);
    
    if (!assignments) return null;

    // Merge configurations from all active variants
    const config = {
      subtletyMode: 'balanced' as const,
      reorderingEnabled: true,
      componentRearrangementEnabled: true,
      personalizationStrength: 0.6,
      marginOptimizationEnabled: true
    };

    assignments.forEach((variantId, testId) => {
      const variant = this.getActiveVariant(testId, userId);
      if (variant) {
        // Apply variant configuration (last one wins for conflicts)
        Object.assign(config, variant.config);
      }
    });

    return config;
  }
}

// Export singleton instance
export const aiABTestingFramework = new AIABTestingFramework();
export default aiABTestingFramework;