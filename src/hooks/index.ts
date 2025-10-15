// Centralized hook exports for better organization
// All custom hooks are now in one location

export { useAnchorScroll } from "./use-anchor-scroll";
// Business logic hooks
export { useAuth } from "./use-auth";
export { useCart } from "./use-cart";
// Core utility hooks
export { useDebounce } from "./use-debounce";
// UI interaction hooks
export { useIntersectionObserver } from "./use-intersection-observer";
export { useKeyboardShortcut } from "./use-keyboard-shortcut";
export { useKeyboardShortcuts } from "./use-keyboard-shortcuts";
export { useLocalStorage } from "./use-local-storage";
export { useIsMobile } from "./use-mobile";
export { useProductFilters } from "./use-product-filters";
export { useToast } from "./use-toast";
export { useViewMode } from "./use-view-mode";
export { useViewport } from "./use-viewport";

// Hook types can be exported here when defined by the implementation files
