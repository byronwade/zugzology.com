import "./globals.css";
import type { Metadata } from "next";
import { CustomerProvider } from "@/lib/context/CustomerContext";
import { HeaderWrapper } from "@/components/header/header-wrapper";
import { CartHydration } from "@/components/cart/cart-hydration";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { CartSheet } from "@/components/cart/cart-sheet";

export const metadata: Metadata = {
	title: {
		template: "%s | Zugzology",
		default: "Zugzology - Mushroom Cultivation Supplies",
	},
	description: "Premium mushroom cultivation supplies and equipment.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<ThemeProvider>
					<CustomerProvider>
						<CartHydration />
						<HeaderWrapper />
						<CartSheet />
						<main>{children}</main>
					</CustomerProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
