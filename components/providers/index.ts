// Centralized provider exports for better organization
// All providers are now in one location with consistent imports

// Main compound provider (recommended)
export { CompoundProviders as Providers, usePromo } from "./compound-provider";

// Individual providers (for selective usage)
export { CartProvider, useCart } from "./cart-provider";
export { SearchProvider, useSearch } from "./search-provider";
export { WishlistProvider, useWishlist } from "./wishlist-provider";
export { EnhancedNavigationProvider, useEnhancedNavigation } from "./enhanced-navigation-provider";
export { AuthProvider, useAuthContext } from "./auth-provider";
export { SessionProvider as CustomSessionProvider } from "./session-provider";
export { PrefetchProvider, usePrefetchContext, usePrefetchPerformance } from "./prefetch-provider";

// Re-export external providers for convenience
export { SessionProvider } from "next-auth/react";
export { ThemeProvider } from "next-themes";

// Legacy compatibility exports
export { CompoundProviders as LegacyProviders } from "./compound-provider";
