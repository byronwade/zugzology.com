'use client';

import React from 'react';
import { Link } from '@/components/ui/link';
import Image from 'next/image';
import { usePrefetchImages } from '@/lib/utils/image-prefetcher';
import { usePredictivePrefetching } from '@/lib/utils/predictive-prefetcher';

const DEMO_PRODUCTS = [
  {
    id: 1,
    title: "Premium Mushroom Growing Kit",
    price: "$29.99",
    image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png",
    href: "/products/mushroom-kit-1"
  },
  {
    id: 2,
    title: "Organic Substrate Blend",
    price: "$19.99", 
    image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-2_large.png",
    href: "/products/substrate-blend"
  },
  {
    id: 3,
    title: "Professional Grow Bags",
    price: "$24.99",
    image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-3_large.png", 
    href: "/products/grow-bags"
  },
  {
    id: 4,
    title: "Temperature Control System",
    price: "$89.99",
    image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-4_large.png",
    href: "/products/temp-control"
  }
];

export function PrefetchDemo() {
  const { prefetchImage, prefetchImages } = usePrefetchImages();
  const { trackHover, trackClick } = usePredictivePrefetching();

  const handleProductHover = (product: typeof DEMO_PRODUCTS[0]) => {
    // Prefetch the product image
    prefetchImage(product.image, 'low');
    
    // Track hover for predictive AI
    trackHover(product.href);
    
    // Prefetch related images
    const relatedImages = DEMO_PRODUCTS
      .filter(p => p.id !== product.id)
      .slice(0, 2)
      .map(p => p.image);
    
    prefetchImages(relatedImages, 'low');
  };

  const handleProductClick = (product: typeof DEMO_PRODUCTS[0]) => {
    trackClick(product.href);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Performance Demo</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Hover over the product cards below to see the prefetch system in action. 
          Check the Prefetch Monitor (bottom-right) and Performance Dashboard (top-right) 
          to see real-time metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {DEMO_PRODUCTS.map((product) => (
          <Link
            key={product.id}
            href={product.href}
            className="group block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
            onMouseEnter={() => handleProductHover(product)}
            onClick={() => handleProductClick(product)}
          >
            <div className="aspect-square bg-gray-100 relative overflow-hidden">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {product.title}
              </h3>
              <p className="text-lg font-bold text-blue-600">
                {product.price}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">🚀 Performance Features Active:</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• <strong>Image Prefetching:</strong> Hover to preload images instantly</li>
          <li>• <strong>Predictive AI:</strong> Learning your browsing patterns</li>
          <li>• <strong>Connection Aware:</strong> Adapting to your network speed</li>
          <li>• <strong>Service Worker:</strong> Background caching for lightning speed</li>
          <li>• <strong>Bundle Optimization:</strong> Intelligent code splitting</li>
        </ul>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={() => {
            // Prefetch all demo images at once
            const allImages = DEMO_PRODUCTS.map(p => p.image);
            prefetchImages(allImages, 'high');
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Prefetch All Images
        </button>
      </div>
    </div>
  );
}