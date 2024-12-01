import "./globals.css";
import type { Metadata } from "next";
import { Header } from "@/components/header/header";
import { Providers } from "./providers";
import { SearchProvider } from "@/lib/providers/search-provider";
import { InitializeSearch } from "@/components/search";
import { MainContent } from "@/components/search/main-content";
import { getProducts } from "@/lib/actions/shopify";

// Add function to fetch global settings
async function getGlobalSettings() {
	// Fetch from your CMS or Shopify
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

export async function generateMetadata(): Promise<Metadata> {
	const settings = await getGlobalSettings();

	return {
		title: {
			template: `%s | ${settings.siteName}`,
			default: `${settings.siteName} - Premium Mushroom Cultivation Supplies`,
		},
		description: settings.siteDescription,
		metadataBase: new URL("https://zugzology.com"),
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
			},
		},
		alternates: {
			canonical: "https://zugzology.com",
		},
	};
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const products = await getProducts();

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				{/* Preconnect to important domains */}
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://cdn.shopify.com" crossOrigin="anonymous" />

				{/* Prevent zoom on input focus */}
				<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
			</head>
			<body>
				<Providers>
					<SearchProvider>
						<InitializeSearch products={products || []} />
						<Header />
						<MainContent>{children}</MainContent>
					</SearchProvider>
				</Providers>
			</body>
		</html>
	);
}
