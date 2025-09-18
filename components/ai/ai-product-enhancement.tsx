"use client";

import { useState, useEffect, useCallback } from 'react';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { isAIFeatureEnabled } from '@/lib/config/ai-config';
import type { Product } from '@/lib/types';

interface EnhancedProductData {
  enhancedDescription?: string;
  growingTips?: string;
  useCase?: string;
  targetAudience?: string;
  benefits?: string[];
  warnings?: string[];
}

interface AIProductEnhancementProps {
  product: Product;
}

export default function AIProductEnhancement({ product }: AIProductEnhancementProps) {
  const [enhancement, setEnhancement] = useState<EnhancedProductData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEnabled] = useState(() => isAIFeatureEnabled('productDescriptions'));
  const [hasError, setHasError] = useState(false);

  const loadEnhancement = useCallback(async () => {
    if (!isEnabled || enhancement || isLoading || hasError) {
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.debug('✨ [AI Product] Loading enhancement for product:', product.title, { enabled: isEnabled });
    }

    setIsLoading(true);
    if (process.env.NODE_ENV === 'development') {
      console.debug('✨ [AI Product] Making API request to /api/ai/enhance-product');
    }
    
    try {
      const response = await fetch('/api/ai/enhance-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product }),
      });

      if (process.env.NODE_ENV === 'development') {
        console.debug('✨ [AI Product] API response status:', response.status);
      }

      if (response.ok) {
        const data = await response.json();
        if (process.env.NODE_ENV === 'development') {
          console.debug('✨ [AI Product] Enhancement received:', Object.keys(data.enhancement || {}));
        }
        setEnhancement(data.enhancement);
      } else {
        const errorText = await response.text();
        if (process.env.NODE_ENV === 'development') {
          console.debug('✨ [AI Product] API response body:', errorText);
        }
        setHasError(true);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('✨ [AI Product] Fetch error:', error);
      }
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [product, enhancement, isLoading, isEnabled, hasError]);

  // Auto-load enhancement when component mounts
  useEffect(() => {
    loadEnhancement();
  }, [product.id, loadEnhancement]);

  // Don't render if AI product descriptions are disabled
  if (!isEnabled) {
    return null;
  }

  if (hasError || (!enhancement && !isLoading)) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20 border border-violet-200 dark:border-violet-800/30 rounded-lg p-4 mt-6">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-0 h-auto hover:bg-transparent"
            onClick={() => !enhancement && loadEnhancement()}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              <span className="font-medium text-violet-900 dark:text-violet-100">
                AI-Enhanced Product Info
              </span>
              <Badge variant="secondary" className="text-xs bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
                AI Powered
              </Badge>
            </div>
            {isLoading ? (
              <div className="animate-spin h-4 w-4 border-2 border-violet-600 border-t-transparent rounded-full" />
            ) : (
              <div className="text-violet-600 dark:text-violet-400">
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-4 space-y-4">
          {enhancement?.enhancedDescription && (
            <div>
              <h4 className="font-medium text-violet-900 dark:text-violet-100 mb-2">Enhanced Description</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {enhancement.enhancedDescription}
              </p>
            </div>
          )}

          {enhancement?.growingTips && (
            <div>
              <h4 className="font-medium text-violet-900 dark:text-violet-100 mb-2">Growing Tips</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {enhancement.growingTips}
              </p>
            </div>
          )}

          {enhancement?.useCase && (
            <div>
              <h4 className="font-medium text-violet-900 dark:text-violet-100 mb-2">Best Use Case</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {enhancement.useCase}
              </p>
            </div>
          )}

          {enhancement?.targetAudience && (
            <div>
              <h4 className="font-medium text-violet-900 dark:text-violet-100 mb-2">Perfect For</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {enhancement.targetAudience}
              </p>
            </div>
          )}

          {enhancement?.benefits && enhancement.benefits.length > 0 && (
            <div>
              <h4 className="font-medium text-violet-900 dark:text-violet-100 mb-2">Key Benefits</h4>
              <ul className="space-y-1">
                {enhancement.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {enhancement?.warnings && enhancement.warnings.length > 0 && (
            <div>
              <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">Important Notes</h4>
              <ul className="space-y-1">
                {enhancement.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-orange-600 dark:text-orange-400 mt-1">⚠</span>
                    <span className="text-gray-700 dark:text-gray-300">{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-2 border-t border-violet-200 dark:border-violet-800/30">
            <p className="text-xs text-violet-600 dark:text-violet-400 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              AI-generated insights to help you grow successfully
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
