/**
 * Service Worker Manager
 * Handles registration, updates, and communication with the service worker
 */

interface SWMessage {
  type: string;
  data?: any;
}

interface SWMetrics {
  cacheHits: number;
  cacheMisses: number;
  networkRequests: number;
  prefetchedResources: number;
  averageResponseTime: number;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private isSupported = false;
  private updateCallbacks: Array<() => void> = [];
  private metricsCallbacks: Array<(metrics: SWMetrics) => void> = [];

  constructor() {
    this.isSupported = 'serviceWorker' in navigator;
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (!this.isSupported || typeof window === 'undefined') return;

    try {
      // Register the service worker
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none' // Always check for updates
      });

      console.log('[SW Manager] Service worker registered');

      // Listen for updates
      this.registration.addEventListener('updatefound', () => {
        console.log('[SW Manager] Service worker update found');
        this.handleUpdate();
      });

      // Listen for messages from the service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleMessage(event.data);
      });

      // Check for updates periodically
      this.startUpdateCheck();

      // Setup connection monitoring
      this.setupConnectionMonitoring();

    } catch (error) {
      console.error('[SW Manager] Service worker registration failed:', error);
    }
  }

  private handleUpdate(): void {
    if (!this.registration?.installing) return;

    const newWorker = this.registration.installing;
    
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // New service worker is ready
        this.notifyUpdateCallbacks();
      }
    });
  }

  private handleMessage(message: any): void {
    if (typeof message === 'object' && message.type === 'METRICS') {
      this.notifyMetricsCallbacks(message.data);
    }
  }

  private startUpdateCheck(): void {
    // Check for updates every 30 minutes
    setInterval(() => {
      if (this.registration) {
        this.registration.update();
      }
    }, 30 * 60 * 1000);
  }

  private setupConnectionMonitoring(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      const updateConnection = () => {
        this.sendMessage({
          type: 'UPDATE_CONNECTION',
          data: {
            connectionType: connection.effectiveType,
            downlink: connection.downlink,
            saveData: connection.saveData
          }
        });
      };

      connection.addEventListener('change', updateConnection);
      updateConnection(); // Initial update
    }
  }

  /**
   * Send a message to the service worker
   */
  private sendMessage(message: SWMessage): void {
    if (!navigator.serviceWorker.controller) return;

    navigator.serviceWorker.controller.postMessage(message);
  }

  /**
   * Prefetch images through the service worker
   */
  prefetchImages(urls: string[], priority: 'high' | 'low' = 'low'): void {
    if (!this.isSupported || !urls.length) return;

    this.sendMessage({
      type: 'PREFETCH_IMAGES',
      data: { urls, priority }
    });
  }

  /**
   * Prefetch a page through the service worker
   */
  prefetchPage(url: string): void {
    if (!this.isSupported) return;

    this.sendMessage({
      type: 'PREFETCH_PAGE',
      data: { url }
    });
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    if (!this.isSupported) return;

    this.sendMessage({
      type: 'CLEAR_CACHE'
    });
  }

  /**
   * Get performance metrics from the service worker
   */
  async getMetrics(): Promise<SWMetrics | null> {
    if (!this.isSupported || !navigator.serviceWorker.controller) return null;

    return new Promise((resolve) => {
      const channel = new MessageChannel();
      
      channel.port1.onmessage = (event) => {
        resolve(event.data);
      };

      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_METRICS' },
        [channel.port2]
      );

      // Timeout after 5 seconds
      setTimeout(() => resolve(null), 5000);
    });
  }

  /**
   * Force update the service worker
   */
  async forceUpdate(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      await this.registration.update();
      
      if (this.registration.waiting) {
        // Tell the waiting service worker to skip waiting
        this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Reload the page to use the new service worker
        window.location.reload();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[SW Manager] Force update failed:', error);
      return false;
    }
  }

  /**
   * Subscribe to update notifications
   */
  onUpdate(callback: () => void): () => void {
    this.updateCallbacks.push(callback);
    
    return () => {
      const index = this.updateCallbacks.indexOf(callback);
      if (index > -1) {
        this.updateCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to metrics updates
   */
  onMetrics(callback: (metrics: SWMetrics) => void): () => void {
    this.metricsCallbacks.push(callback);
    
    return () => {
      const index = this.metricsCallbacks.indexOf(callback);
      if (index > -1) {
        this.metricsCallbacks.splice(index, 1);
      }
    };
  }

  private notifyUpdateCallbacks(): void {
    this.updateCallbacks.forEach(callback => callback());
  }

  private notifyMetricsCallbacks(metrics: SWMetrics): void {
    this.metricsCallbacks.forEach(callback => callback(metrics));
  }

  /**
   * Check if service worker is supported and active
   */
  isActive(): boolean {
    return this.isSupported && !!navigator.serviceWorker.controller;
  }

  /**
   * Get service worker status
   */
  getStatus() {
    if (!this.isSupported) return 'unsupported';
    if (!this.registration) return 'unregistered';
    if (this.registration.installing) return 'installing';
    if (this.registration.waiting) return 'waiting';
    if (this.registration.active) return 'active';
    return 'unknown';
  }
}

// Global instance
export const swManager = new ServiceWorkerManager();

/**
 * React hook for service worker functionality
 */
export function useServiceWorker() {
  const [status, setStatus] = React.useState(swManager.getStatus());
  const [metrics, setMetrics] = React.useState<SWMetrics | null>(null);
  const [hasUpdate, setHasUpdate] = React.useState(false);

  React.useEffect(() => {
    // Subscribe to updates
    const unsubscribeUpdate = swManager.onUpdate(() => {
      setHasUpdate(true);
    });

    // Subscribe to metrics
    const unsubscribeMetrics = swManager.onMetrics(setMetrics);

    // Update status periodically
    const statusInterval = setInterval(() => {
      setStatus(swManager.getStatus());
    }, 5000);

    // Get initial metrics
    swManager.getMetrics().then(setMetrics);

    return () => {
      unsubscribeUpdate();
      unsubscribeMetrics();
      clearInterval(statusInterval);
    };
  }, []);

  return {
    isSupported: swManager.isActive(),
    status,
    metrics,
    hasUpdate,
    prefetchImages: swManager.prefetchImages.bind(swManager),
    prefetchPage: swManager.prefetchPage.bind(swManager),
    clearCache: swManager.clearCache.bind(swManager),
    forceUpdate: swManager.forceUpdate.bind(swManager),
    getMetrics: swManager.getMetrics.bind(swManager)
  };
}

/**
 * Background prefetching utility
 */
export class BackgroundPrefetcher {
  private queue: Array<{ url: string; priority: 'high' | 'low' }> = [];
  private isProcessing = false;

  /**
   * Add URL to prefetch queue
   */
  addToQueue(url: string, priority: 'high' | 'low' = 'low'): void {
    // Avoid duplicates
    if (!this.queue.find(item => item.url === url)) {
      this.queue.push({ url, priority });
      this.processQueue();
    }
  }

  /**
   * Add multiple URLs to prefetch queue
   */
  addBatch(urls: string[], priority: 'high' | 'low' = 'low'): void {
    urls.forEach(url => this.addToQueue(url, priority));
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    // Sort by priority (high first)
    this.queue.sort((a, b) => a.priority === 'high' ? -1 : 1);

    // Process in batches to avoid overwhelming the browser
    const batchSize = 3;
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, batchSize);
      
      const imageUrls = batch
        .filter(item => this.isImageUrl(item.url))
        .map(item => item.url);
      
      const pageUrls = batch
        .filter(item => !this.isImageUrl(item.url))
        .map(item => item.url);

      // Prefetch images and pages
      if (imageUrls.length > 0) {
        swManager.prefetchImages(imageUrls, batch[0].priority);
      }

      pageUrls.forEach(url => {
        swManager.prefetchPage(url);
      });

      // Wait between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.isProcessing = false;
  }

  private isImageUrl(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp|avif)(\?|$)/i.test(url) ||
           url.includes('cdn.shopify.com');
  }

  /**
   * Clear the prefetch queue
   */
  clearQueue(): void {
    this.queue = [];
  }

  /**
   * Get queue status
   */
  getQueueStatus() {
    return {
      total: this.queue.length,
      highPriority: this.queue.filter(item => item.priority === 'high').length,
      lowPriority: this.queue.filter(item => item.priority === 'low').length,
      isProcessing: this.isProcessing
    };
  }
}

export const backgroundPrefetcher = new BackgroundPrefetcher();

// Import React for hooks
import React from 'react';