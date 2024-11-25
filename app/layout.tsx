import type { Metadata } from "next";
import "./globals.css";
import { CustomerProvider } from "@/lib/context/CustomerContext";
import { HeaderWrapper } from "@/components/header/header-wrapper";
import { CartHydration } from "@/components/cart/cart-hydration";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const metadata: Metadata = {
	title: {
		template: "%s | Zugzology",
		default: "Zugzology - Mushroom Store",
	},
	description: "Your premier source for mushroom products",
	metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
					<CartHydration />
					<CustomerProvider>
						<HeaderWrapper />
						{children}
					</CustomerProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
