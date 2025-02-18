"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";
import { CartProvider } from "@/lib/providers/cart-provider";
import { CartSheet } from "@/components/cart/cart-sheet";
import { Toaster } from "sonner";
import { SearchProvider } from "@/lib/providers/search-provider";
import { PromoProvider } from "@/lib/providers/promo-provider";

export function Providers({ children, ...props }: ThemeProviderProps) {
	return (
		<NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange {...props}>
			<PromoProvider>
				<SearchProvider>
					<CartProvider>
						{children}
						<CartSheet />
					</CartProvider>
				</SearchProvider>
			</PromoProvider>
		</NextThemesProvider>
	);
}
