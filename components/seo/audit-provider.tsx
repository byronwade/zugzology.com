"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { globalSEOAudit, SEOAuditReport, PageAuditResult } from '@/lib/seo/page-audit-system';

interface AuditContextType {
  currentPageAudit: PageAuditResult | null;
  globalReport: SEOAuditReport | null;
  isAuditing: boolean;
  auditPage: (pageType: string) => void;
  generateReport: () => SEOAuditReport;
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
  enableDevOverlay?: boolean;
}

export function AuditProvider({ children, enableDevOverlay = true }: AuditProviderProps) {
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

  const generateReport = () => {
    const report = globalSEOAudit.generateReport();
    setGlobalReport(report);
    return report;
  };

  // Auto-audit pages in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Detect page type from pathname
      const pageType = detectPageType(pathname);
      auditPage(pageType);
    }
  }, [pathname]);

  // Development overlay
  useEffect(() => {
    if (!enableDevOverlay || process.env.NODE_ENV !== 'development' || !currentPageAudit) return;

    const showOverlay = () => {
      // Remove existing overlay
      const existing = document.getElementById('seo-audit-overlay');
      if (existing) existing.remove();

      // Create new overlay
      const overlay = document.createElement('div');
      overlay.id = 'seo-audit-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        background: linear-gradient(135deg, ${getScoreGradient(currentPageAudit.score)});
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: all 0.3s ease;
        opacity: 0.9;
        min-width: 120px;
        text-align: center;
      `;
      
      overlay.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; justify-content: center;">
          <span>🔍</span>
          <span>SEO: ${currentPageAudit.score}%</span>
        </div>
        <div style="font-size: 11px; opacity: 0.8; margin-top: 2px;">
          ${currentPageAudit.pageType}
        </div>
      `;
      
      overlay.onclick = () => {
        console.group(`🔍 SEO Audit Details: ${pathname}`);
        console.log('📊 Score:', currentPageAudit.score + '%');
        console.log('📄 Page Type:', currentPageAudit.pageType);
        console.log('✅ Criteria Met:', Object.entries(currentPageAudit.criteria).filter(([_, met]) => met).map(([key]) => key));
        console.log('❌ Issues:', currentPageAudit.issues);
        console.log('💡 Recommendations:', currentPageAudit.recommendations);
        console.log('🕒 Last Audited:', new Date(currentPageAudit.lastAudited).toLocaleString());
        console.groupEnd();
      };

      // Hover effects
      overlay.onmouseenter = () => {
        overlay.style.transform = 'scale(1.05)';
        overlay.style.opacity = '1';
      };
      
      overlay.onmouseleave = () => {
        overlay.style.transform = 'scale(1)';
        overlay.style.opacity = '0.9';
      };

      // Auto-fade after 10 seconds
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.style.opacity = '0.3';
        }
      }, 10000);

      document.body.appendChild(overlay);
    };

    // Delay to ensure audit is complete
    const timer = setTimeout(showOverlay, 1500);
    return () => clearTimeout(timer);
  }, [currentPageAudit, enableDevOverlay]);

  const value: AuditContextType = {
    currentPageAudit,
    globalReport,
    isAuditing,
    auditPage,
    generateReport,
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

function getScoreGradient(score: number): string {
  if (score >= 90) return '#22c55e, #16a34a';
  if (score >= 70) return '#eab308, #ca8a04';
  if (score >= 50) return '#f97316, #ea580c';
  return '#ef4444, #dc2626';
}

// Development helper component
export function DevAuditTrigger() {
  const { generateReport } = useAuditContext();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleGenerateReport = () => {
    const report = generateReport();
    console.group('📊 Full SEO Audit Report');
    console.log('Overall Score:', report.averageScore + '%');
    console.log('Total Pages:', report.totalPages);
    console.log('Summary:', report.summary);
    console.log('Critical Issues:', report.criticalIssues);
    console.log('Recommendations:', report.recommendations);
    console.table(report.pageResults.map(p => ({
      path: p.path,
      type: p.pageType,
      score: p.score + '%',
      issues: p.issues.length,
    })));
    console.groupEnd();
  };

  return (
    <button
      onClick={handleGenerateReport}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 10000,
        background: '#3b82f6',
        color: 'white',
        border: 'none',
        padding: '12px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
    >
      📊 Generate SEO Report
    </button>
  );
}