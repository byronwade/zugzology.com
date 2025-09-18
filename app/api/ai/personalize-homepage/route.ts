import { NextRequest, NextResponse } from 'next/server';
import { getCachedPersonalizedLayout } from '@/lib/services/ai-layout-optimizer';
import { isAIFeatureEnabled } from '@/lib/config/ai-config';
import type { UserBehaviorData, HomepageSection } from '@/lib/services/ai-layout-optimizer';

export async function POST(request: NextRequest) {
  try {
    // Check if AI homepage personalization is enabled
    const isHomepagePersonalizationEnabled = process.env.NEXT_PUBLIC_AI_HOMEPAGE_PERSONALIZATION === 'true';
    
    if (!isHomepagePersonalizationEnabled || !isAIFeatureEnabled('recommendations')) {
      return NextResponse.json(
        { error: 'AI homepage personalization is not enabled' },
        { status: 503 }
      );
    }

    const { behaviorData, defaultSections, products, collections } = await request.json();

    if (!behaviorData || !defaultSections) {
      return NextResponse.json(
        { error: 'Behavior data and default sections are required' },
        { status: 400 }
      );
    }

    // Create user key for caching (based on behavior patterns, not personal data)
    const userKey = createUserKey(behaviorData);

    // Get personalized layout
    const personalizedLayout = await getCachedPersonalizedLayout(
      userKey,
      behaviorData as UserBehaviorData,
      products || [],
      defaultSections as HomepageSection[]
    );

    if (!personalizedLayout) {
      return NextResponse.json(
        { error: 'Unable to generate personalized layout' },
        { status: 500 }
      );
    }

    // Add metadata for analytics
    const response = {
      ...personalizedLayout,
      metadata: {
        userKey,
        timestamp: Date.now(),
        productsCount: products?.length || 0,
        collectionsCount: collections?.length || 0,
        behaviorSignals: {
          hasSearchHistory: (behaviorData.searchHistory?.length || 0) > 0,
          hasViewHistory: (behaviorData.viewedProducts?.length || 0) > 0,
          sessionCount: behaviorData.sessionCount || 0,
          deviceType: behaviorData.deviceType
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('AI Homepage Personalization API Error:', error);
    
    return NextResponse.json(
      { error: 'Unable to process personalization request' },
      { status: 500 }
    );
  }
}

function createUserKey(behaviorData: UserBehaviorData): string {
  // Create a privacy-safe user key based on behavior patterns, not personal data
  const patterns = {
    searchCategories: extractCategories(behaviorData.searchHistory || []),
    viewCategories: extractCategories(behaviorData.viewedProducts || []),
    experienceLevel: determineExperienceLevel(behaviorData),
    deviceType: behaviorData.deviceType || 'unknown',
    sessionCount: Math.min(behaviorData.sessionCount || 0, 10) // Cap at 10 for grouping
  };

  // Create hash of patterns for caching
  const patternString = JSON.stringify(patterns);
  let hash = 0;
  for (let i = 0; i < patternString.length; i++) {
    const char = patternString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return `user_pattern_${Math.abs(hash)}`;
}

function extractCategories(items: string[]): string[] {
  const categories = new Set<string>();
  
  items.forEach(item => {
    const itemLower = item.toLowerCase();
    
    // Extract mushroom types
    if (itemLower.includes('oyster')) categories.add('oyster');
    if (itemLower.includes('shiitake')) categories.add('shiitake');
    if (itemLower.includes('lions') || itemLower.includes('mane')) categories.add('lions-mane');
    
    // Extract product types
    if (itemLower.includes('kit')) categories.add('kits');
    if (itemLower.includes('substrate') || itemLower.includes('growing-medium')) categories.add('substrates');
    if (itemLower.includes('tool') || itemLower.includes('equipment')) categories.add('tools');
    if (itemLower.includes('sterilization') || itemLower.includes('sterile')) categories.add('sterilization');
    
    // Extract experience indicators
    if (itemLower.includes('beginner') || itemLower.includes('starter')) categories.add('beginner');
    if (itemLower.includes('advanced') || itemLower.includes('professional')) categories.add('advanced');
  });

  return Array.from(categories);
}

function determineExperienceLevel(behaviorData: UserBehaviorData): string {
  const searchTerms = (behaviorData.searchHistory || []).join(' ').toLowerCase();
  const sessionCount = behaviorData.sessionCount || 0;
  
  // Advanced indicators
  if (searchTerms.includes('agar') || 
      searchTerms.includes('sterilization') || 
      searchTerms.includes('substrate') ||
      sessionCount > 5) {
    return 'advanced';
  }
  
  // Intermediate indicators
  if (sessionCount > 2 || searchTerms.includes('growing')) {
    return 'intermediate';
  }
  
  return 'beginner';
}

// Analytics endpoint for tracking personalization effectiveness
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    
    if (action === 'metrics') {
      // Return anonymized metrics about personalization usage
      return NextResponse.json({
        enabled: process.env.NEXT_PUBLIC_AI_HOMEPAGE_PERSONALIZATION === 'true',
        features: {
          recommendations: isAIFeatureEnabled('recommendations'),
          productDescriptions: isAIFeatureEnabled('productDescriptions'),
          searchEnhancement: isAIFeatureEnabled('searchEnhancement')
        },
        provider: process.env.NEXT_PUBLIC_AI_PROVIDER || 'none'
      });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error) {
    console.error('AI Personalization Metrics Error:', error);
    return NextResponse.json({ error: 'Unable to get metrics' }, { status: 500 });
  }
}