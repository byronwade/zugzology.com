// Centralized provider exports for better organization
// All providers are now in one location with consistent imports

// Re-export external providers for convenience
export { SessionProvider } from "next-auth/react";
export { ThemeProvider } from "next-themes";
export { AuthProvider, useAuthContext } from "./auth-provider";
// Individual providers (for selective usage)
export { CartProvider, useCart } from "./cart-provider";
// Main compound provider (recommended)
// Legacy compatibility exports
export { CompoundProviders as Providers, CompoundProviders as LegacyProviders, usePromo } from "./compound-provider";
export { EnhancedNavigationProvider, useEnhancedNavigation } from "./enhanced-navigation-provider";
export { PrefetchProvider, usePrefetchContext, usePrefetchPerformance } from "./prefetch-provider";
export { SearchProvider, useSearch } from "./search-provider";
export { SessionProvider as CustomSessionProvider } from "./session-provider";
export { useWishlist, WishlistProvider } from "./wishlist-provider";
