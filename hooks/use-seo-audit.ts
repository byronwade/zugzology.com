"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { globalSEOAudit } from '@/lib/seo/page-audit-system';

/**
 * Hook to automatically audit pages as they load
 */
export function useSEOAudit(pageType: string, enabled: boolean = true) {
  const pathname = usePathname();

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Delay audit to ensure page is fully loaded
    const timer = setTimeout(() => {
      try {
        globalSEOAudit.auditPage(pathname, pageType, document);
        
        // Log audit in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔍 SEO Audit completed for ${pathname} (${pageType})`);
        }
      } catch (error) {
        console.error('SEO Audit failed:', error);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [pathname, pageType, enabled]);
}

/**
 * Hook to get current audit status
 */
export function useAuditStatus(path?: string) {
  const pathname = usePathname();
  const targetPath = path || pathname;

  const getAuditResult = () => {
    return globalSEOAudit['auditResults']?.get(targetPath);
  };

  return {
    auditResult: getAuditResult(),
    hasBeenAudited: !!getAuditResult(),
  };
}

/**
 * Development helper to show audit overlay
 */
export function useDevAuditOverlay() {
  const pathname = usePathname();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const showOverlay = () => {
      const result = globalSEOAudit['auditResults']?.get(pathname);
      if (!result) return;

      // Create floating audit indicator
      const existing = document.getElementById('seo-audit-indicator');
      if (existing) existing.remove();

      const indicator = document.createElement('div');
      indicator.id = 'seo-audit-indicator';
      indicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        background: ${result.score >= 90 ? '#22c55e' : result.score >= 70 ? '#eab308' : '#ef4444'};
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.3s;
        opacity: 0.9;
      `;
      indicator.textContent = `SEO: ${result.score}%`;
      
      indicator.onclick = () => {
        console.group(`🔍 SEO Audit: ${pathname}`);
        console.log('Score:', result.score + '%');
        console.log('Issues:', result.issues);
        console.log('Recommendations:', result.recommendations);
        console.groupEnd();
      };

      // Auto-hide after 5 seconds
      setTimeout(() => {
        indicator.style.opacity = '0.3';
      }, 5000);

      document.body.appendChild(indicator);
    };

    const timer = setTimeout(showOverlay, 3000);
    return () => clearTimeout(timer);
  }, [pathname]);
}