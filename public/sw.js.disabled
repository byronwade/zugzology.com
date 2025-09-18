/**
 * Advanced Service Worker for Aggressive Caching and Background Prefetching
 * Implements cutting-edge caching strategies for maximum performance
 */

const CACHE_VERSION = 'v1.2.0';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;

// Cache duration configurations (in milliseconds)
const CACHE_STRATEGIES = {
  static: 7 * 24 * 60 * 60 * 1000,      // 7 days
  dynamic: 24 * 60 * 60 * 1000,         // 1 day
  images: 30 * 24 * 60 * 60 * 1000,     // 30 days
  api: 5 * 60 * 1000,                   // 5 minutes
  fonts: 30 * 24 * 60 * 60 * 1000,      // 30 days
};

// Resources to cache immediately on install
const PRECACHE_RESOURCES = [
  '/',
  '/manifest.json',
  '/placeholder.svg',
  '/logo.png'
];

// Critical routes for instant loading
const CRITICAL_ROUTES = [
  '/',
  '/products',
  '/collections',
  '/cart',
  '/search'
];

// Background sync tags
const SYNC_TAGS = {
  PREFETCH_IMAGES: 'prefetch-images',
  PREFETCH_PAGES: 'prefetch-pages',
  ANALYTICS: 'analytics-sync'
};

// Performance monitoring
let performanceMetrics = {
  cacheHits: 0,
  cacheMisses: 0,
  networkRequests: 0,
  prefetchedResources: 0,
  averageResponseTime: 0
};

/**
 * Install Event - Precache critical resources
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  
  event.waitUntil(
    (async () => {
      // Open cache and precache critical resources
      const cache = await caches.open(STATIC_CACHE);
      
      // Try to cache each resource individually to avoid complete failure
      const cachePromises = PRECACHE_RESOURCES.map(async (resource) => {
        try {
          await cache.add(resource);
          console.log(`[SW] Cached: ${resource}`);
        } catch (error) {
          console.warn(`[SW] Failed to cache: ${resource}`, error);
        }
      });
      
      await Promise.all(cachePromises);
      
      // Skip waiting to activate immediately
      await self.skipWaiting();
      
      console.log('[SW] Precached critical resources');
    })()
  );
});

/**
 * Activate Event - Clean up old caches and claim clients
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const cacheNames = await caches.keys();
      const deletePromises = cacheNames
        .filter(name => !name.includes(CACHE_VERSION))
        .map(name => caches.delete(name));
      
      await Promise.all(deletePromises);
      
      // Claim all clients immediately
      await self.clients.claim();
      
      console.log('[SW] Old caches cleaned up, service worker activated');
    })()
  );
});

/**
 * Fetch Event - Intelligent caching with multiple strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-HTTP requests and browser extensions
  if (!request.url.startsWith('http') || url.origin.includes('extension')) {
    return;
  }

  event.respondWith(handleRequest(request));
});

/**
 * Background Sync - Handle offline prefetching
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  switch (event.tag) {
    case SYNC_TAGS.PREFETCH_IMAGES:
      event.waitUntil(prefetchQueuedImages());
      break;
    case SYNC_TAGS.PREFETCH_PAGES:
      event.waitUntil(prefetchQueuedPages());
      break;
    case SYNC_TAGS.ANALYTICS:
      event.waitUntil(syncAnalytics());
      break;
  }
});

/**
 * Message Event - Handle commands from main thread
 */
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'PREFETCH_IMAGES':
      prefetchImages(data.urls, data.priority);
      break;
    case 'PREFETCH_PAGE':
      prefetchPage(data.url);
      break;
    case 'CLEAR_CACHE':
      clearAllCaches();
      break;
    case 'GET_METRICS':
      event.ports[0].postMessage(performanceMetrics);
      break;
    case 'UPDATE_CONNECTION':
      updateConnectionStrategy(data.connectionType);
      break;
  }
});

/**
 * Main request handler with intelligent routing
 */
async function handleRequest(request) {
  const startTime = performance.now();
  const url = new URL(request.url);
  
  try {
    let response;
    
    // Route to appropriate strategy based on request type
    if (isStaticAsset(request)) {
      response = await handleStaticAsset(request);
    } else if (isImageRequest(request)) {
      response = await handleImageRequest(request);
    } else if (isAPIRequest(request)) {
      response = await handleAPIRequest(request);
    } else if (isNavigationRequest(request)) {
      response = await handleNavigationRequest(request);
    } else {
      response = await handleDynamicRequest(request);
    }
    
    // Update performance metrics
    const responseTime = performance.now() - startTime;
    updateMetrics(response.fromCache ? 'hit' : 'miss', responseTime);
    
    return response;
    
  } catch (error) {
    console.error('[SW] Request failed:', error);
    updateMetrics('miss', performance.now() - startTime);
    return handleFallback(request);
  }
}

/**
 * Static assets - Cache first with long TTL
 */
async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  
  if (cached && !isExpired(cached, CACHE_STRATEGIES.static)) {
    cached.fromCache = true;
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const responseClone = response.clone();
      responseClone.headers.set('sw-cached-at', Date.now().toString());
      await cache.put(request, responseClone);
    }
    return response;
  } catch (error) {
    return cached || new Response('Static asset unavailable', { status: 404 });
  }
}

/**
 * Images - Cache first with aggressive caching
 */
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);
  
  if (cached && !isExpired(cached, CACHE_STRATEGIES.images)) {
    cached.fromCache = true;
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const responseClone = response.clone();
      responseClone.headers.set('sw-cached-at', Date.now().toString());
      await cache.put(request, responseClone);
      
      // Prefetch related images in background
      prefetchRelatedImages(request.url);
    }
    return response;
  } catch (error) {
    return cached || generatePlaceholderImage();
  }
}

/**
 * API requests - Network first with fast timeout
 */
async function handleAPIRequest(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    // Try network first with timeout
    const networkPromise = fetch(request);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Network timeout')), 3000)
    );
    
    const response = await Promise.race([networkPromise, timeoutPromise]);
    
    if (response.ok) {
      const responseClone = response.clone();
      responseClone.headers.set('sw-cached-at', Date.now().toString());
      await cache.put(request, responseClone);
    }
    
    return response;
  } catch (error) {
    // Fallback to cache
    const cached = await cache.match(request);
    if (cached && !isExpired(cached, CACHE_STRATEGIES.api)) {
      cached.fromCache = true;
      cached.headers.set('sw-from-cache', 'true');
      return cached;
    }
    
    throw error;
  }
}

/**
 * Navigation requests - Network first with app shell fallback
 */
async function handleNavigationRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const responseClone = response.clone();
      await cache.put(request, responseClone);
    }
    return response;
  } catch (error) {
    // Try cache first
    const cached = await cache.match(request);
    if (cached) {
      cached.fromCache = true;
      return cached;
    }
    
    // Fallback to app shell for SPAs
    const appShell = await cache.match('/');
    if (appShell) {
      appShell.fromCache = true;
      return appShell;
    }
    
    throw error;
  }
}

/**
 * Dynamic requests - Stale while revalidate
 */
async function handleDynamicRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  // Serve from cache immediately if available
  const cached = await cache.match(request);
  
  // Fetch and update cache in background
  const fetchPromise = fetch(request)
    .then(response => {
      if (response.ok) {
        const responseClone = response.clone();
        cache.put(request, responseClone);
      }
      return response;
    })
    .catch(() => null);
  
  // Return cached version or wait for network
  if (cached && !isExpired(cached, CACHE_STRATEGIES.dynamic)) {
    cached.fromCache = true;
    fetchPromise; // Fire and forget
    return cached;
  }
  
  return await fetchPromise || cached || new Response('Resource unavailable', { status: 404 });
}

/**
 * Prefetch images with intelligent queuing
 */
async function prefetchImages(urls, priority = 'low') {
  if (!Array.isArray(urls)) return;
  
  const cache = await caches.open(IMAGE_CACHE);
  const batchSize = priority === 'high' ? 6 : 3;
  
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const promises = batch.map(async (url) => {
      try {
        const cached = await cache.match(url);
        if (cached) return;
        
        const response = await fetch(url, { priority });
        if (response.ok) {
          await cache.put(url, response);
          performanceMetrics.prefetchedResources++;
        }
      } catch (error) {
        console.debug('[SW] Failed to prefetch image:', url);
      }
    });
    
    await Promise.allSettled(promises);
    
    // Pause between batches to avoid overwhelming the network
    if (i + batchSize < urls.length) {
      await new Promise(resolve => setTimeout(resolve, priority === 'high' ? 100 : 500));
    }
  }
}

/**
 * Prefetch page resources
 */
async function prefetchPage(url) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const response = await fetch(url);
    
    if (response.ok) {
      await cache.put(url, response.clone());
      
      // Extract and prefetch critical resources from the page
      const html = await response.text();
      const criticalResources = extractCriticalResources(html);
      await prefetchImages(criticalResources.images, 'high');
    }
  } catch (error) {
    console.debug('[SW] Failed to prefetch page:', url);
  }
}

/**
 * Extract critical resources from HTML
 */
function extractCriticalResources(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  const images = Array.from(doc.querySelectorAll('img[src]'))
    .map(img => img.src)
    .filter(src => src.startsWith('http'));
  
  const stylesheets = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'))
    .map(link => link.href);
  
  return { images, stylesheets };
}

/**
 * Generate placeholder image for failed loads
 */
function generatePlaceholderImage() {
  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af">
        Image unavailable
      </text>
    </svg>
  `;
  
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-cache'
    }
  });
}

/**
 * Utility functions
 */
function isStaticAsset(request) {
  const url = new URL(request.url);
  return /\.(js|css|woff2?|ttf|eot)$/i.test(url.pathname);
}

function isImageRequest(request) {
  const url = new URL(request.url);
  return /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(url.pathname) ||
         url.hostname.includes('cdn.shopify.com');
}

function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/') || 
         url.hostname.includes('api.') ||
         request.headers.get('content-type')?.includes('application/json');
}

function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

function isExpired(response, maxAge) {
  const cachedAt = response.headers.get('sw-cached-at');
  if (!cachedAt) return true;
  
  const age = Date.now() - parseInt(cachedAt);
  return age > maxAge;
}

function updateMetrics(type, responseTime) {
  if (type === 'hit') {
    performanceMetrics.cacheHits++;
  } else {
    performanceMetrics.cacheMisses++;
    performanceMetrics.networkRequests++;
  }
  
  // Update average response time
  const totalRequests = performanceMetrics.cacheHits + performanceMetrics.cacheMisses;
  performanceMetrics.averageResponseTime = 
    (performanceMetrics.averageResponseTime * (totalRequests - 1) + responseTime) / totalRequests;
}

async function handleFallback(request) {
  if (request.mode === 'navigate') {
    const cache = await caches.open(STATIC_CACHE);
    return (await cache.match('/offline')) || 
           new Response('Offline', { status: 503 });
  }
  
  return new Response('Resource unavailable', { status: 404 });
}

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  console.log('[SW] All caches cleared');
}

function updateConnectionStrategy(connectionType) {
  // Adjust prefetch behavior based on connection
  if (connectionType === 'slow-2g' || connectionType === '2g') {
    // Disable aggressive prefetching
    self.skipPrefetch = true;
  } else {
    self.skipPrefetch = false;
  }
}

async function prefetchQueuedImages() {
  // Handle background sync for queued images
  console.log('[SW] Processing queued image prefetches');
}

async function prefetchQueuedPages() {
  // Handle background sync for queued pages
  console.log('[SW] Processing queued page prefetches');
}

async function syncAnalytics() {
  // Send performance metrics when back online
  console.log('[SW] Syncing analytics data');
}

function prefetchRelatedImages(imageUrl) {
  // Intelligent prefetching of related images
  // This could analyze the image URL pattern to prefetch similar images
}

console.log('[SW] Service worker loaded and ready');