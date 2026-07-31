import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Footer, Header } from "@/components/layout";
import { ShopifyStatusBanner } from "@/components/layout/shopify-status-banner";
import { AuditProvider } from "@/components/utilities/seo/audit-provider";
import { generateHomeMetadata, generateStoreStructuredData, generateViewport } from "@/lib/config/dynamic-metadata";
import { getStoreConfigSafe } from "@/lib/config/store-config";
import { loadStoreConfiguration } from "@/lib/config/store-data-loader";
import { fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";

function HeaderLoading(): React.ReactElement {
	return <div className="h-16 w-full animate-pulse bg-background" />;
}

function FooterLoading(): React.ReactElement {
	return <div className="h-64 w-full animate-pulse bg-background" />;
}

function BannerLoading(): React.ReactElement {
	return <div className="h-0 w-full" />;
}

export async function generateMetadata(): Promise<Metadata> {
	await loadStoreConfiguration();
	return generateHomeMetadata();
}

export const viewport: Viewport = generateViewport();

export default async function RootLayout({ children }: { children: React.ReactNode }): Promise<React.ReactElement> {
	await loadStoreConfiguration();
	const storeConfig = getStoreConfigSafe();
	const structuredData = generateStoreStructuredData();

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script
					dangerouslySetInnerHTML={{
						__html: `
							(function() {
								if ('scrollRestoration' in history) {
									history.scrollRestoration = 'manual';
								}
								window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
								document.addEventListener('DOMContentLoaded', function() {
									window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
								});
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

				<link
					href={`https://${storeConfig.storeDomain}/api/feed.xml`}
					rel="alternate"
					title={`${storeConfig.storeName} Blog Feed`}
					type="application/rss+xml"
				/>
				<link
					href={`https://${storeConfig.storeDomain}/api/feed.xml`}
					rel="alternate"
					title={`${storeConfig.storeName} Blog Feed`}
					type="application/atom+xml"
				/>

				<link href="https://cdn.shopify.com" rel="dns-prefetch" />
				<link href="https://fonts.googleapis.com" rel="dns-prefetch" />
				<link href="https://fonts.gstatic.com" rel="dns-prefetch" />
				<link href="https://bevgyjm5apuichhj.public.blob.vercel-storage.com" rel="dns-prefetch" />

				<link crossOrigin="anonymous" href="https://cdn.shopify.com" rel="preconnect" />
				<link href="https://fonts.googleapis.com" rel="preconnect" />
				<link crossOrigin="anonymous" href="https://fonts.gstatic.com" rel="preconnect" />
				<link crossOrigin="anonymous" href="https://bevgyjm5apuichhj.public.blob.vercel-storage.com" rel="preconnect" />
			</head>
			<body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
				<Providers>
					<AuditProvider>
						<div className="relative flex min-h-screen flex-col">
							<Suspense fallback={<HeaderLoading />}>
								<Header />
							</Suspense>
							<Suspense fallback={<BannerLoading />}>
								<ShopifyStatusBanner />
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
