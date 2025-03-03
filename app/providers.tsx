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
import { WishlistProvider } from "@/lib/providers/wishlist-provider";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { GlobalSearchInitializer } from "@/components/search/global-search-initializer";

// Add padding to prevent layout shift when scrollbar disappears
function preventLayoutShift() {
	const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
	document.documentElement.style.setProperty("--removed-body-scroll-bar-size", `${scrollbarWidth}px`);
}

// Toaster component that adapts to theme
function ToasterWithTheme() {
	const { theme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	return (
		<Toaster
			position="bottom-right"
			toastOptions={{
				style: {
					background: theme === "dark" ? "#1a1a1a" : "#ffffff",
					color: theme === "dark" ? "#e6e6e6" : "#242424",
					border: `1px solid ${theme === "dark" ? "#2f2f2f" : "#e6e6e6"}`,
				},
			}}
		/>
	);
}

// Prevent layout shift when scrollbar appears/disappears
if (typeof window !== "undefined") {
	// Add resize listener
	window.addEventListener("resize", preventLayoutShift);

	// Initial call
	preventLayoutShift();
}

export function Providers({ children, ...props }: ThemeProviderProps) {
	return (
		<NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange {...props}>
			<SessionProvider>
				<AuthProvider>
					<WishlistProvider>
						<PromoProvider>
							<SearchProvider>
								<GlobalSearchInitializer />
								<CartProvider>
									{children}
									<CartSheet />
									<ToasterWithTheme />
								</CartProvider>
							</SearchProvider>
						</PromoProvider>
					</WishlistProvider>
				</AuthProvider>
			</SessionProvider>
		</NextThemesProvider>
	);
}
