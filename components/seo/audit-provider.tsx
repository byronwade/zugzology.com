"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { globalSEOAudit, SEOAuditReport, PageAuditResult } from '@/lib/seo/page-audit-system';

interface AuditContextType {
  currentPageAudit: PageAuditResult | null;
  globalReport: SEOAuditReport | null;
  isAuditing: boolean;
  auditPage: (pageType: string) => void;
}

const AuditContext = createContext<AuditContextType | null>(null);

export function useAuditContext() {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error('useAuditContext must be used within an AuditProvider');
  }
  return context;
}

interface AuditProviderProps {
  children: React.ReactNode;
}

export function AuditProvider({ children }: AuditProviderProps) {
  const pathname = usePathname();
  const [currentPageAudit, setCurrentPageAudit] = useState<PageAuditResult | null>(null);
  const [globalReport, setGlobalReport] = useState<SEOAuditReport | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const auditPage = async (pageType: string) => {
    if (typeof window === 'undefined') return;

    setIsAuditing(true);
    
    try {
      // Wait for page to be fully loaded
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = globalSEOAudit.auditPage(pathname, pageType, document);
      setCurrentPageAudit(result);
      
      // Update global report
      const report = globalSEOAudit.generateReport();
      setGlobalReport(report);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 SEO Audit: ${pathname} - Score: ${result.score}%`);
      }
    } catch (error) {
      console.error('SEO Audit failed:', error);
    } finally {
      setIsAuditing(false);
    }
  };

  // Auto-audit pages in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Detect page type from pathname
      const pageType = detectPageType(pathname);
      auditPage(pageType);
    }
  }, [pathname]);

  const value: AuditContextType = {
    currentPageAudit,
    globalReport,
    isAuditing,
    auditPage,
  };

  return (
    <AuditContext.Provider value={value}>
      {children}
    </AuditContext.Provider>
  );
}

function detectPageType(pathname: string): string {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/products/') && !pathname.includes('/collections/')) return 'product';
  if (pathname.startsWith('/collections/')) return 'collection';
  if (pathname.startsWith('/blogs/') && pathname.split('/').length === 4) return 'blog-post';
  if (pathname.startsWith('/blogs/') && pathname.split('/').length === 3) return 'blog-category';
  if (pathname === '/blogs') return 'blog-listing';
  if (pathname.startsWith('/search')) return 'search';
  if (pathname === '/cart') return 'cart';
  if (pathname === '/wishlist') return 'wishlist';
  if (pathname.startsWith('/account')) return 'account';
  if (pathname === '/login') return 'auth';
  if (pathname === '/register') return 'auth';
  if (pathname === '/help') return 'help';
  if (pathname === '/loading') return 'loading';
  if (pathname === '/error') return 'error';
  if (pathname === '/not-found') return 'not-found';
  
  return 'page';
}
