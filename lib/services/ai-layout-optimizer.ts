"use server";

import { aiClient } from './ai-client';
import { isAIFeatureEnabled } from '@/lib/config/ai-config';

export interface UserBehaviorData {
  searchHistory: string[];
  viewedProducts: string[];
  categories: string[];
  timeOnSite: number;
  sessionCount: number;
  purchaseHistory?: string[];
  lastVisit: Date;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export interface HomepageSection {
  id: string;
  type: 'hero' | 'featured-products' | 'categories' | 'best-sellers' | 'growing-guides' | 'testimonials' | 'newsletter' | 'bundles';
  title: string;
  priority: number;
  products?: string[];
  content?: any;
  layout?: 'grid' | 'carousel' | 'list' | 'featured';
}

export interface PersonalizedLayout {
  sections: HomepageSection[];
  userSegment: string;
  reasoning: string;
  confidence: number;
  fallbackToDefault: boolean;
}

export async function generatePersonalizedHomepage(
  userData: UserBehaviorData,
  availableProducts: any[],
  defaultSections: HomepageSection[]
): Promise<PersonalizedLayout | null> {
  
  // Check if AI homepage personalization is enabled
  const aiHomepageEnabled = process.env.NEXT_PUBLIC_AI_HOMEPAGE_PERSONALIZATION === 'true';
  if (!aiHomepageEnabled || !isAIFeatureEnabled('recommendations') || !aiClient.isAvailable()) {
    return {
      sections: defaultSections,
      userSegment: 'default',
      reasoning: 'AI personalization disabled or unavailable',
      confidence: 0,
      fallbackToDefault: true
    };
  }

  try {
    const userProfile = analyzeUserProfile(userData);
    
    const prompt = `
You are a homepage personalization expert for Zugzology, a mushroom growing supplies store. Create an optimized homepage layout based on user behavior.

User Profile:
- Experience Level: ${userProfile.experienceLevel}
- Primary Interest: ${userProfile.primaryInterest}
- Device: ${userData.deviceType}
- Session Count: ${userData.sessionCount}
- Recent Searches: ${userData.searchHistory.slice(-5).join(', ')}
- Viewed Categories: ${userData.categories.join(', ')}
- Time on Site: ${userData.timeOnSite}s

Available Section Types:
1. hero - Main banner with call-to-action
2. featured-products - Spotlight specific products
3. categories - Product category navigation
4. best-sellers - Popular products
5. growing-guides - Educational content
6. testimonials - Customer reviews
7. newsletter - Email signup
8. bundles - Product bundles/kits

Default Layout: ${JSON.stringify(defaultSections.map(s => ({ id: s.id, type: s.type, priority: s.priority })))}

Create a personalized layout with JSON response:
{
  "sections": [
    {
      "id": "section-1",
      "type": "hero|featured-products|categories|best-sellers|growing-guides|testimonials|newsletter|bundles",
      "title": "Section Title",
      "priority": 1-10,
      "layout": "grid|carousel|list|featured",
      "reasoning": "Why this section for this user"
    }
  ],
  "userSegment": "beginner|returning-customer|advanced-grower|product-browser",
  "reasoning": "Overall personalization strategy",
  "confidence": 0.85
}

Personalization Rules:
- New users (sessionCount < 3): Focus on education, categories, beginner guides
- Beginners: Emphasize kits, guides, simple products
- Advanced users: Show new products, advanced tools, techniques
- Mobile users: Prioritize simple layouts, fewer sections
- Frequent visitors: Show new arrivals, advanced features
- Search-heavy users: Product-focused sections
- Category browsers: Category navigation priority

Optimize for engagement and conversion based on user behavior patterns.`;

    const response = await aiClient.complete(prompt, {
      maxTokens: 1200,
      temperature: 0.7
    });

    try {
      const aiLayout = JSON.parse(response);
      
      // Validate and enhance the AI response
      const validatedLayout = validateAndEnhanceLayout(aiLayout, defaultSections, availableProducts);
      
      return {
        ...validatedLayout,
        fallbackToDefault: false
      };
    } catch (parseError) {
      console.error('AI layout parsing error:', parseError);
      return createFallbackLayout(userData, defaultSections);
    }
  } catch (error) {
    console.error('AI layout generation error:', error);
    return createFallbackLayout(userData, defaultSections);
  }
}

function analyzeUserProfile(userData: UserBehaviorData) {
  // Determine experience level from behavior
  let experienceLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
  
  if (userData.sessionCount > 10 || userData.purchaseHistory?.length) {
    experienceLevel = 'intermediate';
  }
  
  if (userData.searchHistory.some(search => 
    search.includes('advanced') || 
    search.includes('sterilization') || 
    search.includes('agar') ||
    search.includes('substrate')
  )) {
    experienceLevel = 'advanced';
  }

  // Determine primary interest from search/view history
  const interests = [...userData.searchHistory, ...userData.categories];
  const interestCounts: { [key: string]: number } = {};
  
  interests.forEach(interest => {
    const category = categorizeInterest(interest.toLowerCase());
    interestCounts[category] = (interestCounts[category] || 0) + 1;
  });

  const primaryInterest = Object.entries(interestCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'general';

  return {
    experienceLevel,
    primaryInterest,
    isReturning: userData.sessionCount > 1,
    isEngaged: userData.timeOnSite > 120, // 2+ minutes
    isMobile: userData.deviceType === 'mobile'
  };
}

function categorizeInterest(interest: string): string {
  if (interest.includes('kit') || interest.includes('beginner')) return 'kits';
  if (interest.includes('oyster')) return 'oyster-mushrooms';
  if (interest.includes('shiitake')) return 'shiitake-mushrooms';
  if (interest.includes('lions') || interest.includes('mane')) return 'lions-mane';
  if (interest.includes('substrate') || interest.includes('growing-medium')) return 'substrates';
  if (interest.includes('tool') || interest.includes('equipment')) return 'tools';
  if (interest.includes('sterilization') || interest.includes('sterile')) return 'sterilization';
  return 'general';
}

function validateAndEnhanceLayout(
  aiLayout: any,
  defaultSections: HomepageSection[],
  availableProducts: any[]
): PersonalizedLayout {
  const validSections: HomepageSection[] = [];
  
  // Ensure we have all required sections
  const requiredTypes = ['hero', 'categories'];
  const aiSectionTypes = aiLayout.sections?.map((s: any) => s.type) || [];
  
  // Add AI-suggested sections
  if (Array.isArray(aiLayout.sections)) {
    aiLayout.sections.forEach((section: any, index: number) => {
      if (isValidSectionType(section.type)) {
        validSections.push({
          id: section.id || `ai-section-${index}`,
          type: section.type,
          title: section.title || getDefaultTitle(section.type),
          priority: section.priority || (index + 1),
          layout: section.layout || getDefaultLayout(section.type),
          products: section.products || []
        });
      }
    });
  }

  // Add missing required sections from default layout
  requiredTypes.forEach(requiredType => {
    if (!aiSectionTypes.includes(requiredType)) {
      const defaultSection = defaultSections.find(s => s.type === requiredType);
      if (defaultSection) {
        validSections.push({
          ...defaultSection,
          priority: validSections.length + 1
        });
      }
    }
  });

  // Sort by priority
  validSections.sort((a, b) => a.priority - b.priority);

  return {
    sections: validSections,
    userSegment: aiLayout.userSegment || 'unknown',
    reasoning: aiLayout.reasoning || 'AI-generated personalized layout',
    confidence: Math.min(Math.max(aiLayout.confidence || 0.5, 0), 1)
  };
}

function createFallbackLayout(userData: UserBehaviorData, defaultSections: HomepageSection[]): PersonalizedLayout {
  // Simple rule-based personalization as fallback
  const userProfile = analyzeUserProfile(userData);
  let sections = [...defaultSections];

  // Basic personalization rules
  if (userProfile.experienceLevel === 'beginner') {
    // Prioritize kits and guides for beginners
    sections = sections.map(section => ({
      ...section,
      priority: section.type === 'growing-guides' ? section.priority - 2 :
                section.type === 'featured-products' ? section.priority - 1 :
                section.priority
    }));
  }

  if (userProfile.isMobile) {
    // Simplify layout for mobile
    sections = sections.filter(s => !['testimonials', 'newsletter'].includes(s.type));
  }

  return {
    sections: sections.sort((a, b) => a.priority - b.priority),
    userSegment: `${userProfile.experienceLevel}-fallback`,
    reasoning: 'Rule-based fallback personalization',
    confidence: 0.3,
    fallbackToDefault: false
  };
}

function isValidSectionType(type: string): boolean {
  const validTypes = ['hero', 'featured-products', 'categories', 'best-sellers', 'growing-guides', 'testimonials', 'newsletter', 'bundles'];
  return validTypes.includes(type);
}

function getDefaultTitle(type: string): string {
  const titles: { [key: string]: string } = {
    'hero': 'Welcome to Zugzology',
    'featured-products': 'Featured Products',
    'categories': 'Shop by Category',
    'best-sellers': 'Best Sellers',
    'growing-guides': 'Growing Guides',
    'testimonials': 'Customer Stories',
    'newsletter': 'Stay Updated',
    'bundles': 'Complete Growing Kits'
  };
  return titles[type] || 'Section';
}

function getDefaultLayout(type: string): 'grid' | 'carousel' | 'list' | 'featured' {
  const layouts: { [key: string]: 'grid' | 'carousel' | 'list' | 'featured' } = {
    'hero': 'featured',
    'featured-products': 'grid',
    'categories': 'grid',
    'best-sellers': 'carousel',
    'growing-guides': 'list',
    'testimonials': 'carousel',
    'newsletter': 'featured',
    'bundles': 'grid'
  };
  return layouts[type] || 'grid';
}

// Cache personalized layouts to avoid repeated AI calls
const layoutCache = new Map<string, { layout: PersonalizedLayout; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function getCachedPersonalizedLayout(
  userKey: string,
  userData: UserBehaviorData,
  availableProducts: any[],
  defaultSections: HomepageSection[]
): Promise<PersonalizedLayout | null> {
  const cached = layoutCache.get(userKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return Promise.resolve(cached.layout);
  }

  const layoutPromise = generatePersonalizedHomepage(userData, availableProducts, defaultSections);
  
  layoutPromise.then(layout => {
    if (layout) {
      layoutCache.set(userKey, {
        layout,
        timestamp: Date.now()
      });
      
      // Clean up old cache entries
      if (layoutCache.size > 1000) {
        const oldestKey = layoutCache.keys().next().value;
        layoutCache.delete(oldestKey);
      }
    }
  });

  return layoutPromise;
}