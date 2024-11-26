import "./globals.css";
import type { Metadata } from "next";
import { CustomerProvider } from "@/lib/context/CustomerContext";
import { HeaderWrapper } from "@/components/header/header-wrapper";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { CartSheet } from "@/components/cart/cart-sheet";
import { CartProvider } from "@/components/providers/cart-provider";
import { getMenu } from "@/lib/actions/getTaxonomyData";
import { Suspense } from "react";

export const metadata: Metadata = {
	title: {
		template: "%s | Zugzology",
		default: "Zugzology - Mushroom Cultivation Supplies",
	},
	description: "Premium mushroom cultivation supplies and equipment.",
};

async function Header() {
	const menu = await getMenu();
	return <HeaderWrapper menu={menu} />;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body suppressHydrationWarning>
				<CartProvider>
					<ThemeProvider>
						<CustomerProvider>
							<Suspense fallback={<div>Loading header...</div>}>
								<HeaderWrapper />
							</Suspense>
							<CartSheet />
							<main className="min-h-screen">{children}</main>
						</CustomerProvider>
					</ThemeProvider>
				</CartProvider>
			</body>
		</html>
	);
}
