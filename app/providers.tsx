"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";
import { CartProvider } from "@/lib/providers/cart-provider";
import { CartSheet } from "@/components/cart/cart-sheet";
import { Toaster } from "sonner";

export function Providers({ children, ...props }: ThemeProviderProps) {
	return (
		<NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange {...props}>
			<CartProvider>
				{children}
				<CartSheet />
			</CartProvider>
		</NextThemesProvider>
	);
}
