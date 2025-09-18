/**
 * Dynamic Layout Component
 * 
 * This component handles dynamic store configuration loading and provides
 * a fallback while the store data is being fetched.
 */

import { Suspense } from "react";
import { loadStoreConfiguration } from "@/lib/config/store-data-loader";
import { generateHomeMetadata, generateStoreStructuredData } from "@/lib/config/dynamic-metadata";

interface DynamicLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout content that uses store configuration
 */
async function LayoutContent({ children }: DynamicLayoutProps) {
  // Load store configuration from Shopify
  await loadStoreConfiguration();
  
  // Generate structured data
  const storeStructuredData = generateStoreStructuredData();
  
  return (
    <>
      {/* Store structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(storeStructuredData),
        }}
      />
      {children}
    </>
  );
}

/**
 * Dynamic layout with store configuration loading
 */
export default function DynamicLayout({ children }: DynamicLayoutProps) {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading store...</p>
          </div>
        </div>
      }
    >
      <LayoutContent>{children}</LayoutContent>
    </Suspense>
  );
}