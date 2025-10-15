"use client";

import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import React, { type ReactNode, Suspense, useEffect, useMemo } from "react";
import { SearchDataLoader } from "@/components/features/search/search-data-loader";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./auth-provider";
import { CartProvider } from "./cart-provider";
import { EnhancedNavigationProvider } from "./enhanced-navigation-provider";
import { PrefetchProvider } from "./prefetch-provider";
import { SearchProvider } from "./search-provider";
import { WishlistProvider } from "./wishlist-provider";

type CompoundProvidersProps = {
	children: ReactNode;
};

// Context definition (moved outside component for proper scope)
const PromoContext = React.createContext<{ showPromo: boolean; setShowPromo: (show: boolean) => void } | undefined>(
	undefined
);

// Scroll Reset Component - ensures all pages start at top
function ScrollReset({ children }: { children: ReactNode }) {
	const _pathname = usePathname();

	useEffect(() => {
		// Disable scroll restoration globally
		if ("scrollRestoration" in history) {
			history.scrollRestoration = "manual";
		}

		// Mark as hydrated to allow scrolling
		document.documentElement.classList.add("hydrated");
	}, []);

	useEffect(() => {
		// Immediately and forcefully scroll to top on any route change
		window.scrollTo({ top: 0, left: 0, behavior: "instant" });
		document.documentElement.scrollTop = 0;
		document.body.scrollTop = 0;

		// Use multiple RAF to ensure it happens after all layout calculations
		requestAnimationFrame(() => {
			window.scrollTo({ top: 0, left: 0, behavior: "instant" });
			requestAnimationFrame(() => {
				window.scrollTo({ top: 0, left: 0, behavior: "instant" });
			});
		});
	}, []);

	return <>{children}</>;
}

// Removed AI Services Initializer - no longer needed

// Combine small providers into a single optimized provider
function AppStateProvider({ children }: { children: ReactNode }) {
	const [showPromo, setShowPromo] = React.useState(true);

	// Memoize the context value to prevent unnecessary re-renders
	const promoValue = useMemo(() => ({ showPromo, setShowPromo }), [showPromo]);

	return <PromoContext.Provider value={promoValue}>{children}</PromoContext.Provider>;
}

// Custom hook for promo state
export function usePromo() {
	const context = React.useContext(PromoContext);
	if (!context) {
		throw new Error("usePromo must be used within AppStateProvider");
	}
	return context;
}

/**
 * Optimized compound provider - simplified without AI and tracking
 * - Removed behavior tracking
 * - Removed AI services
 * - Clean, focused provider structure
 */
export function CompoundProviders({ children }: CompoundProvidersProps) {
	return (
		<SessionProvider>
			<AuthProvider>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
					storageKey="theme-preference"
					enableColorScheme={false}
				>
					<TooltipProvider>
						<Suspense fallback={null}>
							<ScrollReset>
								<SearchProvider>
									<EnhancedNavigationProvider>
										<SearchDataLoader />
										<PrefetchProvider enableIdlePrefetch enableIntersectionPrefetch>
											<CartProvider>
												<WishlistProvider>
													<AppStateProvider>{children}</AppStateProvider>
												</WishlistProvider>
											</CartProvider>
										</PrefetchProvider>
									</EnhancedNavigationProvider>
								</SearchProvider>
							</ScrollReset>
						</Suspense>
					</TooltipProvider>
				</ThemeProvider>
			</AuthProvider>
		</SessionProvider>
	);
}

// Re-export for compatibility
export { CompoundProviders as Providers };
