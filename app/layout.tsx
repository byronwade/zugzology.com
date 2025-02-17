import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/header/header";
import { Providers } from "./providers";
import { Footer } from "@/components/footer/footer";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { KeyboardShortcutsHelp } from "@/components/keyboard-shortcuts-help";
import { cn } from "@/lib/utils";
import { fontSans } from "@/lib/fonts";
import { ThemeProvider } from "@/components/theme-provider";
import { KeyboardShortcutsProvider } from "@/components/keyboard-shortcuts-provider";
import { WishlistProvider } from "@/lib/providers/wishlist-provider";

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
		googleVerificationId: "YOUR_GOOGLE_VERIFICATION_ID",
	};

	return settings;
}

// Move metadata to a function to make it dynamic if needed
export async function generateMetadata(): Promise<Metadata> {
	return {
		metadataBase: new URL("https://zugzology.com"),
		title: {
			default: "Zugzology - Premium Mushroom Cultivation Supplies",
			template: "%s | Zugzology",
		},
		description: "Premium mushroom cultivation supplies and equipment. Find high-quality mushroom growing supplies, cultivation tools, and expert guidance for successful mushroom cultivation.",
		keywords: ["mushroom cultivation", "mushroom supplies", "growing equipment", "cultivation tools", "premium mushroom", "mycology supplies"],
		authors: [{ name: "Zugzology" }],
		creator: "Zugzology",
		publisher: "Zugzology",
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
			google: "YOUR_GOOGLE_VERIFICATION_ID",
		},
		alternates: {
			canonical: "https://zugzology.com",
		},
		openGraph: {
			type: "website",
			locale: "en_US",
			url: "https://zugzology.com",
			siteName: "Zugzology",
			title: "Zugzology - Premium Mushroom Cultivation Supplies",
			description: "Premium mushroom cultivation supplies and equipment. Find high-quality mushroom growing supplies, cultivation tools, and expert guidance.",
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
			description: "Premium mushroom cultivation supplies and equipment. Expert guidance for successful mushroom cultivation.",
			creator: "@zugzology",
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
		},
	};
}

// Server Component for the app content
async function AppContent({ children }: { children: React.ReactNode }) {
	return (
		<KeyboardShortcutsProvider>
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
				<KeyboardShortcutsHelp />
			</div>
		</KeyboardShortcutsProvider>
	);
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
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
