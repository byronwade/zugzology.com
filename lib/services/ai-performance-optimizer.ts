"use client";

/**
 * High-Performance AI Optimization Service
 * Eliminates unnecessary API calls and optimizes computation
 */

interface PerformanceMetrics {
  calculationsPerSecond: number;
  cacheHitRate: number;
  memoryUsage: number;
  avgCalculationTime: number;
  redundantCalculations: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hitCount: number;
  lastAccess: number;
}

class AIPerformanceOptimizer {
  private static instance: AIPerformanceOptimizer;
  
  // Performance tracking
  private performanceMetrics: PerformanceMetrics = {
    calculationsPerSecond: 0,
    cacheHitRate: 0,
    memoryUsage: 0,
    avgCalculationTime: 0,
    redundantCalculations: 0
  };
  
  // Intelligent caching system
  private cache = new Map<string, CacheEntry<any>>();
  private calculationQueue = new Set<string>();
  private batchedCalculations = new Map<string, NodeJS.Timeout>();
  
  // Performance constants - Optimized for extreme speed
  private readonly CACHE_TTL = 60000; // 1 minute - longer cache for speed
  private readonly MAX_CACHE_SIZE = 2000; // Larger cache
  private readonly BATCH_DELAY = 10; // 10ms batching - much faster
  private readonly CALCULATION_THROTTLE = 8; // ~120fps - much faster
  
  private calculationCount = 0;
  private startTime = Date.now();
  private lastCleanup = Date.now();

  public static getInstance(): AIPerformanceOptimizer {
    if (!AIPerformanceOptimizer.instance) {
      AIPerformanceOptimizer.instance = new AIPerformanceOptimizer();
    }
    return AIPerformanceOptimizer.instance;
  }

  /**
   * Intelligent memoization with automatic cache management
   */
  public memoize<T>(
    key: string, 
    computeFn: () => T, 
    ttl: number = this.CACHE_TTL
  ): T {
    const now = Date.now();
    
    // Check if we have a valid cache entry
    const cached = this.cache.get(key);
    if (cached && (now - cached.timestamp) < ttl) {
      cached.hitCount++;
      cached.lastAccess = now;
      return cached.data;
    }
    
    // Compute new value
    const startCalc = performance.now();
    const result = computeFn();
    const calcTime = performance.now() - startCalc;
    
    // Update performance metrics
    this.updatePerformanceMetrics(calcTime);
    
    // Cache the result
    this.cache.set(key, {
      data: result,
      timestamp: now,
      hitCount: 1,
      lastAccess: now
    });
    
    // Cleanup cache if needed
    this.cleanupCache();
    
    return result;
  }

  /**
   * Batch calculations to prevent redundant processing
   */
  public batchCalculation(
    key: string, 
    calculation: () => void, 
    delay: number = this.BATCH_DELAY
  ): void {
    // Cancel existing batch for this key
    const existingTimeout = this.batchedCalculations.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    // Set new batched calculation
    const timeout = setTimeout(() => {
      if (!this.calculationQueue.has(key)) {
        this.calculationQueue.add(key);
        
        // Use requestAnimationFrame for smooth performance
        requestAnimationFrame(() => {
          calculation();
          this.calculationQueue.delete(key);
          this.batchedCalculations.delete(key);
        });
      }
    }, delay);
    
    this.batchedCalculations.set(key, timeout);
  }

  /**
   * Throttle high-frequency calculations
   */
  public throttle<T extends (...args: any[]) => any>(
    func: T,
    wait: number = this.CALCULATION_THROTTLE
  ): T {
    let timeout: NodeJS.Timeout | null = null;
    let previous = 0;
    
    return ((...args: Parameters<T>) => {
      const now = Date.now();
      const remaining = wait - (now - previous);
      
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        return func.apply(this, args);
      } else if (!timeout) {
        timeout = setTimeout(() => {
          previous = Date.now();
          timeout = null;
          return func.apply(this, args);
        }, remaining);
      }
    }) as T;
  }

  /**
   * Debounce calculations to prevent spam
   */
  public debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate: boolean = false
  ): T {
    let timeout: NodeJS.Timeout | null = null;
    
    return ((...args: Parameters<T>) => {
      const callNow = immediate && !timeout;
      
      if (timeout) clearTimeout(timeout);
      
      timeout = setTimeout(() => {
        timeout = null;
        if (!immediate) func.apply(this, args);
      }, wait);
      
      if (callNow) func.apply(this, args);
    }) as T;
  }

  /**
   * Intelligent cache invalidation
   */
  public invalidateCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    const regex = new RegExp(pattern);
    for (const [key] of this.cache) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics for monitoring
   */
  public getCacheStats() {
    const totalEntries = this.cache.size;
    let totalHits = 0;
    let avgAge = 0;
    const now = Date.now();
    
    for (const [_, entry] of this.cache) {
      totalHits += entry.hitCount;
      avgAge += (now - entry.timestamp);
    }
    
    return {
      totalEntries,
      totalHits,
      avgAge: totalEntries > 0 ? avgAge / totalEntries : 0,
      hitRate: this.performanceMetrics.cacheHitRate,
      memoryEstimate: totalEntries * 1024 // Rough estimate
    };
  }

  /**
   * Performance monitoring and optimization
   */
  public getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Optimize memory usage
   */
  public optimizeMemory(): void {
    // Force garbage collection if available
    if (typeof window !== 'undefined' && (window as any).gc) {
      (window as any).gc();
    }
    
    // Clean up old cache entries
    this.cleanupCache(true);
    
    // Clear redundant calculations
    this.calculationQueue.clear();
    for (const timeout of this.batchedCalculations.values()) {
      clearTimeout(timeout);
    }
    this.batchedCalculations.clear();
  }

  /**
   * Prevent memory leaks with intelligent cleanup
   */
  private cleanupCache(force: boolean = false): void {
    const now = Date.now();
    
    // Only cleanup every 30 seconds unless forced
    if (!force && (now - this.lastCleanup) < 30000) {
      return;
    }
    
    this.lastCleanup = now;
    
    // Remove expired entries
    for (const [key, entry] of this.cache) {
      if ((now - entry.timestamp) > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
    
    // If cache is still too large, remove least recently used
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      const sortedEntries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].lastAccess - b[1].lastAccess);
      
      const toRemove = sortedEntries.slice(0, this.cache.size - this.MAX_CACHE_SIZE);
      for (const [key] of toRemove) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(calculationTime: number): void {
    this.calculationCount++;
    const now = Date.now();
    const timeElapsed = (now - this.startTime) / 1000;
    
    this.performanceMetrics.calculationsPerSecond = this.calculationCount / timeElapsed;
    this.performanceMetrics.avgCalculationTime = 
      (this.performanceMetrics.avgCalculationTime + calculationTime) / 2;
    
    // Calculate cache hit rate
    const totalCacheAccesses = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.hitCount, 0);
    this.performanceMetrics.cacheHitRate = 
      totalCacheAccesses / Math.max(1, totalCacheAccesses + this.calculationCount);
    
    this.performanceMetrics.memoryUsage = this.cache.size;
  }

  /**
   * Smart prediction for when to precompute
   */
  public shouldPrecompute(key: string, priority: 'low' | 'medium' | 'high' = 'medium'): boolean {
    const cached = this.cache.get(key);
    const now = Date.now();
    
    // Always precompute high priority
    if (priority === 'high') return true;
    
    // Don't precompute if recently calculated
    if (cached && (now - cached.timestamp) < 5000) return false;
    
    // Precompute if frequently accessed
    if (cached && cached.hitCount > 3) return true;
    
    // Don't precompute low priority if system is busy
    if (priority === 'low' && this.performanceMetrics.calculationsPerSecond > 30) {
      return false;
    }
    
    return priority === 'medium';
  }

  /**
   * Ultra-fast processing for bulk operations (supports async)
   */
  public async batchOperation<T, R>(
    items: T[],
    operation: (batch: T[]) => R[] | Promise<R[]>,
    batchSize: number = 1000 // Much larger batches for speed
  ): Promise<R[]> {
    // For small arrays, process all at once for maximum speed
    if (items.length <= batchSize) {
      return await operation(items);
    }
    
    // For larger arrays, use minimal batching
    const results: R[] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await operation(batch);
      results.push(...batchResults);
    }
    
    return results;
  }
}

// Export singleton instance
export const aiPerformanceOptimizer = AIPerformanceOptimizer.getInstance();
export default aiPerformanceOptimizer;