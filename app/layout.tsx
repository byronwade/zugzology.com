import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/layout/header/header";
import { Providers } from "./providers";
import { Footer } from "@/components/layout/footer";
import { Suspense } from "react";
import { cn } from "@/lib/utils";
import { fontSans } from "@/lib/fonts";
import { WithContext, Organization } from "schema-dts";
import { ScrollToTop } from "@/components/scroll-to-top";
import { generateHomeMetadata, generateStoreStructuredData } from "@/lib/config/dynamic-metadata";
import { getStoreConfigSafe } from "@/lib/config/store-config";
import { loadStoreConfiguration } from "@/lib/config/store-data-loader";
import { PerformanceDashboard } from "@/components/debug/performance-dashboard";
import { ServiceWorkerRegister } from "@/components/utils/service-worker-register";
import AICustodySupport from "@/components/ai/ai-customer-support";
import BehaviorTrackingProvider from "@/components/providers/behavior-tracking-provider";
import { AIDebugPanel } from "@/components/debug/ai-debug-panel";
import AISystemLogger from "@/components/debug/ai-system-logger";
import { AuditProvider, DevAuditTrigger } from "@/components/seo/audit-provider";
import { ShopifyDataProvider } from "@/components/providers/shopify-data-provider";

// Loading components
function HeaderLoading() {
	return <div className="w-full h-16 bg-background animate-pulse" />;
}

function FooterLoading() {
	return <div className="w-full h-64 bg-background animate-pulse" />;
}

// Generate dynamic metadata based on store configuration
export async function generateMetadata(): Promise<Metadata> {
	await loadStoreConfiguration();
	return generateHomeMetadata();
}


export default async function RootLayout({ children }: { children: React.ReactNode }) {
	await loadStoreConfiguration();
	// Get store configuration for dynamic structured data
	const storeConfig = getStoreConfigSafe();
	const structuredData = generateStoreStructuredData();

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "Organization",
							name: storeConfig.storeName,
							url: `https://${storeConfig.storeDomain}`,
							logo: storeConfig.branding.logoUrl || `https://${storeConfig.storeDomain}/logo.png`,
							description: storeConfig.storeDescription,
							sameAs: storeConfig.seo.socialMediaLinks || [],
						})
					}}
				/>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
				/>
				<link rel="preconnect" href="https://cdn.shopify.com" />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
			</head>
			<body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
				<Providers>
					<AuditProvider enableDevOverlay={process.env.NODE_ENV === 'development'}>
						<ShopifyDataProvider>
							<BehaviorTrackingProvider>
								<div className="relative flex min-h-screen flex-col">
									<Suspense fallback={<HeaderLoading />}>
										<Header />
									</Suspense>
									<main className="flex-1">{children}</main>
									<Suspense fallback={<FooterLoading />}>
										<Footer />
									</Suspense>
								</div>
								<ScrollToTop />
								<AICustodySupport />
								{process.env.NODE_ENV === 'development' && (
									<>
										<AIDebugPanel />
										<AISystemLogger />
										<PerformanceDashboard position="bottom-right" />
									</>
								)}
								<ServiceWorkerRegister />
								<DevAuditTrigger />
							</BehaviorTrackingProvider>
						</ShopifyDataProvider>
					</AuditProvider>
				</Providers>
			</body>
		</html>
	);
}
