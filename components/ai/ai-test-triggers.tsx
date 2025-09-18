"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { advancedBehaviorTracker } from '@/lib/services/advanced-behavior-tracker';
import { conversionOptimizer } from '@/lib/services/conversion-optimizer';

export function AITestTriggers() {
  const triggerHover = () => {
    advancedBehaviorTracker.trackHover('test-product-1', 1500);
  };

  const triggerView = () => {
    advancedBehaviorTracker.trackProductView('test-product-2', {
      category: 'Mushroom Kits',
      price: '29.99',
      title: 'Oyster Mushroom Kit'
    });
  };

  const triggerWishlist = () => {
    advancedBehaviorTracker.trackWishlistAdd('test-product-3');
  };

  const triggerCart = () => {
    advancedBehaviorTracker.trackCartAdd('test-product-4');
  };

  const triggerSearch = () => {
    advancedBehaviorTracker.trackSearch('mushroom growing kit');
  };

  const triggerConversionStrategy = () => {
    window.dispatchEvent(new CustomEvent('conversion-strategy', {
      detail: {
        type: 'urgency',
        message: 'Only 3 left in stock!',
        confidence: 85,
        expectedLift: 15,
        active: true
      }
    }));
  };

  const triggerPrefetch = () => {
    window.dispatchEvent(new CustomEvent('predictive-prefetch', {
      detail: {
        productId: 'test-product-5',
        action: 'view',
        confidence: 75
      }
    }));
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="fixed top-4 left-4 z-30 w-64">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">🧪 AI Test Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button 
          onClick={triggerHover} 
          variant="outline" 
          size="sm" 
          className="w-full text-xs"
        >
          Trigger Hover Event
        </Button>
        <Button 
          onClick={triggerView} 
          variant="outline" 
          size="sm" 
          className="w-full text-xs"
        >
          Trigger Product View
        </Button>
        <Button 
          onClick={triggerWishlist} 
          variant="outline" 
          size="sm" 
          className="w-full text-xs"
        >
          Trigger Wishlist Add
        </Button>
        <Button 
          onClick={triggerCart} 
          variant="outline" 
          size="sm" 
          className="w-full text-xs"
        >
          Trigger Cart Add
        </Button>
        <Button 
          onClick={triggerSearch} 
          variant="outline" 
          size="sm" 
          className="w-full text-xs"
        >
          Trigger Search
        </Button>
        <Button 
          onClick={triggerConversionStrategy} 
          variant="outline" 
          size="sm" 
          className="w-full text-xs"
        >
          Trigger Strategy
        </Button>
        <Button 
          onClick={triggerPrefetch} 
          variant="outline" 
          size="sm" 
          className="w-full text-xs"
        >
          Trigger Prefetch
        </Button>
      </CardContent>
    </Card>
  );
}