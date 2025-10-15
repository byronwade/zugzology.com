import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Footer, Header } from "@/components/layout";
import { AuditProvider } from "@/components/utilities/seo/audit-provider";
import { generateHomeMetadata, generateStoreStructuredData, generateViewport } from "@/lib/config/dynamic-metadata";
import { getStoreConfigSafe } from "@/lib/config/store-config";
import { loadStoreConfiguration } from "@/lib/config/store-data-loader";
import { fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";

// Loading components
function HeaderLoading() {
	return <div className="h-16 w-full animate-pulse bg-background" />;
}

function FooterLoading() {
	return <div className="h-64 w-full animate-pulse bg-background" />;
}

// Generate dynamic metadata based on store configuration
export async function generateMetadata(): Promise<Metadata> {
	await loadStoreConfiguration();
	return generateHomeMetadata();
}

// Generate viewport configuration
export const viewport: Viewport = generateViewport();

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	await loadStoreConfiguration();
	// Get store configuration for dynamic structured data
	const storeConfig = getStoreConfigSafe();
	const structuredData = generateStoreStructuredData();

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script
					dangerouslySetInnerHTML={{
						__html: `
							// Aggressive scroll reset
							(function() {
								// Disable browser scroll restoration
								if ('scrollRestoration' in history) {
									history.scrollRestoration = 'manual';
								}

								// Force instant scroll to top - no smooth behavior
								window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

								// Also set it immediately on DOMContentLoaded
								document.addEventListener('DOMContentLoaded', function() {
									window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
								});

								// And on page show (for back/forward navigation)
								window.addEventListener('pageshow', function() {
									window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
								});
							})();
						`,
					}}
				/>
				<script
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "Organization",
							name: storeConfig.storeName,
							url: `https://${storeConfig.storeDomain}`,
							logo: storeConfig.branding.logoUrl || `https://${storeConfig.storeDomain}/logo.png`,
							description: storeConfig.storeDescription,
							sameAs: [],
						}),
					}}
					type="application/ld+json"
				/>
				<script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} type="application/ld+json" />

				{/* Critical Resource Hints - DNS prefetch for third-party domains */}
				<link rel="dns-prefetch" href="https://cdn.shopify.com" />
				<link rel="dns-prefetch" href="https://fonts.googleapis.com" />
				<link rel="dns-prefetch" href="https://fonts.gstatic.com" />
				<link rel="dns-prefetch" href="https://bevgyjm5apuichhj.public.blob.vercel-storage.com" />

				{/* Preconnect to critical origins (DNS + TCP + TLS) */}
				<link rel="preconnect" href="https://cdn.shopify.com" crossOrigin="anonymous" />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link rel="preconnect" href="https://bevgyjm5apuichhj.public.blob.vercel-storage.com" crossOrigin="anonymous" />
			</head>
			<body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
				<Providers>
					<AuditProvider>
						<div className="relative flex min-h-screen flex-col">
							<Suspense fallback={<HeaderLoading />}>
								<Header />
							</Suspense>
							<main className="flex-1">{children}</main>
							<Suspense fallback={<FooterLoading />}>
								<Footer />
							</Suspense>
						</div>
					</AuditProvider>
				</Providers>
				<Analytics />
			</body>
		</html>
	);
}
