import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/header/header";
import { Providers } from "./providers";
import { Footer } from "@/components/layout/footer";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { fontSans } from "@/lib/fonts";
import { ThemeProvider } from "@/components/theme-provider";
import { WishlistProvider } from "@/lib/providers/wishlist-provider";
import { jsonLdScriptProps } from "react-schemaorg";
import { WithContext, Organization } from "schema-dts";

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
	const settings = {
		siteName: "Zugzology",
		siteDescription: "Premium mushroom cultivation supplies and equipment. Find high-quality mushroom growing supplies, cultivation tools, and expert guidance for successful mushroom cultivation.",
		socialLinks: {
			twitter: "@zugzology",
			facebook: "zugzology",
			instagram: "zugzology",
		},
		logo: "https://zugzology.com/logo.png",
		address: {
			streetAddress: "123 Mushroom Street",
			addressLocality: "Mycology City",
			addressRegion: "CA",
			postalCode: "12345",
			addressCountry: "US",
		},
		contactPoint: {
			telephone: process.env.NEXT_PUBLIC_CONTACT_PHONE,
			contactType: "customer service",
			availableLanguage: "English",
		},
	};

	return settings;
}

// Move metadata to a function to make it dynamic if needed
export async function generateMetadata(): Promise<Metadata> {
	const settings = await getGlobalSettings();

	return {
		metadataBase: new URL("https://zugzology.com"),
		title: {
			default: "Zugzology - Premium Mushroom Cultivation Supplies",
			template: "%s | Zugzology",
		},
		description: settings.siteDescription,
		keywords: ["mushroom cultivation", "mushroom supplies", "growing equipment", "cultivation tools", "premium mushroom", "mycology supplies"],
		authors: [{ name: settings.siteName }],
		creator: settings.siteName,
		publisher: settings.siteName,
		formatDetection: {
			email: false,
			address: false,
			telephone: false,
		},
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				"max-video-preview": -1,
				"max-image-preview": "large",
				"max-snippet": -1,
			},
		},
		verification: {
			google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION_ID,
		},
		alternates: {
			canonical: "https://zugzology.com",
		},
		openGraph: {
			type: "website",
			locale: "en_US",
			url: "https://zugzology.com",
			siteName: settings.siteName,
			title: "Zugzology - Premium Mushroom Cultivation Supplies",
			description: settings.siteDescription,
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
			title: "Zugzology - Premium Mushroom Cultivation Supplies",
			description: settings.siteDescription,
			creator: settings.socialLinks.twitter,
			images: ["https://zugzology.com/twitter-image.jpg"],
		},
		icons: {
			icon: "/favicon.ico",
			shortcut: "/favicon-16x16.png",
			apple: "/apple-touch-icon.png",
			other: [
				{
					rel: "icon",
					type: "image/png",
					sizes: "32x32",
					url: "/favicon-32x32.png",
				},
				{
					rel: "icon",
					type: "image/png",
					sizes: "16x16",
					url: "/favicon-16x16.png",
				},
				{
					rel: "mask-icon",
					url: "/safari-pinned-tab.svg",
					color: "#5bbad5",
				},
			],
		},
		manifest: "/site.webmanifest",
		other: {
			"msapplication-TileColor": "#603cba",
			"theme-color": "#ffffff",
			"google-site-verification": process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION_ID || "",
			preconnect: ["https://cdn.shopify.com"],
			"dns-prefetch": ["https://cdn.shopify.com"],
			preload: ["https://zugzology.com/fonts/main-font.woff2"],
		},
	};
}

// Server Component for the app content
async function AppContent({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex min-h-screen flex-col">
			<Suspense fallback={<HeaderLoading />}>
				<Header />
			</Suspense>
			<Suspense fallback={<MainLoading />}>
				<main className="flex-1">{children}</main>
			</Suspense>
			<Suspense fallback={<FooterLoading />}>
				<Footer />
			</Suspense>
		</div>
	);
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const settings = await getGlobalSettings();

	// Organization Schema
	const organizationSchema: WithContext<Organization> = {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: settings.siteName,
		description: settings.siteDescription,
		url: "https://zugzology.com",
		logo: settings.logo,
		sameAs: [`https://facebook.com/${settings.socialLinks.facebook}`, `https://twitter.com/${settings.socialLinks.twitter.replace("@", "")}`, `https://instagram.com/${settings.socialLinks.instagram}`],
		address: {
			"@type": "PostalAddress",
			...settings.address,
		},
		contactPoint: [
			{
				"@type": "ContactPoint",
				...settings.contactPoint,
			},
		],
	};

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
				<meta name="format-detection" content="telephone=no" />
				<meta name="theme-color" content="#ffffff" />
				<link rel="preconnect" href="https://cdn.shopify.com" crossOrigin="anonymous" />
				<link rel="dns-prefetch" href="https://cdn.shopify.com" />
				<script {...jsonLdScriptProps(organizationSchema)} />
			</head>
			<body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
					<WishlistProvider>
						<Providers>
							<AppContent>{children}</AppContent>
						</Providers>
					</WishlistProvider>
				</ThemeProvider>
				<Toaster richColors position="top-center" />
			</body>
		</html>
	);
}
