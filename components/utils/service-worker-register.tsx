'use client';

import { useEffect } from 'react';

/**
 * Service Worker Registration Component
 * Registers the service worker on mount
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const clearCaches = async () => {
      if (!('caches' in window)) return;
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key).catch(() => false)));
      } catch (error) {
        console.warn('[SW] Failed to clear caches', error);
      }
    };

    navigator.serviceWorker
      .getRegistrations()
      .then(async (registrations) => {
        if (registrations.length > 0) {
          await Promise.all(registrations.map((registration) => registration.unregister().catch(() => false)));
          await clearCaches();

          if (!localStorage.getItem('__sw_cleared')) {
            localStorage.setItem('__sw_cleared', '1');
            window.location.reload();
          }
        } else {
          localStorage.removeItem('__sw_cleared');
          await clearCaches();
        }
      })
      .catch(() => {});
  }, []);

  return null;
}

export default ServiceWorkerRegister;
