// Centralized hook exports for better organization
// All custom hooks are now in one location

// Core utility hooks
export { useDebounce } from "./use-debounce";
export { useLocalStorage } from "./use-local-storage";
export { useToast } from "./use-toast";
export { useMobile } from "./use-mobile";
export { useViewMode } from "./use-view-mode";

// UI interaction hooks
export { useIntersectionObserver } from "./use-intersection-observer";
export { useKeyboardShortcut } from "./use-keyboard-shortcut";
export { useKeyboardShortcuts } from "./use-keyboard-shortcuts";
export { useViewport } from "./use-viewport";
export { useAnchorScroll } from "./use-anchor-scroll";

// Business logic hooks
export { useAuth } from "./use-auth";
export { useCart } from "./use-cart";
export { useProductFilters } from "./use-product-filters";

// Hook types
export type { UseDebounceOptions } from "./use-debounce";
export type { UseLocalStorageReturn } from "./use-local-storage";
export type { UseAuthReturn } from "./use-auth";
export type { UseCartReturn } from "./use-cart";