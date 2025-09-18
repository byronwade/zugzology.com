"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShopifyProductCard } from '@/components/product-card';
import { useAIOptimizedProducts } from '@/hooks/use-ai-optimized-content';
import type { ShopifyProductData } from '@/lib/services/shopify-data-context';
import { cn } from '@/lib/utils';

interface AIOptimizedProductGridProps {
  sectionId: string;
  initialProducts: ShopifyProductData[];
  title?: string;
  className?: string;
  maxProducts?: number;
  showOptimizationIndicator?: boolean;
}

export function AIOptimizedProductGrid({
  sectionId,
  initialProducts,
  title,
  className,
  maxProducts = 12,
  showOptimizationIndicator = false
}: AIOptimizedProductGridProps) {
  const { products, isOptimizing, reason, lastOptimized } = useAIOptimizedProducts(sectionId, initialProducts);
  const [displayProducts, setDisplayProducts] = useState(initialProducts);
  const [hasOptimized, setHasOptimized] = useState(false);

  // Update display products with smooth transition
  useEffect(() => {
    if (products.length > 0 && products !== displayProducts) {
      setHasOptimized(true);
      
      // Stagger the update for smooth visual transition
      const timer = setTimeout(() => {
        setDisplayProducts(products.slice(0, maxProducts));
      }, isOptimizing ? 200 : 0);

      return () => clearTimeout(timer);
    }
  }, [products, displayProducts, maxProducts, isOptimizing]);

  const gridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Optimization indicator */}
      {showOptimizationIndicator && hasOptimized && (
        <div className="mb-4 flex items-center justify-between">
          {title && <h2 className="text-2xl font-bold">{title}</h2>}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="hidden sm:inline">AI Optimized</span>
            {reason && (
              <span className="hidden md:inline text-xs">• {reason}</span>
            )}
          </motion.div>
        </div>
      )}

      {/* Loading state during optimization */}
      <AnimatePresence mode="wait">
        {isOptimizing ? (
          <motion.div
            key="optimizing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {Array.from({ length: maxProducts }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="h-80 bg-gray-100 rounded-lg animate-pulse"
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="products"
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {displayProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  layout
                  variants={itemVariants}
                  exit={{ 
                    opacity: 0, 
                    scale: 0.8,
                    transition: { duration: 0.2 }
                  }}
                  className="group"
                  style={{
                    // Add slight randomization to prevent obvious patterns
                    transitionDelay: `${index * 50 + Math.random() * 100}ms`
                  }}
                >
                  <ShopifyProductCard
                    product={{
                      id: product.id,
                      title: product.title,
                      handle: product.handle,
                      description: product.description,
                      price: product.price,
                      compareAtPrice: product.compareAtPrice || null,
                      isOnSale: !!product.compareAtPrice,
                      featuredImage: product.featuredImage,
                      tags: product.tags
                    }}
                  />
                  
                  {/* Subtle AI badge for high-scoring products */}
                  {hasOptimized && index < 3 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="absolute top-2 left-2 w-2 h-2 bg-blue-500 rounded-full opacity-50 group-hover:opacity-100 transition-opacity"
                      title="AI Recommended"
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle optimization timestamp */}
      {showOptimizationIndicator && lastOptimized > 0 && (
        <div className="mt-4 text-xs text-muted-foreground text-center opacity-50">
          Last optimized: {new Date(lastOptimized).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}

// Specialized components for different sections
export function AIFeaturedProducts({ products, className }: { products: ShopifyProductData[]; className?: string }) {
  return (
    <AIOptimizedProductGrid
      sectionId="featured-products"
      initialProducts={products}
      title="Featured Products"
      className={className}
      maxProducts={8}
      showOptimizationIndicator={true}
    />
  );
}

export function AITrendingProducts({ products, className }: { products: ShopifyProductData[]; className?: string }) {
  return (
    <AIOptimizedProductGrid
      sectionId="trending-products"
      initialProducts={products}
      title="Trending Now"
      className={className}
      maxProducts={6}
      showOptimizationIndicator={false}
    />
  );
}

export function AIPersonalizedProducts({ products, className }: { products: ShopifyProductData[]; className?: string }) {
  return (
    <AIOptimizedProductGrid
      sectionId="personalized-products"
      initialProducts={products}
      title="Recommended for You"
      className={className}
      maxProducts={8}
      showOptimizationIndicator={false}
    />
  );
}

export function AIRelatedProducts({ products, className }: { products: ShopifyProductData[]; className?: string }) {
  return (
    <AIOptimizedProductGrid
      sectionId="related-products"
      initialProducts={products}
      title="You Might Also Like"
      className={className}
      maxProducts={6}
      showOptimizationIndicator={false}
    />
  );
}

export function AIUpsellProducts({ products, className }: { products: ShopifyProductData[]; className?: string }) {
  return (
    <AIOptimizedProductGrid
      sectionId="upsell-products"
      initialProducts={products}
      title="Upgrade Your Experience"
      className={className}
      maxProducts={4}
      showOptimizationIndicator={false}
    />
  );
}

export function AICollectionProducts({ products, className }: { products: ShopifyProductData[]; className?: string }) {
  return (
    <AIOptimizedProductGrid
      sectionId="collection-products"
      initialProducts={products}
      className={className}
      maxProducts={20}
      showOptimizationIndicator={false}
    />
  );
}