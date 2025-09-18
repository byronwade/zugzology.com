'use client';

import React, { useState, useEffect } from 'react';
import { usePrefetchPerformance } from '@/components/providers/prefetch-provider';
import { imagePrefetcher } from '@/lib/utils/image-prefetcher';

interface PrefetchMonitorProps {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * Development tool to monitor prefetch performance
 * Shows real-time stats about image prefetching
 */
export function PrefetchMonitor({ 
  enabled = process.env.NODE_ENV === 'development',
  position = 'bottom-right'
}: PrefetchMonitorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState({ cached: 0, active: 0, queued: 0 });
  const [requestLog, setRequestLog] = useState<Array<{ url: string; time: number; status: 'pending' | 'success' | 'error' }>>([]);

  useEffect(() => {
    if (!enabled) return;

    const updateStats = () => {
      const status = imagePrefetcher.getCacheStatus();
      setStats(status);
    };

    const interval = setInterval(updateStats, 1000);
    updateStats(); // Initial update

    return () => clearInterval(interval);
  }, [enabled]);

  if (!enabled) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="mb-2 rounded-full bg-blue-600 p-2 text-white shadow-lg hover:bg-blue-700 transition-colors"
        title="Toggle Prefetch Monitor"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 3C13 2.44772 12.5523 2 12 2C11.4477 2 11 2.44772 11 3V11H3C2.44772 11 2 11.4477 2 12C2 12.5523 2.44772 13 3 13H11V21C11 21.5523 11.4477 22 12 22C12.5523 22 13 21.5523 13 21V13H21C21.5523 13 22 12.5523 22 12C22 11.4477 21.5523 11 21 11H13V3Z"/>
        </svg>
      </button>

      {/* Monitor Panel */}
      {isVisible && (
        <div className="w-80 rounded-lg bg-white border shadow-xl p-4 text-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Prefetch Monitor</h3>
            <button
              onClick={() => {
                imagePrefetcher.clearCache();
                setRequestLog([]);
              }}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Clear Cache
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-green-50 rounded p-2 text-center">
              <div className="text-lg font-bold text-green-600">{stats.cached}</div>
              <div className="text-xs text-green-700">Cached</div>
            </div>
            <div className="bg-blue-50 rounded p-2 text-center">
              <div className="text-lg font-bold text-blue-600">{stats.active}</div>
              <div className="text-xs text-blue-700">Active</div>
            </div>
            <div className="bg-yellow-50 rounded p-2 text-center">
              <div className="text-lg font-bold text-yellow-600">{stats.queued}</div>
              <div className="text-xs text-yellow-700">Queued</div>
            </div>
          </div>

          {/* Request Log */}
          <div className="border-t pt-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-700">Recent Requests</h4>
              <span className="text-xs text-gray-500">{requestLog.length}</span>
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {requestLog.length === 0 ? (
                <div className="text-xs text-gray-500 text-center py-2">
                  No prefetch requests yet
                </div>
              ) : (
                requestLog.slice(-5).reverse().map((request, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${
                      request.status === 'success' ? 'bg-green-400' :
                      request.status === 'error' ? 'bg-red-400' : 'bg-yellow-400'
                    }`} />
                    <div className="flex-1 truncate" title={request.url}>
                      {request.url.split('/').pop() || request.url}
                    </div>
                    <div className="text-gray-500">
                      {request.time}ms
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Performance Tips */}
          <div className="border-t pt-3 mt-3">
            <h4 className="font-medium text-gray-700 mb-2">Tips</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Hover over links to trigger prefetching</li>
              <li>• Green = Images successfully cached</li>
              <li>• Blue = Currently downloading</li>
              <li>• Yellow = Waiting in queue</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Simple prefetch status indicator for production
 */
export function PrefetchIndicator() {
  const [stats, setStats] = useState({ cached: 0, active: 0 });

  useEffect(() => {
    const updateStats = () => {
      const status = imagePrefetcher.getCacheStatus();
      setStats({ cached: status.cached, active: status.active });
    };

    const interval = setInterval(updateStats, 2000);
    updateStats();

    return () => clearInterval(interval);
  }, []);

  if (stats.cached === 0 && stats.active === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <div className="bg-black/80 text-white text-xs rounded-full px-3 py-1 flex items-center gap-2">
        {stats.active > 0 && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span>{stats.active}</span>
          </div>
        )}
        {stats.cached > 0 && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span>{stats.cached}</span>
          </div>
        )}
      </div>
    </div>
  );
}