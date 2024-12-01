import "./globals.css";
import type { Metadata } from "next";
import { Header } from "@/components/header/header";
import { Providers } from "./providers";

export const metadata: Metadata = {
	title: {
		template: "%s | Zugzology",
		default: "Zugzology - Premium Mushroom Cultivation Supplies",
	},
	description: "Premium mushroom cultivation supplies and equipment. Find everything you need for successful mushroom growing.",
	metadataBase: new URL("https://zugzology.com"),
	openGraph: {
		type: "website",
		locale: "en_US",
		siteName: "Zugzology",
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
		site: "@zugzology",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				{/* Preconnect to important domains */}
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://cdn.shopify.com" crossOrigin="anonymous" />

				{/* Prevent zoom on input focus */}
				<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />

				{/* Favicon */}
				<link rel="icon" href="/favicon.ico" sizes="any" />
				<link rel="apple-touch-icon" href="/apple-touch-icon.png" />

				{/* PWA manifest */}
				<link rel="manifest" href="/manifest.json" />
			</head>
			<body>
				<Providers>
					<Header />
					<main id="main-content" role="main">
						{children}
					</main>
				</Providers>
			</body>
		</html>
	);
}
