import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Footer, Header } from "@/components/layout";
import { ShopifyStatusBanner } from "@/components/layout/shopify-status-banner";
import { generateHomeMetadata, generateStoreStructuredData, generateViewport } from "@/lib/config/dynamic-metadata";
import { getStoreConfigSafe } from "@/lib/config/store-config";
import { fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";

function HeaderLoading(): React.ReactElement {
	return <div className="h-16 w-full animate-pulse bg-background" />;
}

function FooterLoading(): React.ReactElement {
	return <div className="h-64 w-full animate-pulse bg-background" />;
}

export function generateMetadata(): Metadata {
	// Use static/default store config — do not await Shopify on every request
	return generateHomeMetadata();
}

export const viewport: Viewport = generateViewport();

export default function RootLayout({ children }: { children: React.ReactNode }): React.ReactElement {
	const storeConfig = getStoreConfigSafe();
	const structuredData = generateStoreStructuredData();

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
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

				<link href="https://cdn.shopify.com" rel="dns-prefetch" />
				<link crossOrigin="anonymous" href="https://cdn.shopify.com" rel="preconnect" />
				<link crossOrigin="anonymous" href="https://bevgyjm5apuichhj.public.blob.vercel-storage.com" rel="preconnect" />
			</head>
			<body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
				<Providers>
					<div className="relative flex min-h-screen flex-col">
						<Suspense fallback={<HeaderLoading />}>
							<Header />
						</Suspense>
						<Suspense fallback={null}>
							<ShopifyStatusBanner />
						</Suspense>
						<main className="flex-1">{children}</main>
						<Suspense fallback={<FooterLoading />}>
							<Footer />
						</Suspense>
					</div>
				</Providers>
				<Analytics />
			</body>
		</html>
	);
}
