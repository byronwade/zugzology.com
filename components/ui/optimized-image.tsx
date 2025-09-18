'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useConnectionAware } from '@/lib/utils/connection-manager';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  alt: string;
  // Advanced optimization props
  eager?: boolean;
  critical?: boolean;
  placeholder?: 'blur' | 'empty' | 'shimmer';
  quality?: number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg';
  // Progressive loading
  progressive?: boolean;
  // Lazy loading with intersection observer
  rootMargin?: string;
  threshold?: number;
  // Responsive breakpoints
  breakpoints?: { [key: string]: number };
  // Error handling
  fallbackSrc?: string;
  onError?: () => void;
  // Performance monitoring
  onLoad?: (metrics: { loadTime: number; bytes?: number }) => void;
}

/**
 * Advanced optimized image component with intelligent loading strategies
 */
export function OptimizedImage({
  src,
  alt,
  eager = false,
  critical = false,
  placeholder = 'shimmer',
  quality,
  format = 'auto',
  progressive = true,
  rootMargin = '50px',
  threshold = 0.1,
  breakpoints,
  fallbackSrc,
  onError,
  onLoad,
  className = '',
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [loadTime, setLoadTime] = useState<number>(0);
  const imageRef = useRef<HTMLImageElement>(null);
  const loadStartTime = useRef<number>(0);
  
  const { settings, getOptimizedImageUrl } = useConnectionAware();
  
  // Use intersection observer for lazy loading (unless eager or critical)
  const { isIntersecting } = useIntersectionObserver(imageRef, {
    rootMargin,
    threshold,
    freezeOnceVisible: true,
    skip: eager || critical
  });

  // Determine if image should load
  const shouldLoad = eager || critical || isIntersecting;

  // Optimize image URL based on connection and settings
  const optimizedSrc = getOptimizedImageUrl(src);
  
  // Generate optimized sizes prop
  const optimizedSizes = generateSizes(breakpoints, props.sizes);
  
  // Generate quality based on connection
  const optimizedQuality = quality ?? (
    settings.quality === 'low' ? 50 :
    settings.quality === 'medium' ? 75 : 85
  );

  useEffect(() => {
    if (shouldLoad && !loadStartTime.current) {
      loadStartTime.current = performance.now();
    }
  }, [shouldLoad]);

  const handleLoad = () => {
    const endTime = performance.now();
    const loadTime = endTime - loadStartTime.current;
    
    setIsLoaded(true);
    setLoadTime(loadTime);
    
    if (onLoad) {
      onLoad({ loadTime });
    }
  };

  const handleError = () => {
    setIsError(true);
    if (onError) onError();
  };

  // Generate placeholder
  const placeholderComponent = getPlaceholder(placeholder, props.width, props.height);

  return (
    <div className={`relative overflow-hidden ${className}`} ref={imageRef}>
      {/* Placeholder */}
      {!isLoaded && !isError && placeholderComponent}
      
      {/* Main image */}
      {shouldLoad && (
        <Image
          src={isError && fallbackSrc ? fallbackSrc : optimizedSrc}
          alt={alt}
          quality={optimizedQuality}
          sizes={optimizedSizes}
          onLoad={handleLoad}
          onError={handleError}
          priority={critical}
          loading={eager || critical ? 'eager' : 'lazy'}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            objectFit: props.fill ? 'cover' : undefined,
          }}
          {...props}
        />
      )}

      {/* Progressive enhancement indicator */}
      {progressive && shouldLoad && !isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-white to-gray-200 animate-pulse" />
      )}

      {/* Load time indicator (development only) */}
      {process.env.NODE_ENV === 'development' && isLoaded && loadTime > 0 && (
        <div className="absolute top-0 right-0 bg-black/75 text-white text-xs px-1 py-0.5 rounded-bl">
          {Math.round(loadTime)}ms
        </div>
      )}

      {/* Error state */}
      {isError && !fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
}

/**
 * Generate responsive sizes based on breakpoints
 */
function generateSizes(breakpoints?: { [key: string]: number }, fallback?: string): string {
  if (fallback) return fallback;
  
  if (breakpoints) {
    const entries = Object.entries(breakpoints).sort(([, a], [, b]) => b - a);
    const sizeQueries = entries.map(([query, size]) => `${query} ${size}px`);
    return sizeQueries.join(', ');
  }
  
  // Default responsive sizes
  return '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw';
}

/**
 * Generate placeholder component
 */
function getPlaceholder(type: 'blur' | 'empty' | 'shimmer', width?: number | string, height?: number | string) {
  switch (type) {
    case 'shimmer':
      return (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-gray-200 via-white to-gray-200 animate-pulse"
          style={{ width, height }}
        />
      );
    
    case 'blur':
      return (
        <div 
          className="absolute inset-0 bg-gray-100 backdrop-blur-sm"
          style={{ width, height }}
        />
      );
    
    case 'empty':
    default:
      return (
        <div 
          className="absolute inset-0 bg-gray-100"
          style={{ width, height }}
        />
      );
  }
}

/**
 * Product image component with Shopify optimizations
 */
interface ProductImageProps extends Omit<OptimizedImageProps, 'src'> {
  src: string;
  productHandle?: string;
  variant?: 'thumbnail' | 'card' | 'detail' | 'hero';
}

export function ProductImage({ 
  src, 
  productHandle, 
  variant = 'card',
  ...props 
}: ProductImageProps) {
  const variantConfig = {
    thumbnail: { 
      quality: 60, 
      critical: false, 
      eager: false,
      breakpoints: { '(max-width: 640px)': 150, '(min-width: 641px)': 200 }
    },
    card: { 
      quality: 75, 
      critical: false, 
      eager: false,
      breakpoints: { '(max-width: 640px)': 300, '(min-width: 641px)': 400 }
    },
    detail: { 
      quality: 85, 
      critical: true, 
      eager: true,
      breakpoints: { '(max-width: 768px)': 500, '(min-width: 769px)': 800 }
    },
    hero: { 
      quality: 90, 
      critical: true, 
      eager: true,
      breakpoints: { '(max-width: 768px)': 600, '(min-width: 769px)': 1200 }
    }
  };

  const config = variantConfig[variant];

  return (
    <OptimizedImage
      src={src}
      fallbackSrc="/placeholder-product.png"
      progressive={true}
      {...config}
      {...props}
    />
  );
}

/**
 * Collection image component
 */
export function CollectionImage({ src, ...props }: Omit<OptimizedImageProps, 'variant'>) {
  return (
    <OptimizedImage
      src={src}
      quality={80}
      progressive={true}
      placeholder="shimmer"
      fallbackSrc="/placeholder-collection.png"
      breakpoints={{
        '(max-width: 640px)': 300,
        '(max-width: 1024px)': 400,
        '(min-width: 1025px)': 500
      }}
      {...props}
    />
  );
}

/**
 * Hero/banner image component with maximum optimization
 */
export function HeroImage({ src, ...props }: Omit<OptimizedImageProps, 'variant'>) {
  return (
    <OptimizedImage
      src={src}
      quality={90}
      critical={true}
      eager={true}
      progressive={false}
      placeholder="blur"
      format="webp"
      breakpoints={{
        '(max-width: 768px)': 800,
        '(max-width: 1024px)': 1200,
        '(min-width: 1025px)': 1600
      }}
      {...props}
    />
  );
}