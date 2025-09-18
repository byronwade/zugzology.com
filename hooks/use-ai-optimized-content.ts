"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { shopifyDataContext, type ShopifyProductData } from '@/lib/services/shopify-data-context';
import { aiContentManipulator, type ComponentArrangement } from '@/lib/services/ai-content-manipulator';

export interface AIOptimizedSection {
  id: string;
  products: ShopifyProductData[];
  arrangement?: ComponentArrangement;
  lastOptimized: number;
  reason?: string;
}

export function useAIOptimizedProducts(sectionId: string, fallbackProducts: ShopifyProductData[] = []) {
  const [products, setProducts] = useState<ShopifyProductData[]>(fallbackProducts);
  const [lastOptimized, setLastOptimized] = useState<number>(0);
  const [reason, setReason] = useState<string>('');
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    const handleProductReorder = (event: CustomEvent) => {
      const { sectionId: targetSectionId, products: newProducts, reason: newReason } = event.detail;
      
      if (targetSectionId === sectionId) {
        setIsOptimizing(true);
        
        // Smooth transition
        setTimeout(() => {
          setProducts(newProducts);
          setLastOptimized(Date.now());
          setReason(newReason);
          setIsOptimizing(false);
        }, 300); // Small delay for smooth transition
      }
    };

    window.addEventListener('product-reorder-applied', handleProductReorder as EventListener);
    
    return () => {
      window.removeEventListener('product-reorder-applied', handleProductReorder as EventListener);
    };
  }, [sectionId]);

  // Force optimization
  const forceOptimization = useCallback(() => {
    aiContentManipulator.forceOptimization();
  }, []);

  return {
    products,
    lastOptimized,
    reason,
    isOptimizing,
    forceOptimization
  };
}

export function useAIComponentArrangement(pageId: string) {
  const [arrangements, setArrangements] = useState<ComponentArrangement[]>([]);
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  useEffect(() => {
    const handleArrangementChange = (event: CustomEvent) => {
      const { pageId: targetPageId, arrangements: newArrangements } = event.detail;
      
      if (targetPageId === pageId) {
        setArrangements(newArrangements);
        setLastUpdate(Date.now());
      }
    };

    window.addEventListener('component-arrangement-changed', handleArrangementChange as EventListener);
    
    // Get initial arrangement
    const initialArrangements = aiContentManipulator.getComponentArrangement(pageId);
    setArrangements(initialArrangements);
    
    return () => {
      window.removeEventListener('component-arrangement-changed', handleArrangementChange as EventListener);
    };
  }, [pageId]);

  // Convert arrangements to sorted order
  const sortedComponents = useMemo(() => {
    return arrangements
      .slice()
      .sort((a, b) => a.newPosition - b.newPosition);
  }, [arrangements]);

  return {
    arrangements,
    sortedComponents,
    lastUpdate
  };
}

export function useAIHomepageData() {
  const [homepageData, setHomepageData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHomepageData = () => {
      try {
        const data = shopifyDataContext.getProductsForHomepage();
        setHomepageData(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load homepage data:', error);
        setIsLoading(false);
      }
    };

    // Initial load
    loadHomepageData();

    // Listen for data updates
    const handleDataUpdate = () => {
      loadHomepageData();
    };

    window.addEventListener('shopify-data-updated', handleDataUpdate);
    
    return () => {
      window.removeEventListener('shopify-data-updated', handleDataUpdate);
    };
  }, []);

  return {
    homepageData,
    isLoading
  };
}

export function useAIProductFiltering() {
  const [filters, setFilters] = useState<any>({});
  
  const getPersonalizedProducts = useCallback((limit: number = 20) => {
    return shopifyDataContext.getPersonalizedProducts(limit);
  }, []);

  const getTrendingProducts = useCallback((limit: number = 20) => {
    return shopifyDataContext.getTrendingProducts(limit);
  }, []);

  const getHighMarginProducts = useCallback((limit: number = 20) => {
    return shopifyDataContext.getHighMarginProducts(limit);
  }, []);

  const getLowStockProducts = useCallback(() => {
    return shopifyDataContext.getLowStockProducts();
  }, []);

  const getTopScoredProducts = useCallback((limit: number = 10) => {
    return shopifyDataContext.getTopScoredProducts(limit);
  }, []);

  return {
    getPersonalizedProducts,
    getTrendingProducts,
    getHighMarginProducts,
    getLowStockProducts,
    getTopScoredProducts,
    filters,
    setFilters
  };
}