"use client";

import { useState, useEffect, useRef } from 'react';
import { userBehaviorTracker } from '@/lib/services/user-behavior-tracker';

export interface ABTestVariant {
  id: string;
  name: string;
  weight: number; // 0-100 percentage
  component: React.ComponentType<any>;
  description?: string;
}

export interface ABTestConfig {
  testId: string;
  testName: string;
  variants: ABTestVariant[];
  enabled: boolean;
  sampleRate?: number; // 0-100, percentage of users to include
  targetAudience?: {
    experienceLevel?: ('beginner' | 'intermediate' | 'advanced')[];
    deviceType?: ('mobile' | 'tablet' | 'desktop')[];
    sessionCount?: { min?: number; max?: number };
    hasSearchHistory?: boolean;
  };
}

interface ABTestFrameworkProps {
  config: ABTestConfig;
  fallbackComponent: React.ComponentType<any>;
  componentProps?: any;
  onVariantSelected?: (variantId: string, testId: string) => void;
  onConversion?: (variantId: string, testId: string, conversionData: any) => void;
}

export default function ABTestFramework({
  config,
  fallbackComponent: FallbackComponent,
  componentProps = {},
  onVariantSelected,
  onConversion
}: ABTestFrameworkProps) {
  const [selectedVariant, setSelectedVariant] = useState<ABTestVariant | null>(null);
  const [isInTest, setIsInTest] = useState(false);
  const hasTrackedView = useRef(false);

  useEffect(() => {
    if (!config.enabled) {
      return;
    }

    const variant = selectVariantForUser(config);
    setSelectedVariant(variant);
    setIsInTest(variant !== null);

    // Track variant selection
    if (variant && !hasTrackedView.current) {
      trackABTestEvent('variant_shown', config.testId, variant.id);
      onVariantSelected?.(variant.id, config.testId);
      hasTrackedView.current = true;
    }
  }, [config, onVariantSelected]);

  // Render the appropriate component
  const ComponentToRender = selectedVariant?.component || FallbackComponent;

  // Enhanced props with AB test context
  const enhancedProps = {
    ...componentProps,
    abTest: {
      testId: config.testId,
      variantId: selectedVariant?.id || 'control',
      isInTest,
      trackConversion: (conversionData: any) => {
        const variantId = selectedVariant?.id || 'control';
        trackABTestEvent('conversion', config.testId, variantId, conversionData);
        onConversion?.(variantId, config.testId, conversionData);
      },
      trackInteraction: (interactionType: string, data?: any) => {
        const variantId = selectedVariant?.id || 'control';
        trackABTestEvent(interactionType, config.testId, variantId, data);
      }
    }
  };

  return <ComponentToRender {...enhancedProps} />;
}

function selectVariantForUser(config: ABTestConfig): ABTestVariant | null {
  // Check if user is eligible for the test
  if (!isUserEligible(config)) {
    return null;
  }

  // Check sample rate
  if (config.sampleRate && Math.random() * 100 > config.sampleRate) {
    return null;
  }

  // Get or create consistent user assignment
  const assignment = getUserAssignment(config.testId);
  
  // Select variant based on weight distribution
  let cumulativeWeight = 0;
  const totalWeight = config.variants.reduce((sum, variant) => sum + variant.weight, 0);
  const normalizedAssignment = (assignment / 100) * totalWeight;

  for (const variant of config.variants) {
    cumulativeWeight += variant.weight;
    if (normalizedAssignment <= cumulativeWeight) {
      return variant;
    }
  }

  // Fallback to first variant
  return config.variants[0] || null;
}

function isUserEligible(config: ABTestConfig): boolean {
  if (!config.targetAudience) {
    return true;
  }

  const behaviorData = userBehaviorTracker.getBehaviorData();
  const { targetAudience } = config;

  // Check experience level
  if (targetAudience.experienceLevel) {
    const userExperience = determineExperienceLevel(behaviorData);
    if (!targetAudience.experienceLevel.includes(userExperience)) {
      return false;
    }
  }

  // Check device type
  if (targetAudience.deviceType && !targetAudience.deviceType.includes(behaviorData.deviceType)) {
    return false;
  }

  // Check session count
  if (targetAudience.sessionCount) {
    const { min, max } = targetAudience.sessionCount;
    const userSessionCount = behaviorData.sessionCount || 0;
    
    if (min !== undefined && userSessionCount < min) return false;
    if (max !== undefined && userSessionCount > max) return false;
  }

  // Check search history requirement
  if (targetAudience.hasSearchHistory !== undefined) {
    const hasHistory = (behaviorData.searchHistory?.length || 0) > 0;
    if (targetAudience.hasSearchHistory !== hasHistory) {
      return false;
    }
  }

  return true;
}

function getUserAssignment(testId: string): number {
  // Create consistent assignment based on session/user
  const sessionData = userBehaviorTracker.getSessionData();
  const key = `ab_test_${testId}_${sessionData.sessionId}`;
  
  // Check for existing assignment
  const stored = localStorage.getItem(key);
  if (stored) {
    return parseInt(stored, 10);
  }

  // Generate new assignment (0-99)
  const assignment = Math.floor(Math.random() * 100);
  localStorage.setItem(key, assignment.toString());
  
  return assignment;
}

function determineExperienceLevel(behaviorData: any): 'beginner' | 'intermediate' | 'advanced' {
  const searchTerms = (behaviorData.searchHistory || []).join(' ').toLowerCase();
  const sessionCount = behaviorData.sessionCount || 0;
  
  if (searchTerms.includes('agar') || 
      searchTerms.includes('sterilization') || 
      searchTerms.includes('advanced') ||
      sessionCount > 5) {
    return 'advanced';
  }
  
  if (sessionCount > 2 || searchTerms.includes('growing')) {
    return 'intermediate';
  }
  
  return 'beginner';
}

function trackABTestEvent(
  eventType: string, 
  testId: string, 
  variantId: string, 
  data?: any
) {
  // Track to user behavior tracker
  userBehaviorTracker.trackInteraction('ab_test_event', {
    eventType,
    testId,
    variantId,
    data,
    timestamp: Date.now()
  });

  // Send to analytics endpoint
  if (typeof window !== 'undefined') {
    fetch('/api/analytics/ab-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType,
        testId,
        variantId,
        data,
        timestamp: Date.now(),
        sessionId: userBehaviorTracker.getSessionData().sessionId
      })
    }).catch(error => {
      console.warn('Failed to track AB test event:', error);
    });
  }
}

// Hook for manually tracking AB test events in components
export function useABTest(testId: string) {
  return {
    trackConversion: (data?: any) => {
      const key = `ab_test_${testId}_assignment`;
      const assignment = localStorage.getItem(key);
      if (assignment) {
        trackABTestEvent('conversion', testId, 'unknown', data);
      }
    },
    trackInteraction: (interactionType: string, data?: any) => {
      const key = `ab_test_${testId}_assignment`;
      const assignment = localStorage.getItem(key);
      if (assignment) {
        trackABTestEvent(interactionType, testId, 'unknown', data);
      }
    }
  };
}

// Component for easy A/B testing of simple elements
interface SimpleABTestProps {
  testId: string;
  variants: Array<{
    id: string;
    content: React.ReactNode;
    weight?: number;
  }>;
  fallback: React.ReactNode;
  className?: string;
}

export function SimpleABTest({ testId, variants, fallback, className }: SimpleABTestProps) {
  const config: ABTestConfig = {
    testId,
    testName: testId,
    enabled: true,
    variants: variants.map(v => ({
      id: v.id,
      name: v.id,
      weight: v.weight || Math.floor(100 / variants.length),
      component: () => <div className={className}>{v.content}</div>
    }))
  };

  const FallbackComponent = () => <div className={className}>{fallback}</div>;

  return (
    <ABTestFramework
      config={config}
      fallbackComponent={FallbackComponent}
    />
  );
}