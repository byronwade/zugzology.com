'use client';

import React, { useState, useEffect } from 'react';
import { usePrefetchPerformance } from '@/components/providers/prefetch-provider';
import { useServiceWorker } from '@/lib/utils/service-worker-manager';
import { useConnectionAware } from '@/lib/utils/connection-manager';
import { usePredictivePrefetching } from '@/lib/utils/predictive-prefetcher';

interface PerformanceDashboardProps {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  compact?: boolean;
}

/**
 * Comprehensive performance monitoring dashboard
 * Shows real-time metrics for all optimization systems
 */
export function PerformanceDashboard({ 
  enabled = process.env.NODE_ENV === 'development',
  position = 'top-right',
  compact = false
}: PerformanceDashboardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'prefetch' | 'sw' | 'connection' | 'predictive'>('prefetch');
  
  // Hook into all performance systems
  const prefetchMetrics = usePrefetchPerformance();
  const { metrics: swMetrics, status: swStatus } = useServiceWorker();
  const { settings: connectionSettings, getPerformanceMetrics } = useConnectionAware();
  const { metrics: predictiveMetrics } = usePredictivePrefetching();

  // Web Vitals tracking
  const [webVitals, setWebVitals] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!enabled) return;

    // Track Core Web Vitals
    const trackWebVitals = async () => {
      try {
        const { onCLS, onINP, onFCP, onLCP, onTTFB } = await import('web-vitals');
        
        onCLS((metric) => setWebVitals(prev => ({ ...prev, CLS: metric.value })));
        onINP((metric) => setWebVitals(prev => ({ ...prev, INP: metric.value }))); // INP replaces FID in v5
        onFCP((metric) => setWebVitals(prev => ({ ...prev, FCP: metric.value })));
        onLCP((metric) => setWebVitals(prev => ({ ...prev, LCP: metric.value })));
        onTTFB((metric) => setWebVitals(prev => ({ ...prev, TTFB: metric.value })));
      } catch (error) {
        console.warn('Web Vitals not available:', error);
      }
    };

    trackWebVitals();
  }, [enabled]);

  if (!enabled) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const tabs = [
    { id: 'prefetch', label: 'Prefetch', icon: '🚀' },
    { id: 'sw', label: 'SW', icon: '⚡' },
    { id: 'connection', label: 'Network', icon: '🌐' },
    { id: 'predictive', label: 'AI', icon: '🧠' },
  ];

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="mb-2 rounded-full bg-blue-600 p-2 text-white shadow-lg hover:bg-blue-700 transition-colors relative"
        title="Performance Dashboard"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        
        {/* Status indicator */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
      </button>

      {/* Dashboard Panel */}
      {isVisible && (
        <div className={`${compact ? 'w-72' : 'w-96'} rounded-lg bg-white border shadow-2xl text-sm`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
            <h3 className="font-semibold text-gray-900">Performance Monitor</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex-1 px-3 py-2 text-xs font-medium border-r last:border-r-0 ${
                  selectedTab === tab.id
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {selectedTab === 'prefetch' && <PrefetchTab metrics={prefetchMetrics} />}
            {selectedTab === 'sw' && <ServiceWorkerTab metrics={swMetrics} status={swStatus} />}
            {selectedTab === 'connection' && <ConnectionTab settings={connectionSettings} />}
            {selectedTab === 'predictive' && <PredictiveTab metrics={predictiveMetrics} />}
          </div>

          {/* Web Vitals Footer */}
          <div className="border-t p-3 bg-gray-50 rounded-b-lg">
            <div className="text-xs text-gray-600 mb-2">Core Web Vitals</div>
            <div className="grid grid-cols-5 gap-2 text-xs">
              {Object.entries(webVitals).map(([metric, value]) => (
                <div key={metric} className="text-center">
                  <div className="font-semibold text-gray-900">{metric}</div>
                  <div className={`${getVitalColor(metric, value)}`}>
                    {formatVital(metric, value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PrefetchTab({ metrics }: { metrics: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <MetricCard
          label="Cached"
          value={metrics.totalPrefetched}
          color="green"
          icon="💾"
        />
        <MetricCard
          label="Cache Hits"
          value={metrics.cacheHits}
          color="blue"
          icon="🎯"
        />
        <MetricCard
          label="Avg Time"
          value={`${metrics.avgPrefetchTime}ms`}
          color="purple"
          icon="⏱️"
        />
      </div>
      
      <div>
        <div className="text-xs font-medium text-gray-700 mb-2">Recent Activity</div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          <div className="text-xs text-gray-600">• Product images prefetched: 12</div>
          <div className="text-xs text-gray-600">• Collection data cached: 3</div>
          <div className="text-xs text-gray-600">• Route prefetches: 5</div>
        </div>
      </div>
    </div>
  );
}

function ServiceWorkerTab({ metrics, status }: { metrics: any; status: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-green-400' : 'bg-red-400'}`} />
        <span className="text-xs font-medium capitalize">{status}</span>
      </div>

      {metrics && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              label="Cache Hits"
              value={metrics.cacheHits}
              color="green"
              icon="✅"
            />
            <MetricCard
              label="Network"
              value={metrics.networkRequests}
              color="orange"
              icon="🌐"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              label="Prefetched"
              value={metrics.prefetchedResources}
              color="blue"
              icon="⬇️"
            />
            <MetricCard
              label="Avg Response"
              value={`${Math.round(metrics.averageResponseTime)}ms`}
              color="purple"
              icon="⚡"
            />
          </div>
        </>
      )}
    </div>
  );
}

function ConnectionTab({ settings }: { settings: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Type"
          value={settings.format?.toUpperCase()}
          color="blue"
          icon="📷"
        />
        <MetricCard
          label="Quality"
          value={settings.quality?.charAt(0).toUpperCase() + settings.quality?.slice(1)}
          color="green"
          icon="🎨"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Max Concurrent</span>
          <span className="font-medium">{settings.maxConcurrentRequests}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Prefetch Delay</span>
          <span className="font-medium">{settings.prefetchDelay}ms</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Max Image Size</span>
          <span className="font-medium">{formatBytes(settings.maxImageSize)}</span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-xs font-medium text-gray-700">Features</div>
        <div className="flex flex-wrap gap-1">
          {settings.enablePrefetch && <Tag color="green">Prefetch</Tag>}
          {settings.enableIntersectionPrefetch && <Tag color="blue">Viewport</Tag>}
          {settings.enableIdlePrefetch && <Tag color="purple">Idle</Tag>}
        </div>
      </div>
    </div>
  );
}

function PredictiveTab({ metrics }: { metrics: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Actions"
          value={metrics.actionsCount}
          color="blue"
          icon="👆"
        />
        <MetricCard
          label="Predictions"
          value={metrics.currentPredictions?.length || 0}
          color="purple"
          icon="🔮"
        />
      </div>

      <div>
        <div className="text-xs font-medium text-gray-700 mb-2">Top Predictions</div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {metrics.currentPredictions?.slice(0, 3).map((pred: any, i: number) => (
            <div key={i} className="flex justify-between text-xs">
              <span className="text-gray-600 truncate">{pred.path}</span>
              <span className="font-medium text-green-600">
                {Math.round(pred.confidence * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Transitions</span>
          <span className="font-medium">{metrics.transitionsCount}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Patterns</span>
          <span className="font-medium">{metrics.patternsCount}</span>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, color, icon }: {
  label: string;
  value: string | number;
  color: 'green' | 'blue' | 'purple' | 'orange';
  icon: string;
}) {
  const colorClasses = {
    green: 'bg-green-50 text-green-700 border-green-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
  };

  return (
    <div className={`p-2 rounded border ${colorClasses[color]}`}>
      <div className="flex items-center gap-1 mb-1">
        <span className="text-xs">{icon}</span>
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="text-sm font-bold">{value}</div>
    </div>
  );
}

function Tag({ color, children }: { color: 'green' | 'blue' | 'purple'; children: string }) {
  const colorClasses = {
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colorClasses[color]}`}>
      {children}
    </span>
  );
}

function getVitalColor(metric: string, value: number): string {
  const thresholds = {
    CLS: { good: 0.1, needs: 0.25 },
    FID: { good: 100, needs: 300 },
    FCP: { good: 1800, needs: 3000 },
    LCP: { good: 2500, needs: 4000 },
    TTFB: { good: 800, needs: 1800 },
  };

  const threshold = thresholds[metric as keyof typeof thresholds];
  if (!threshold) return 'text-gray-600';

  if (value <= threshold.good) return 'text-green-600';
  if (value <= threshold.needs) return 'text-yellow-600';
  return 'text-red-600';
}

function formatVital(metric: string, value: number): string {
  if (metric === 'CLS') return value.toFixed(3);
  return Math.round(value).toString();
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}