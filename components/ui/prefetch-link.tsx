'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCallback, useRef } from 'react';

interface PrefetchLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}

/**
 * Simple prefetch link - route prefetching only
 * No image prefetching - just Next.js route prefetching on hover
 */
export function PrefetchLink({ 
  href, 
  children, 
  className,
  ...props 
}: PrefetchLinkProps) {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Prefetch after short delay to avoid excessive requests
    timeoutRef.current = setTimeout(() => {
      // Prefetch the route only
      router.prefetch(href);
    }, 100);
  }, [href, router]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return (
    <Link
      href={href}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </Link>
  );
}