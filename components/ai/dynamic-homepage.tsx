"use client";

import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { isAIFeatureEnabled } from '@/lib/config/ai-config';
import { userBehaviorTracker } from '@/lib/services/user-behavior-tracker';
import type { HomepageSection, PersonalizedLayout } from '@/lib/services/ai-layout-optimizer';

// Import existing section components
import { HeroSection } from '@/components/sections/hero-section';
import { LatestProducts } from '@/components/sections/latest-products';
import { BestSellersShowcase } from '@/components/sections/best-sellers-showcase';
import { GrowingGuideShowcase } from '@/components/sections/growing-guide-showcase';
import { FeaturedBundle } from '@/components/sections/featured-bundle';

interface DynamicHomepageProps {
  defaultSections: HomepageSection[];
  products?: any[];
  collections?: any[];
}

export default function DynamicHomepage({ 
  defaultSections, 
  products = [], 
  collections = [] 
}: DynamicHomepageProps) {
  const [layout, setLayout] = useState<PersonalizedLayout | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [isEnabled] = useState(() => isAIFeatureEnabled('recommendations') && 
                                     process.env.NEXT_PUBLIC_AI_HOMEPAGE_PERSONALIZATION === 'true');

  // Load personalized layout on mount
  useEffect(() => {
    console.log('🏠 [AI Homepage] Component mounted:', { 
      isEnabled, 
      trackingEnabled: userBehaviorTracker.isTrackingEnabled() 
    });
    
    if (isEnabled && userBehaviorTracker.isTrackingEnabled()) {
      loadPersonalizedLayout();
    } else {
      console.log('🏠 [AI Homepage] Skipping personalization - AI or tracking disabled');
    }
  }, [isEnabled]);

  const loadPersonalizedLayout = async () => {
    console.log('🏠 [AI Homepage] Loading personalized layout');
    setIsLoading(true);
    
    try {
      const behaviorData = userBehaviorTracker.getBehaviorData();
      console.log('🏠 [AI Homepage] Behavior data:', {
        searchHistory: behaviorData.searchHistory?.length || 0,
        viewedProducts: behaviorData.viewedProducts?.length || 0,
        sessionCount: behaviorData.sessionCount
      });
      
      // Only personalize if user has some interaction history
      const hasHistory = behaviorData.searchHistory.length > 0 || 
                        behaviorData.viewedProducts.length > 0 || 
                        behaviorData.sessionCount > 1;

      if (!hasHistory) {
        console.log('🏠 [AI Homepage] No user history - using default layout');
        setLayout({
          sections: defaultSections,
          userSegment: 'new-visitor',
          reasoning: 'Using default layout for new visitor',
          confidence: 1,
          fallbackToDefault: true
        });
        setIsLoading(false);
        return;
      }

      console.log('🏠 [AI Homepage] Making API request to /api/ai/personalize-homepage');
      
      const response = await fetch('/api/ai/personalize-homepage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          behaviorData,
          defaultSections,
          products: products.slice(0, 20), // Limit for AI processing
          collections: collections.slice(0, 10)
        }),
      });

      console.log('🏠 [AI Homepage] API response status:', response.status);

      if (response.ok) {
        const personalizedLayout = await response.json();
        console.log('🏠 [AI Homepage] Personalized layout received:', {
          userSegment: personalizedLayout.userSegment,
          sectionsCount: personalizedLayout.sections?.length,
          confidence: personalizedLayout.confidence
        });
        setLayout(personalizedLayout);
        setIsPersonalized(!personalizedLayout.fallbackToDefault);
      } else {
        const errorText = await response.text();
        console.error('🏠 [AI Homepage] API error:', errorText);
        // Fallback to default layout
        setLayout({
          sections: defaultSections,
          userSegment: 'fallback',
          reasoning: 'API error, using default layout',
          confidence: 0,
          fallbackToDefault: true
        });
      }
    } catch (error) {
      console.error('🏠 [AI Homepage] Fetch error:', error);
      setLayout({
        sections: defaultSections,
        userSegment: 'error-fallback',
        reasoning: 'Error loading personalization, using default',
        confidence: 0,
        fallbackToDefault: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLayout = () => {
    if (!isLoading) {
      loadPersonalizedLayout();
    }
  };

  // Use default layout if AI is disabled or loading failed
  const sectionsToRender = layout?.sections || defaultSections;

  // Render individual sections based on type
  const renderSection = (section: HomepageSection, index: number) => {
    const sectionProps = {
      className: "mb-8",
      'data-section-id': section.id,
      'data-section-type': section.type
    };

    switch (section.type) {
      case 'hero':
        // Pass the first product as the featured product for the hero section
        const featuredProduct = products?.[0];
        return <HeroSection key={section.id} {...sectionProps} product={featuredProduct} />;
      
      case 'featured-products':
        return (
          <LatestProducts 
            key={section.id}
            {...sectionProps}
            products={products.slice(0, 8)}
          />
        );
      
      case 'best-sellers':
        return (
          <BestSellersShowcase 
            key={section.id}
            {...sectionProps}
            title={section.title}
          />
        );
      
      case 'growing-guides':
        return (
          <GrowingGuideShowcase 
            key={section.id}
            {...sectionProps}
            title={section.title}
          />
        );
      
      case 'bundles':
        return (
          <FeaturedBundle 
            key={section.id}
            {...sectionProps}
            title={section.title}
          />
        );
      
      case 'categories':
        return (
          <div key={section.id} {...sectionProps}>
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-6">{section.title}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {collections.slice(0, 8).map((collection: any) => (
                  <div key={collection.id} className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-medium text-sm">{collection.title}</h3>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      {/* Personalization Indicator */}
      {isEnabled && (
        <div className="container mx-auto px-4 mb-4">
          <div className="flex items-center justify-between bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20 border border-violet-200 dark:border-violet-800/30 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              <span className="text-sm font-medium text-violet-900 dark:text-violet-100">
                {isLoading ? 'Personalizing homepage...' : 
                 isPersonalized ? 'Personalized for you' : 'Default layout'}
              </span>
              {isPersonalized && (
                <Badge variant="secondary" className="text-xs bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
                  AI Optimized
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {layout && !isLoading && (
                <span className="text-xs text-violet-600 dark:text-violet-400">
                  {layout.userSegment} • {Math.round(layout.confidence * 100)}% confidence
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshLayout}
                disabled={isLoading}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-2 border-violet-600 border-t-transparent rounded-full"></div>
            <span className="ml-3 text-violet-600">Optimizing your homepage...</span>
          </div>
        </div>
      )}

      {/* Render Sections */}
      {!isLoading && (
        <div className="space-y-8">
          {sectionsToRender.map((section, index) => renderSection(section, index))}
        </div>
      )}

      {/* Debug Info (development only) */}
      {process.env.NODE_ENV === 'development' && layout && (
        <div className="container mx-auto px-4 mt-8">
          <details className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <summary className="cursor-pointer font-medium">
              Debug: Personalization Data
            </summary>
            <pre className="mt-2 text-xs overflow-auto">
              {JSON.stringify({
                userSegment: layout.userSegment,
                reasoning: layout.reasoning,
                confidence: layout.confidence,
                sectionsCount: layout.sections.length,
                behaviorData: userBehaviorTracker.getBehaviorData()
              }, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}