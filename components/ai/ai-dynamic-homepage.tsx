"use client";

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAIComponentArrangement, useAIHomepageData } from '@/hooks/use-ai-optimized-content';
import { AIFeaturedProducts, AITrendingProducts, AIPersonalizedProducts } from './ai-optimized-product-grid';
import { HeroSection } from '@/components/sections/hero-section';
import { BestSellersShowcase } from '@/components/sections/best-sellers-showcase';
import { GrowingGuideShowcase } from '@/components/sections/growing-guide-showcase';
import { LatestProducts } from '@/components/sections/latest-products';
import { cn } from '@/lib/utils';

interface SectionComponent {
  id: string;
  component: React.ComponentType<any>;
  props: any;
  defaultOrder: number;
}

export function AIDynamicHomepage() {
  const { homepageData, isLoading } = useAIHomepageData();
  const { sortedComponents } = useAIComponentArrangement('homepage');

  // Define all available sections
  const availableSections: SectionComponent[] = useMemo(() => [
    {
      id: 'hero',
      component: HeroSection,
      props: { 
        featuredProduct: homepageData?.hero,
        className: "mb-16" 
      },
      defaultOrder: 0
    },
    {
      id: 'featured',
      component: AIFeaturedProducts,
      props: { 
        products: homepageData?.featured || [],
        className: "mb-16" 
      },
      defaultOrder: 1
    },
    {
      id: 'trending',
      component: AITrendingProducts,
      props: { 
        products: homepageData?.trending || [],
        className: "mb-16" 
      },
      defaultOrder: 2
    },
    {
      id: 'personalized',
      component: AIPersonalizedProducts,
      props: { 
        products: homepageData?.personalized || [],
        className: "mb-16" 
      },
      defaultOrder: 3
    },
    {
      id: 'best-sellers',
      component: BestSellersShowcase,
      props: { 
        title: "Best Sellers",
        className: "mb-16" 
      },
      defaultOrder: 4
    },
    {
      id: 'new-arrivals',
      component: LatestProducts,
      props: { 
        products: homepageData?.newArrivals || [],
        title: "New Arrivals",
        className: "mb-16" 
      },
      defaultOrder: 5
    }
  ], [homepageData]);

  // Calculate final section order
  const orderedSections = useMemo(() => {
    if (sortedComponents.length === 0) {
      // Use default order
      return availableSections.sort((a, b) => a.defaultOrder - b.defaultOrder);
    }

    // Use AI-determined order
    const sectionMap = new Map(availableSections.map(s => [s.id, s]));
    const ordered: SectionComponent[] = [];
    
    // Add sections in AI-determined order
    sortedComponents.forEach(arrangement => {
      const section = sectionMap.get(arrangement.componentId);
      if (section) {
        ordered.push(section);
        sectionMap.delete(arrangement.componentId);
      }
    });
    
    // Add any remaining sections at the end
    sectionMap.forEach(section => {
      ordered.push(section);
    });
    
    return ordered;
  }, [availableSections, sortedComponents]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        {/* Loading skeleton */}
        <div className="h-96 bg-gray-100 animate-pulse mb-16" />
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="mb-16">
            <div className="h-8 bg-gray-100 animate-pulse w-48 mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const sectionVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.98
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        duration: 0.6
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen"
    >
      <AnimatePresence mode="wait">
        {orderedSections.map((section, index) => {
          const Component = section.component;
          
          return (
            <motion.div
              key={section.id}
              layout
              variants={sectionVariants}
              className="relative"
              data-section-id={section.id}
              data-section-order={index}
              style={{
                // Add micro-delays to make reordering less noticeable
                transitionDelay: `${index * 100}ms`
              }}
            >
              {/* Subtle section indicator for AI monitoring */}
              <div 
                className="absolute -top-4 left-0 w-1 h-1 bg-blue-500 rounded-full opacity-0 hover:opacity-50 transition-opacity"
                title={`AI Section: ${section.id}`}
              />
              
              <Component {...section.props} />
              
              {/* Invisible spacer for smooth layout */}
              <div className="h-4" />
            </motion.div>
          );
        })}
      </AnimatePresence>
      
      {/* AI optimization watermark (development only) */}
      {process.env.NODE_ENV === 'development' && sortedComponents.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="fixed bottom-20 right-4 text-xs text-muted-foreground bg-white/80 backdrop-blur-sm px-2 py-1 rounded"
        >
          🤖 AI Optimized Layout
        </motion.div>
      )}
    </motion.div>
  );
}

// Enhanced section wrapper that provides analytics data
export function AISection({ 
  children, 
  sectionId, 
  title,
  className 
}: { 
  children: React.ReactNode;
  sectionId: string;
  title?: string;
  className?: string;
}) {
  return (
    <motion.section
      layout
      className={cn("relative", className)}
      data-section-id={sectionId}
      data-section-type="ai-optimized"
      onViewportEnter={() => {
        // Track section visibility for AI learning
        window.dispatchEvent(new CustomEvent('section-viewed', {
          detail: { sectionId, title, timestamp: Date.now() }
        }));
      }}
    >
      {title && (
        <motion.h2 
          layout
          className="text-2xl font-bold mb-8"
        >
          {title}
        </motion.h2>
      )}
      
      <motion.div layout>
        {children}
      </motion.div>
    </motion.section>
  );
}

// Specialized homepage components
export function AIHomepageHero({ product, className }: { product?: any; className?: string }) {
  return (
    <AISection sectionId="hero" className={className}>
      <HeroSection featuredProduct={product} />
    </AISection>
  );
}

export function AIHomepageFeatured({ products, className }: { products: any[]; className?: string }) {
  return (
    <AISection sectionId="featured" title="Featured Products" className={className}>
      <AIFeaturedProducts products={products} />
    </AISection>
  );
}

export function AIHomepageTrending({ products, className }: { products: any[]; className?: string }) {
  return (
    <AISection sectionId="trending" title="Trending Now" className={className}>
      <AITrendingProducts products={products} />
    </AISection>
  );
}

export function AIHomepagePersonalized({ products, className }: { products: any[]; className?: string }) {
  return (
    <AISection sectionId="personalized" title="Recommended for You" className={className}>
      <AIPersonalizedProducts products={products} />
    </AISection>
  );
}