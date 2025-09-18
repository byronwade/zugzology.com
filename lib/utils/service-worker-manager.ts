/**
 * Service Worker Manager
 * DISABLED - prefetching removed per user request
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
    this.isSupported = false; // Disabled
  }

  private async initialize(): Promise<void> {
    // Service worker disabled - prefetching removed per user request
    return;
  }

  private handleUpdate(): void {
    // Disabled
  }

  private handleMessage(message: any): void {
    // Disabled
  }

  private startUpdateCheck(): void {
    // Disabled
  }

  private setupConnectionMonitoring(): void {
    // Disabled
  }

  private notifyUpdateCallbacks(): void {
    // Disabled
  }

  private notifyMetricsCallbacks(metrics: SWMetrics): void {
    // Disabled
  }

  public onUpdate(callback: () => void): () => void {
    return () => {};
  }

  public onMetrics(callback: (metrics: SWMetrics) => void): () => void {
    return () => {};
  }

  public async checkForUpdate(): Promise<void> {
    // Disabled
  }

  public async skipWaiting(): Promise<void> {
    // Disabled
  }

  public async prefetchRoutes(routes: string[]): Promise<void> {
    // Disabled
  }

  public async prefetchImages(imageUrls: string[]): Promise<void> {
    // Disabled
  }

  public async clearCache(): Promise<void> {
    // Disabled
  }

  public async getCacheStats(): Promise<{ size: number; count: number }> {
    return { size: 0, count: 0 };
  }

  public getStatus(): 'inactive' | 'installing' | 'waiting' | 'active' {
    return 'inactive';
  }

  public async sendMessage(message: SWMessage): Promise<void> {
    // Disabled
  }

  public destroy(): void {
    // Disabled
  }
}

// Export singleton instance
export const swManager = new ServiceWorkerManager();

// React hook for using the service worker manager
export function useServiceWorker() {
  return {
    metrics: null as SWMetrics | null,
    status: 'inactive' as const,
    update: async () => {},
    skipWaiting: async () => {},
    clearCache: async () => {},
  };
}