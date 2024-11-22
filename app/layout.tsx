import type { Metadata } from "next";
import "./globals.css";
import { CartSheet } from "@/components/cart/cart-sheet";
import { CartButton } from "@/components/cart/cart-button";

export const metadata: Metadata = {
	title: {
		template: "%s | Zugzology",
		default: "Zugzology - Mushroom Store",
	},
	description: "Your premier source for mushroom products",
	metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				{/* Preconnect to Shopify CDN */}
				<link rel="preconnect" href="https://cdn.shopify.com" crossOrigin="anonymous" />
			</head>
			<body className="min-h-screen bg-background text-foreground">
				<header>
					<CartButton />
				</header>
				{children}
				<CartSheet />
			</body>
		</html>
	);
}
