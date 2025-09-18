'use client';

import { useEffect } from 'react';

/**
 * Service Worker Registration Component
 * Registers the service worker on mount
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    // Only register in browser environment
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none'
        });
        
        console.log('[SW] Service Worker registered successfully:', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available
                console.log('[SW] New service worker available');
                // You could show a toast notification here
              }
            });
          }
        });
        
      } catch (error) {
        console.warn('[SW] Service Worker registration failed:', error);
      }
    };

    // Register with a small delay to not block initial page load
    const timeout = setTimeout(registerSW, 1000);
    
    return () => clearTimeout(timeout);
  }, []);

  return null; // This component doesn't render anything
}

export default ServiceWorkerRegister;