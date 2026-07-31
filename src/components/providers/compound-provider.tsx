"use client";

import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import React, { type ReactNode, Suspense, useEffect } from "react";
import { SearchDataLoader } from "@/components/features/search/search-data-loader";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./auth-provider";
import { CartProvider } from "./cart-provider";
import { SearchProvider } from "./search-provider";
import { WishlistProvider } from "./wishlist-provider";

type CompoundProvidersProps = {
	children: ReactNode;
};

function ScrollReset({ children }: { children: ReactNode }): React.ReactElement {
	const pathname = usePathname();

	useEffect(() => {
		if ("scrollRestoration" in history) {
			history.scrollRestoration = "manual";
		}
		document.documentElement.classList.add("hydrated");
	}, []);

	useEffect(() => {
		window.scrollTo({ top: 0, left: 0, behavior: "instant" });
	}, [pathname]);

	return <>{children}</>;
}

/**
 * Lean provider tree — only what every page needs.
 * Search data loads on idle; auth comes from NextAuth + thin AuthProvider.
 */
export function CompoundProviders({ children }: CompoundProvidersProps): React.ReactElement {
	return (
		<SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
			<AuthProvider>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					disableTransitionOnChange
					enableColorScheme={false}
					enableSystem
					storageKey="theme-preference"
				>
					<TooltipProvider delayDuration={300}>
						<Suspense fallback={null}>
							<ScrollReset>
								<SearchProvider>
									<SearchDataLoader />
									<CartProvider>
										<WishlistProvider>{children}</WishlistProvider>
									</CartProvider>
								</SearchProvider>
							</ScrollReset>
						</Suspense>
					</TooltipProvider>
				</ThemeProvider>
			</AuthProvider>
		</SessionProvider>
	);
}

export function usePromo(): { showPromo: boolean; setShowPromo: (show: boolean) => void } {
	return { showPromo: false, setShowPromo: () => {} };
}

export { CompoundProviders as Providers };
