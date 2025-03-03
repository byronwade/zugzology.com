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
import { ScrollToTop } from "@/components/scroll-to-top";
import { SessionProvider } from "next-auth/react";

// Loading components
function HeaderLoading() {
	return <div className="w-full h-16 bg-background animate-pulse" />;
}

function FooterLoading() {
	return <div className="w-full h-64 bg-background animate-pulse" />;
}

const metadata = {
	title: {
		default: "Zugzology - Premium Mushroom Growing Supplies",
		template: "%s | Zugzology",
	},
	description:
		"Discover premium mushroom growing supplies at Zugzology. We offer high-quality cultivation equipment, substrates, and expert guidance for mushroom enthusiasts.",
	openGraph: {
		title: "Zugzology - Premium Mushroom Growing Supplies",
		description:
			"Discover premium mushroom growing supplies at Zugzology. We offer high-quality cultivation equipment, substrates, and expert guidance for mushroom enthusiasts.",
		url: "https://zugzology.com",
		siteName: "Zugzology",
		images: [
			{
				url: "https://zugzology.com/og-image.jpg",
				width: 1200,
				height: 630,
			},
		],
		locale: "en_US",
		type: "website",
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
	twitter: {
		title: "Zugzology",
		card: "summary_large_image",
	},
	icons: {
		shortcut: "/favicon.ico",
	},
	verification: {
		google: "google-site-verification-code",
	},
} satisfies Metadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script
					{...jsonLdScriptProps<WithContext<Organization>>({
						"@context": "https://schema.org",
						"@type": "Organization",
						name: "Zugzology",
						url: "https://zugzology.com",
						logo: "https://zugzology.com/logo.png",
						sameAs: [
							"https://facebook.com/zugzology",
							"https://twitter.com/zugzology",
							"https://instagram.com/zugzology",
						],
					})}
				/>
			</head>
			<body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
				<Providers>
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
				</Providers>
			</body>
		</html>
	);
}
