"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";
import { CartProvider } from "@/lib/providers/cart-provider";
import { CartSheet } from "@/components/cart/cart-sheet";
import { Toaster } from "sonner";
import { SearchProvider } from "@/lib/providers/search-provider";
import { PromoProvider } from "@/lib/providers/promo-provider";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/components/providers/auth-provider";

export function Providers({ children, ...props }: ThemeProviderProps) {
	return (
		<NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange {...props}>
			<SessionProvider>
				<AuthProvider>
					<PromoProvider>
						<SearchProvider>
							<CartProvider>
								{children}
								<CartSheet />
								<Toaster position="top-right" />
							</CartProvider>
						</SearchProvider>
					</PromoProvider>
				</AuthProvider>
			</SessionProvider>
		</NextThemesProvider>
	);
}
