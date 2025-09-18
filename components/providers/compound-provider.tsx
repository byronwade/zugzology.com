"use client";

import React, { ReactNode, useMemo, useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { SearchProvider } from "./search-provider";
import { CartProvider } from "./cart-provider";
import { WishlistProvider } from "./wishlist-provider";
import { SearchDataLoader } from "@/components/features/search/search-data-loader";
import { EnhancedNavigationProvider } from "./enhanced-navigation-provider";
import { PrefetchProvider } from "./prefetch-provider";
import { BehaviorTrackingProvider } from "./behavior-tracking-provider";
import { AIMonitoringProvider } from "@/components/ai/ai-monitoring-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

// Initialize AI services
import { advancedBehaviorTracker } from '@/lib/services/advanced-behavior-tracker';
import { predictivePrefetcher } from '@/lib/services/predictive-prefetcher';
import { aiRecommendationEngine } from '@/lib/services/ai-recommendation-engine';
import { conversionOptimizer } from '@/lib/services/conversion-optimizer';
import { shopifyDataContext } from '@/lib/services/shopify-data-context';
import { aiContentManipulator } from '@/lib/services/ai-content-manipulator';
import { aiABTestingFramework } from '@/lib/services/ai-ab-testing';
import { aiPerformanceTracker } from '@/lib/services/ai-performance-tracker';

interface CompoundProvidersProps {
	children: ReactNode;
}

// Context definition (moved outside component for proper scope)
const PromoContext = React.createContext<{ showPromo: boolean; setShowPromo: (show: boolean) => void } | undefined>(undefined);

// AI Services Initializer Component
function AIServicesInitializer({ children }: { children: ReactNode }) {
	useEffect(() => {
		// Services are already initialized as singletons
		// This ensures they're loaded and ready
		if (typeof window !== 'undefined') {
			console.log('🚀 Advanced AI System Active');
			
			// Initialize A/B testing for user
			const aiConfig = aiABTestingFramework.initializeForUser();
			console.log('🧪 A/B Test Configuration:', aiConfig);
			
			// Listen for AI events
			window.addEventListener('conversion-strategy', (event: any) => {
				console.log('📊 Conversion Strategy:', event.detail);
			});
			
			window.addEventListener('product-reorder-applied', (event: any) => {
				console.log('🔄 Product Reorder:', event.detail.reason);
			});
			
			window.addEventListener('ai-conversion-success', (event: any) => {
				console.log('🏆 AI-Influenced Conversion:', event.detail);
			});
		}
	}, []);
	
	return <>{children}</>;
}

// Combine small providers into a single optimized provider
function AppStateProvider({ children }: { children: ReactNode }) {
	const [showPromo, setShowPromo] = React.useState(true);
	
	// Memoize the context value to prevent unnecessary re-renders
	const promoValue = useMemo(() => ({ showPromo, setShowPromo }), [showPromo]);
	
	return (
		<PromoContext.Provider value={promoValue}>
			{children}
		</PromoContext.Provider>
	);
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
 * Optimized compound provider following NextMaster patterns
 * - Reduced nesting levels (5 → 3)
 * - Memoized context values
 * - Combined lightweight providers
 * - Better tree structure for React DevTools
 */
export function CompoundProviders({ children }: CompoundProvidersProps) {
	return (
		<SessionProvider>
			<ThemeProvider 
				attribute="class" 
				defaultTheme="system" 
				enableSystem
				disableTransitionOnChange // Prevent flash of unstyled content
			>
				<TooltipProvider>
					<BehaviorTrackingProvider>
						<SearchProvider>
							<EnhancedNavigationProvider>
								<SearchDataLoader />
								<PrefetchProvider enableIntersectionPrefetch enableIdlePrefetch>
									<CartProvider>
										<WishlistProvider>
											<AppStateProvider>
												<AIServicesInitializer>
													<AIMonitoringProvider>
														{children}
													</AIMonitoringProvider>
												</AIServicesInitializer>
											</AppStateProvider>
										</WishlistProvider>
									</CartProvider>
								</PrefetchProvider>
							</EnhancedNavigationProvider>
						</SearchProvider>
					</BehaviorTrackingProvider>
				</TooltipProvider>
			</ThemeProvider>
		</SessionProvider>
	);
}

// Re-export for compatibility
export { CompoundProviders as Providers };
