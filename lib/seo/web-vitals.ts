import { onCLS, onFCP, onFID, onINP, onLCP, onTTFB, Metric } from 'web-vitals';

interface VitalsData {
  metric: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationType: string;
  url: string;
  userAgent: string;
  timestamp: number;
}

/**
 * Get rating based on Web Vitals thresholds
 */
function getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, { good: number; poor: number }> = {
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    FID: { good: 100, poor: 300 },
    INP: { good: 200, poor: 500 },
    LCP: { good: 2500, poor: 4000 },
    TTFB: { good: 800, poor: 1800 },
  };
  
  const threshold = thresholds[metric];
  if (!threshold) return 'needs-improvement';
  
  if (value <= threshold.good) return 'good';
  if (value > threshold.poor) return 'poor';
  return 'needs-improvement';
}

/**
 * Send analytics data to your analytics endpoint
 */
async function sendToAnalytics(data: VitalsData) {
  // Send to Google Analytics 4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'web_vitals', {
      event_category: 'Web Vitals',
      event_label: data.metric,
      value: Math.round(data.metric === 'CLS' ? data.value * 1000 : data.value),
      metric_rating: data.rating,
      non_interaction: true,
    });
  }
  
  // Send to custom analytics endpoint
  try {
    await fetch('/api/analytics/vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Failed to send vitals data:', error);
  }
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${data.metric}:`, {
      value: data.value,
      rating: data.rating,
    });
  }
}

/**
 * Handle metric reporting
 */
function handleMetric(metric: Metric) {
  const data: VitalsData = {
    metric: metric.name,
    value: metric.value,
    rating: getRating(metric.name, metric.value),
    navigationType: metric.navigationType || 'unknown',
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
  };
  
  sendToAnalytics(data);
}

/**
 * Initialize Web Vitals tracking
 */
export function initWebVitals() {
  if (typeof window === 'undefined') return;
  
  // Core Web Vitals
  onCLS(handleMetric);   // Cumulative Layout Shift
  onFID(handleMetric);   // First Input Delay (deprecated, use INP)
  onINP(handleMetric);   // Interaction to Next Paint
  onLCP(handleMetric);   // Largest Contentful Paint
  
  // Other vitals
  onFCP(handleMetric);   // First Contentful Paint
  onTTFB(handleMetric);  // Time to First Byte
}

/**
 * Get current performance metrics
 */
export function getPerformanceMetrics() {
  if (typeof window === 'undefined' || !window.performance) {
    return null;
  }
  
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');
  
  const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
  const fp = paint.find(entry => entry.name === 'first-paint');
  
  return {
    // Navigation timing
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcp: navigation.connectEnd - navigation.connectStart,
    ttfb: navigation.responseStart - navigation.requestStart,
    download: navigation.responseEnd - navigation.responseStart,
    domInteractive: navigation.domInteractive - navigation.fetchStart,
    domComplete: navigation.domComplete - navigation.fetchStart,
    loadComplete: navigation.loadEventEnd - navigation.fetchStart,
    
    // Paint timing
    firstPaint: fp?.startTime || 0,
    firstContentfulPaint: fcp?.startTime || 0,
    
    // Resource timing
    resources: performance.getEntriesByType('resource').length,
    
    // Memory (if available)
    memory: (performance as any).memory ? {
      used: (performance as any).memory.usedJSHeapSize,
      total: (performance as any).memory.totalJSHeapSize,
      limit: (performance as any).memory.jsHeapSizeLimit,
    } : null,
  };
}

/**
 * Performance observer for long tasks
 */
export function observeLongTasks(callback: (duration: number) => void) {
  if (typeof window === 'undefined' || !window.PerformanceObserver) {
    return;
  }
  
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          callback(entry.duration);
        }
      }
    });
    
    observer.observe({ entryTypes: ['longtask'] });
    
    return () => observer.disconnect();
  } catch (error) {
    console.error('Failed to observe long tasks:', error);
  }
}

/**
 * Measure custom timing
 */
export function measureTiming(markName: string) {
  if (typeof window === 'undefined' || !window.performance) {
    return;
  }
  
  const startMark = `${markName}:start`;
  const endMark = `${markName}:end`;
  const measureName = `${markName}:duration`;
  
  return {
    start() {
      performance.mark(startMark);
    },
    end() {
      performance.mark(endMark);
      performance.measure(measureName, startMark, endMark);
      
      const measures = performance.getEntriesByName(measureName);
      const duration = measures[measures.length - 1]?.duration || 0;
      
      // Clean up marks
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(measureName);
      
      return duration;
    },
  };
}

// Extend window interface
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}