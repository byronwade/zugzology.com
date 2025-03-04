"use client";

import { ThemeProvider } from "next-themes";
import { SearchProvider } from "@/lib/providers/search-provider";
import { CartProvider } from "@/lib/providers/cart-provider";
import { PromoProvider } from "@/lib/providers/promo-provider";
import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: ReactNode }) {
	return (
		<SessionProvider>
			<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
				<SearchProvider>
					<CartProvider>
						<PromoProvider>{children}</PromoProvider>
					</CartProvider>
				</SearchProvider>
			</ThemeProvider>
		</SessionProvider>
	);
}
