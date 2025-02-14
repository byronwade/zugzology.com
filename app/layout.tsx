"use server";

import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/header/header";
import { Providers } from "./providers";
import { SearchProvider } from "@/lib/providers/search-provider";
import { InitializeSearch } from "@/components/search";
import { MainContent } from "@/components/search/main-content";
import { getProducts } from "@/lib/actions/shopify";
import { Footer } from "@/components/footer/footer";
import { Suspense } from "react";
import { CartProvider } from "@/components/providers/cart-provider";
import { Toaster } from "sonner";

// Loading components
function HeaderLoading() {
	return <div className="w-full h-16 bg-background animate-pulse" />;
}

function MainLoading() {
	return <div className="flex-1 bg-background animate-pulse" />;
}

function FooterLoading() {
	return <div className="w-full h-24 bg-background animate-pulse" />;
}

// Optimized global settings with cache
async function getGlobalSettings() {
	"use cache";

	return {
		siteName: "Zugzology",
		siteDescription: "Premium mushroom cultivation supplies and equipment.",
		socialLinks: {
			twitter: "@zugzology",
			facebook: "zugzology",
			instagram: "zugzology",
		},
		googleVerificationId: "YOUR_GOOGLE_VERIFICATION_ID",
	};
}

// Optimized products fetch with parallel loading and caching
async function getCachedProducts() {
	"use cache";

	try {
		const products = await getProducts();
		console.log("[ROOT] Fetched products:", products.length);
		return products;
	} catch (error) {
		console.error("Failed to fetch products:", error);
		return [];
	}
}

export async function generateMetadata(): Promise<Metadata> {
	const settings = await getGlobalSettings();

	return {
		metadataBase: new URL("https://zugzology.com"),
		title: {
			template: `%s | ${settings.siteName}`,
			default: `${settings.siteName} - Premium Mushroom Cultivation Supplies`,
		},
		description: settings.siteDescription,
		applicationName: settings.siteName,
		keywords: ["mushroom cultivation", "mycology supplies", "cultivation equipment"],
		authors: [{ name: "Zugzology" }],
		creator: "Zugzology",
		publisher: "Zugzology",
		formatDetection: {
			email: false,
			address: false,
			telephone: false,
		},
		openGraph: {
			type: "website",
			locale: "en_US",
			siteName: settings.siteName,
			images: [
				{
					url: "https://zugzology.com/og-image.jpg",
					width: 1200,
					height: 630,
					alt: "Zugzology - Premium Mushroom Cultivation Supplies",
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			site: settings.socialLinks.twitter,
		},
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				"max-image-preview": "large",
				"max-video-preview": -1,
				"max-snippet": -1,
			},
		},
		alternates: {
			canonical: "https://zugzology.com",
		},
		verification: {
			google: settings.googleVerificationId,
		},
	};
}

// Server Component for the app content
async function AppContent({ children }: { children: React.ReactNode }) {
	const products = await getCachedProducts();

	return (
		<SearchProvider>
			<InitializeSearch products={products} />
			<div className="flex min-h-screen flex-col">
				<Suspense fallback={<HeaderLoading />}>
					<Header />
				</Suspense>
				<Suspense fallback={<MainLoading />}>
					<MainContent>{children}</MainContent>
				</Suspense>
				<Suspense fallback={<FooterLoading />}>
					<Footer />
				</Suspense>
			</div>
		</SearchProvider>
	);
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<Providers>
					<AppContent>{children}</AppContent>
				</Providers>
				<Toaster richColors position="top-center" />
			</body>
		</html>
	);
}
