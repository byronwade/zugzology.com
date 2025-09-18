'use client';

import React from 'react';
import { imagePrefetcher } from '@/lib/utils/image-prefetcher';

const TEST_IMAGES = [
  'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png',
  'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-2_large.png',
  'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-3_large.png'
];

export function SimplePrefetchTest() {
  const [status, setStatus] = React.useState('Ready to test...');
  const [stats, setStats] = React.useState({ cached: 0, active: 0, queued: 0 });

  React.useEffect(() => {
    // Update stats every second
    const interval = setInterval(() => {
      const currentStats = imagePrefetcher.getCacheStatus();
      setStats(currentStats);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const testSinglePrefetch = async () => {
    setStatus('Testing single image prefetch...');
    console.log('=== STARTING SINGLE PREFETCH TEST ===');
    
    try {
      await imagePrefetcher.prefetchImage(TEST_IMAGES[0], { priority: 'high' });
      setStatus('Single prefetch completed!');
      console.log('=== SINGLE PREFETCH COMPLETED ===');
    } catch (error) {
      setStatus(`Single prefetch failed: ${error}`);
      console.error('=== SINGLE PREFETCH FAILED ===', error);
    }
  };

  const testMultiplePrefetch = async () => {
    setStatus('Testing multiple image prefetch...');
    console.log('=== STARTING MULTIPLE PREFETCH TEST ===');
    
    try {
      await imagePrefetcher.prefetchImages(TEST_IMAGES, { priority: 'low' });
      setStatus('Multiple prefetch completed!');
      console.log('=== MULTIPLE PREFETCH COMPLETED ===');
    } catch (error) {
      setStatus(`Multiple prefetch failed: ${error}`);
      console.error('=== MULTIPLE PREFETCH FAILED ===', error);
    }
  };

  const clearCache = () => {
    imagePrefetcher.clearCache();
    setStatus('Cache cleared!');
    console.log('=== CACHE CLEARED ===');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold mb-4">🧪 Prefetch System Test</h2>
        
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Current Stats:</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-green-50 p-3 rounded">
              <div className="font-bold text-green-600">{stats.cached}</div>
              <div className="text-green-700">Cached</div>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <div className="font-bold text-blue-600">{stats.active}</div>
              <div className="text-blue-700">Active</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded">
              <div className="font-bold text-yellow-600">{stats.queued}</div>
              <div className="text-yellow-700">Queued</div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Status:</h3>
          <div className="bg-gray-50 p-3 rounded text-sm">{status}</div>
        </div>

        <div className="space-y-3">
          <button
            onClick={testSinglePrefetch}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Test Single Image Prefetch
          </button>
          
          <button
            onClick={testMultiplePrefetch}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
          >
            Test Multiple Images Prefetch
          </button>
          
          <button
            onClick={clearCache}
            className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
          >
            Clear Cache
          </button>
        </div>

        <div className="mt-6 text-xs text-gray-600">
          <p>📝 <strong>Instructions:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Open browser DevTools Console to see debug logs</li>
            <li>Click buttons to test prefetching functionality</li>
            <li>Watch the stats update in real-time</li>
            <li>Check Network tab to see actual requests</li>
          </ul>
        </div>
      </div>
    </div>
  );
}