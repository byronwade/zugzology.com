/**
 * Dynamic Affiliate Links Component
 * 
 * Displays affiliate links from store configuration instead of hardcoded values.
 * Completely configurable via Shopify metafields or admin panel.
 */

'use client';

import { useStoreConfig } from '@/hooks/use-store-config';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

interface AffiliateLinksProps {
  className?: string;
}

export function DynamicAffiliateLinks({ className }: AffiliateLinksProps) {
  const { navigation } = useStoreConfig();
  
  // Don't render if no affiliate links configured
  if (!navigation.affiliateLinks || navigation.affiliateLinks.length === 0) {
    return null;
  }

  const affiliateLinks = navigation.affiliateLinks;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className={className}>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Globe className="h-5 w-5" />
          <span className="sr-only">Related Websites</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[200px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-1 shadow-lg rounded-lg"
      >
        {affiliateLinks.map((link, index) => (
          <DropdownMenuItem
            key={index}
            asChild
            className="rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
          >
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full cursor-pointer"
            >
              <Globe className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
              {link.name}
            </a>
          </DropdownMenuItem>
        ))}
        
        {affiliateLinks.length > 2 && (
          <>
            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-800 my-1" />
            <div className="px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400">
              Partner Sites
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Mobile version for dropdown menus
 */
export function DynamicAffiliateLinksDropdown() {
  const { navigation } = useStoreConfig();
  
  // Don't render if no affiliate links configured
  if (!navigation.affiliateLinks || navigation.affiliateLinks.length === 0) {
    return null;
  }

  return (
    <>
      {navigation.affiliateLinks.map((link, index) => (
        <DropdownMenuItem
          key={index}
          asChild
          className="rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
        >
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full cursor-pointer"
          >
            <Globe className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
            {link.name}
          </a>
        </DropdownMenuItem>
      ))}
    </>
  );
}