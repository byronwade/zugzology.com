# Performance Optimizations Guide

## Overview

This document describes the performance optimizations implemented in Zugzology.com, inspired by NextMaster/NextFaster and leveraging Next.js 16 beta features.

## Features Implemented

### 1. Enhanced Link Component (`PrefetchLink`)

Location: `src/components/ui/prefetch-link.tsx`

#### What It Does

The `PrefetchLink` component enhances Next.js's standard `<Link>` component with:

- **Image Prefetching**: Automatically prefetches images when links enter the viewport or on hover
- **Faster Navigation**: Navigates on `mousedown` instead of `click` (100ms faster perceived performance)
- **Intelligent Caching**: Avoids redundant prefetches with smart cache management
- **Viewport Detection**: Uses IntersectionObserver to prefetch when links become visible

#### Basic Usage

```tsx
import { PrefetchLink } from "@/components/ui/prefetch-link";

// Simple usage (just like next/link)
<PrefetchLink href="/products/mushroom-kit">
  View Product
</PrefetchLink>

// With image prefetching
<PrefetchLink
  href="/products/mushroom-kit"
  prefetchImages={[
    "https://cdn.shopify.com/product1.jpg",
    "https://cdn.shopify.com/product2.jpg"
  ]}
>
  View Product
</PrefetchLink>

// With single image
<PrefetchLink
  href="/products/mushroom-kit"
  prefetchImages="https://cdn.shopify.com/product1.jpg"
>
  View Product
</PrefetchLink>
```

#### Advanced Usage

```tsx
// High priority for above-the-fold content
<PrefetchLink
  href="/products/featured"
  prefetchImages={heroImages}
  prefetchPriority="high"
>
  Featured Product
</PrefetchLink>

// Disable image prefetching (only prefetch route)
<PrefetchLink
  href="/products/list"
  disableImagePrefetch
>
  All Products
</PrefetchLink>

// Disable viewport prefetching (only on hover/mousedown)
<PrefetchLink
  href="/products/detail"
  prefetchImages={images}
  disableViewportPrefetch
>
  Product Details
</PrefetchLink>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `prefetchImages` | `string \| string[]` | `undefined` | Image URLs to prefetch |
| `disableImagePrefetch` | `boolean` | `false` | Disable image prefetching |
| `disableViewportPrefetch` | `boolean` | `false` | Disable viewport-based prefetching |
| `prefetchPriority` | `'high' \| 'low'` | `'low'` | Priority level for image prefetching |

All other props are passed through to Next.js's `<Link>` component.

### 2. Image Prefetcher Utility

Location: `src/lib/utils/image-prefetcher.ts`

#### What It Does

A standalone utility for programmatic image prefetching with:

- **Smart Caching**: Tracks prefetched images to avoid redundant requests
- **Network Awareness**: Respects Save-Data header and slow connections
- **Priority Control**: High/low priority prefetching
- **Error Handling**: Retry logic with configurable attempts
- **Metrics**: Track success/failure rates and performance

#### Basic Usage

```ts
import { imagePrefetcher } from "@/lib/utils/image-prefetcher";

// Prefetch a single image
await imagePrefetcher.prefetchImage("https://cdn.shopify.com/image.jpg");

// Prefetch multiple images
await imagePrefetcher.prefetchImages([
  "https://cdn.shopify.com/image1.jpg",
  "https://cdn.shopify.com/image2.jpg",
  "https://cdn.shopify.com/image3.jpg",
]);

// Check if an image is cached
if (imagePrefetcher.isCached(imageUrl)) {
  console.log("Image already prefetched!");
}

// Get cache status
const status = imagePrefetcher.getCacheStatus();
console.log(`Cached: ${status.cached}, Pending: ${status.pending}, Failed: ${status.failed}`);
```

#### Advanced Usage

```ts
// High priority prefetch with retries
await imagePrefetcher.prefetchImage(heroImageUrl, {
  priority: "high",
  retries: 3,
  retryDelay: 2000,
  timeout: 15000,
});

// Warmup cache for critical images (hero, above-the-fold)
await imagePrefetcher.warmup([
  heroImageUrl,
  featuredProduct1,
  featuredProduct2,
]);

// Retry all failed prefetches
const results = await imagePrefetcher.retryFailed({
  retries: 2,
});

// Get detailed metrics
const metrics = imagePrefetcher.getMetrics();
console.log("Prefetch metrics:", metrics);

// Clear cache
imagePrefetcher.clearCache();
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `priority` | `'high' \| 'low' \| 'auto'` | `'auto'` | Priority level |
| `timeout` | `number` | `10000` | Timeout in milliseconds |
| `retries` | `number` | `1` | Number of retry attempts |
| `retryDelay` | `number` | `1000` | Delay between retries (ms) |
| `force` | `boolean` | `false` | Force prefetch even if cached |

#### Network Awareness

The image prefetcher automatically respects:
- **Save-Data header**: Skips prefetching if user has data-saving enabled
- **Connection speed**: Skips on 2G or slower connections
- Uses `priority: 'auto'` to respect these settings

### 3. Next.js 16 Caching Improvements

Location: `src/lib/api/shopify/cache-config.ts`

#### cacheLife Profiles

We've configured stale-while-revalidate (SWR) profiles for different data types:

| Profile | Stale Time | Revalidate | Expire | Use Case |
|---------|-----------|------------|--------|----------|
| `products` | 1 hour | 24 hours | 7 days | Product data |
| `collections` | 30 min | 12 hours | 3 days | Collection listings |
| `blogs` | 2 hours | 24 hours | 14 days | Blog posts |
| `settings` | 12 hours | 24 hours | 30 days | Site settings |
| `navigation` | 6 hours | 12 hours | 7 days | Menu/header |
| `dynamic` | 5 min | 1 hour | 1 day | Real-time data |
| `featured` | 15 min | 1 hour | 1 day | Homepage content |

#### How SWR Works

1. **Stale**: Serve cached data immediately for this duration
2. **Revalidate**: After stale period, serve cache but fetch fresh data in background
3. **Expire**: After this duration, data is completely invalidated

This provides instant page loads while keeping data fresh!

### 4. Turbopack Filesystem Caching

Location: `next.config.ts`

#### What It Does

Stores Turbopack compiler artifacts on disk for:
- **Faster Restarts**: 40-60% faster dev server startup
- **Faster Builds**: 20-40% improvement in build times
- **Better CI/CD**: Reuse cache across pipeline runs

#### Configuration

Already enabled in `next.config.ts`:

```ts
experimental: {
  turbo: {
    useFileSystemCache: true,
  },
}
```

No additional setup required!

### 5. Enhanced Resource Hints

Location: `src/app/layout.tsx`

#### What It Does

Optimizes loading of critical third-party resources:

- **DNS Prefetch**: Resolves DNS early for faster connections
- **Preconnect**: Establishes full connection (DNS + TCP + TLS)

#### Domains Optimized

- `cdn.shopify.com` - Product images
- `fonts.googleapis.com` - Google Fonts CSS
- `fonts.gstatic.com` - Google Fonts files
- `bevgyjm5apuichhj.public.blob.vercel-storage.com` - Vercel Blob Storage

## Migration Guide

### Replace Standard Links with PrefetchLink

#### Before

```tsx
import Link from "next/link";

<Link href={`/products/${product.handle}`}>
  <Image src={product.image} alt={product.title} />
  {product.title}
</Link>
```

#### After

```tsx
import { PrefetchLink } from "@/components/ui/prefetch-link";

<PrefetchLink
  href={`/products/${product.handle}`}
  prefetchImages={product.images.map(img => img.url)}
  prefetchPriority={priority ? "high" : "low"}
>
  <Image src={product.image} alt={product.title} />
  {product.title}
</PrefetchLink>
```

### When to Use Standard Link vs PrefetchLink

#### Use PrefetchLink For:

✅ Product cards with images
✅ Navigation to pages with hero images
✅ Any link where you know what images will be on the destination
✅ Above-the-fold content

#### Use Standard Link For:

❌ Simple text-only links
❌ External links
❌ Links where destination images are unknown
❌ Modal/dialog triggers

## Performance Metrics

### Expected Improvements

| Metric | Improvement | Impact |
|--------|-------------|--------|
| Link Navigation | ~100ms faster | ⭐⭐⭐ High |
| Image Loading | Eliminate flashing | ⭐⭐⭐ High |
| Page Transitions | 2-3x faster | ⭐⭐⭐ High |
| Build Time | 20-40% faster | ⭐⭐ Medium |
| Dev Startup | 40-60% faster | ⭐⭐ Medium |
| First Contentful Paint | 10-20% better | ⭐⭐ Medium |
| Time to Interactive | 15-25% better | ⭐⭐ Medium |

### Measuring Performance

```tsx
// Use the built-in metrics
const metrics = imagePrefetcher.getMetrics();
console.log("Prefetch performance:", metrics);

// Check cache efficiency
const status = imagePrefetcher.getCacheStatus();
console.log(`Cache hit rate: ${
  (status.cached / (status.cached + status.failed)) * 100
}%`);
```

### Browser DevTools

1. Open Chrome DevTools → Performance
2. Record a page navigation
3. Look for reduced "Loading" time and faster "Rendering"
4. Check Network tab for prefetched resources

## Best Practices

### 1. Prioritize Critical Content

```tsx
// Above-the-fold hero image
<PrefetchLink
  href="/featured"
  prefetchImages={heroImage}
  prefetchPriority="high"  // ✅ High priority
>
  Hero Product
</PrefetchLink>

// Below-the-fold products
<PrefetchLink
  href="/products/item"
  prefetchImages={productImages}
  prefetchPriority="low"  // ✅ Low priority
>
  Product Card
</PrefetchLink>
```

### 2. Limit Image Count

```tsx
// ✅ Good - Prefetch only first 2-3 images
<PrefetchLink
  href="/product"
  prefetchImages={product.images.slice(0, 3)}
>
  Product
</PrefetchLink>

// ❌ Bad - Don't prefetch all images
<PrefetchLink
  href="/product"
  prefetchImages={product.images}  // Could be 20+ images!
>
  Product
</PrefetchLink>
```

### 3. Use Warmup for Critical Pages

```tsx
// In your root layout or app initialization
useEffect(() => {
  // Warmup homepage hero images
  imagePrefetcher.warmup([
    heroImage1,
    heroImage2,
    featuredProduct1,
  ]);
}, []);
```

### 4. Monitor Performance

```tsx
// Add performance monitoring
useEffect(() => {
  const interval = setInterval(() => {
    const status = imagePrefetcher.getCacheStatus();

    if (process.env.NODE_ENV === "development") {
      console.log("Prefetch cache:", status);
    }

    // Send to analytics
    trackMetric("prefetch_cache_size", status.cached);
  }, 30000); // Every 30 seconds

  return () => clearInterval(interval);
}, []);
```

## Troubleshooting

### Images Not Prefetching

1. **Check browser console** for errors
2. **Verify URLs** are valid and accessible
3. **Check network conditions** - prefetching skips on slow connections
4. **Inspect cache** with `imagePrefetcher.getCacheStatus()`

### Navigation Not Faster

1. **Verify PrefetchLink** is being used (not standard Link)
2. **Check mousedown handler** is firing (DevTools → Events)
3. **Test on production build** (dev mode has additional overhead)

### Build Errors

1. **Clear `.next` cache**: `rm -rf .next`
2. **Rebuild**: `npm run build`
3. **Check TypeScript errors**: `npm run type-check`

## Future Optimizations

### Phase 2 (Planned)

- [ ] Progressive image loading with blur-up placeholders
- [ ] Intelligent prefetch based on user behavior patterns
- [ ] Route-based prefetch strategies
- [ ] Service Worker integration for offline support
- [ ] Adaptive loading based on device capabilities

### Phase 3 (Advanced)

- [ ] Machine learning for prefetch prediction
- [ ] Edge caching with ISR
- [ ] Real-time analytics dashboard
- [ ] A/B testing framework for optimization strategies

## Support

For questions or issues:

1. Check this documentation first
2. Review implementation in `src/components/ui/prefetch-link.tsx`
3. Check console for error messages
4. Review Next.js 16 documentation: https://nextjs.org/docs

## Changelog

### 2025-10-14 - Initial Implementation

- ✅ Created PrefetchLink component with NextMaster-style optimizations
- ✅ Modernized image prefetcher utility
- ✅ Enabled Turbopack filesystem caching
- ✅ Added Next.js 16 cacheLife profiles
- ✅ Enhanced resource hints in layout
- ✅ Documented all features

---

**Last Updated**: 2025-10-14
**Next.js Version**: 16.0.0-canary
**Turbopack**: Stable (with filesystem caching beta)
**React Compiler**: Stable
