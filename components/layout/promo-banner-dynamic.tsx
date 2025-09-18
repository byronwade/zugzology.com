/**
 * Dynamic Promotional Banner
 * 
 * Uses store configuration to display promotional content instead of hardcoded values.
 * Completely configurable via Shopify metafields or admin panel.
 */

'use client';

import { useStoreConfig, useStoreFeatures } from '@/hooks/use-store-config';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, X, ArrowRight } from 'lucide-react';

interface PromoBannerProps {
  showPromo: boolean;
  onDismiss: () => void;
}

export function DynamicPromoBanner({ showPromo, onDismiss }: PromoBannerProps) {
  const { promotions } = useStoreConfig();
  const { canShowPromos } = useStoreFeatures();

  // Don't show if features disabled or no promo configured
  if (!canShowPromos || !showPromo || !promotions) {
    return null;
  }

  const {
    bannerText = 'Special Offer',
    bannerLink = '/collections/sale',
    discountPercentage,
    expiryDate,
  } = promotions;

  // Check if promotion has expired
  if (expiryDate && new Date(expiryDate) < new Date()) {
    return null;
  }

  // Calculate days remaining
  const daysRemaining = expiryDate 
    ? Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="bg-purple-50 dark:bg-purple-950/20 border-b border-purple-100 dark:border-purple-900 h-8">
      <div className="relative mx-auto px-4 h-full">
        <div className="flex items-center justify-between gap-4 h-full">
          <div className="flex flex-wrap items-center gap-2 text-xs text-purple-700 dark:text-purple-300">
            <div className="flex items-center gap-2 min-w-fit">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="font-medium whitespace-nowrap">{bannerText}</span>
            </div>
            
            {discountPercentage && (
              <Badge
                variant="secondary"
                className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
              >
                Save {discountPercentage}%
              </Badge>
            )}
            
            {daysRemaining && daysRemaining > 0 && (
              <>
                <span className="hidden xs:inline text-purple-400 dark:text-purple-600">|</span>
                <span className="hidden xs:flex items-center gap-1 text-purple-500 dark:text-purple-400 whitespace-nowrap">
                  <Clock className="h-3.5 w-3.5" />
                  {daysRemaining === 1 ? 'Ends today' : `Ends in ${daysRemaining} days`}
                </span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-3 min-w-fit">
            {bannerLink && (
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 hover:no-underline"
                asChild
              >
                <a href={bannerLink} className="hidden xs:inline-flex items-center">
                  View Deals
                  <ArrowRight className="h-3 w-3 ml-1" />
                </a>
              </Button>
            )}
            
            <button
              onClick={onDismiss}
              className="text-purple-400 hover:text-purple-900 dark:hover:text-purple-100"
              aria-label="Dismiss promotional banner"
            >
              <X className="h-3.5 w-3.5" />
              <span className="sr-only">Dismiss</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}