'use client';

import Link from 'next/link';
import { ComponentProps } from 'react';

type EnhancedLinkProps = ComponentProps<typeof Link> & {
  prefetchImages?: string[];
  hoverDelay?: number;
  priority?: 'high' | 'low';
};

/**
 * Enhanced Link Component - DISABLED
 * All prefetching functionality has been disabled per user request
 * This now behaves as a regular Next.js Link
 */
export function EnhancedLink({ 
  children, 
  prefetchImages, 
  hoverDelay, 
  priority,
  ...props 
}: EnhancedLinkProps) {
  // Just return a regular Next.js Link with no prefetching
  return (
    <Link {...props} prefetch={false}>
      {children}
    </Link>
  );
}

export default EnhancedLink;