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
import { useTheme } from "next-themes";
import { useEffect } from "react";

// Add padding to prevent layout shift when scrollbar disappears
function preventLayoutShift() {
	const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
	document.documentElement.style.setProperty("--removed-body-scroll-bar-size", `${scrollbarWidth}px`);
}

function ToasterWithTheme() {
	const { theme } = useTheme();

	useEffect(() => {
		preventLayoutShift();
		window.addEventListener("resize", preventLayoutShift);
		return () => window.removeEventListener("resize", preventLayoutShift);
	}, []);

	return (
		<Toaster
			position="top-center"
			richColors
			expand
			closeButton
			theme={theme === "dark" ? "dark" : "light"}
			swipeDirections={["right"]}
			visibleToasts={6}
			toastOptions={{
				className: "group relative after:content-['Swipe_right_to_dismiss'] after:absolute after:bottom-1 after:left-0 after:right-0 after:text-[10px] after:text-center after:text-muted-foreground/60 after:block sm:after:hidden",
				descriptionClassName: "group-hover:opacity-100 text-xs text-muted-foreground/80",
				duration: 4000,
				style: {
					background: theme === "dark" ? "hsl(var(--background))" : "white",
					color: theme === "dark" ? "white" : "black",
					padding: "0.75rem",
				},
			}}
			className="toast-spacing"
		/>
	);
}

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
								<ToasterWithTheme />
							</CartProvider>
						</SearchProvider>
					</PromoProvider>
				</AuthProvider>
			</SessionProvider>
		</NextThemesProvider>
	);
}
