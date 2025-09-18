"use client";

import { useEffect } from 'react';
import { advancedBehaviorTracker } from '@/lib/services/advanced-behavior-tracker';

interface ProductPageTrackerProps {
  product: {
    id: string;
    title: string;
    handle: string;
    price: string;
    vendor?: string;
    productType?: string;
    tags?: string[];
    availableForSale?: boolean;
  };
}

export function ProductPageTracker({ product }: ProductPageTrackerProps) {
  useEffect(() => {
    // Track product page view
    advancedBehaviorTracker.trackProductView(product.id, {
      category: product.productType || product.tags?.[0] || 'Unknown',
      price: product.price,
      title: product.title,
      vendor: product.vendor,
      handle: product.handle,
      availableForSale: product.availableForSale,
      pageType: 'product'
    });

    // Track time on product page
    const startTime = Date.now();
    
    return () => {
      const timeSpent = Date.now() - startTime;
      if (timeSpent > 5000) { // Only track if spent more than 5 seconds
        window.dispatchEvent(new CustomEvent('behavior-tracked', {
          detail: {
            type: 'time_on_product',
            productId: product.id,
            timeSpent,
            timestamp: Date.now()
          }
        }));
      }
    };
  }, [product]);

  // Track scroll depth on product page
  useEffect(() => {
    let maxScrollDepth = 0;
    
    const handleScroll = () => {
      const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        
        // Track significant scroll milestones
        if (scrollDepth >= 25 && scrollDepth < 50) {
          window.dispatchEvent(new CustomEvent('behavior-tracked', {
            detail: {
              type: 'product_scroll',
              productId: product.id,
              scrollDepth: 25,
              milestone: 'quarter'
            }
          }));
        } else if (scrollDepth >= 50 && scrollDepth < 75) {
          window.dispatchEvent(new CustomEvent('behavior-tracked', {
            detail: {
              type: 'product_scroll',
              productId: product.id,
              scrollDepth: 50,
              milestone: 'half'
            }
          }));
        } else if (scrollDepth >= 75) {
          window.dispatchEvent(new CustomEvent('behavior-tracked', {
            detail: {
              type: 'product_scroll',
              productId: product.id,
              scrollDepth: 75,
              milestone: 'three_quarters'
            }
          }));
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [product.id]);

  return null; // This component doesn't render anything
}