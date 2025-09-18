"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

interface EnhancedNavigationContextValue {
	isEnhancedSearchOpen: boolean;
	openEnhancedSearch: () => void;
	closeEnhancedSearch: () => void;
	toggleEnhancedSearch: () => void;
}

const EnhancedNavigationContext = createContext<EnhancedNavigationContextValue | undefined>(undefined);

export function EnhancedNavigationProvider({ children }: { children: ReactNode }) {
	const [isEnhancedSearchOpen, setIsEnhancedSearchOpen] = useState(false);

	const openEnhancedSearch = useCallback(() => {
		setIsEnhancedSearchOpen(true);
	}, []);

	const closeEnhancedSearch = useCallback(() => {
		setIsEnhancedSearchOpen(false);
	}, []);

	const toggleEnhancedSearch = useCallback(() => {
		setIsEnhancedSearchOpen((prev) => !prev);
	}, []);

	// Support external triggers via custom events to keep components decoupled
	useEffect(() => {
		const handleOpen = () => openEnhancedSearch();
		const handleClose = () => closeEnhancedSearch();
		const handleToggle = () => toggleEnhancedSearch();

		window.addEventListener("enhanced-search:open", handleOpen);
		window.addEventListener("enhanced-search:close", handleClose);
		window.addEventListener("enhanced-search:toggle", handleToggle);

		return () => {
			window.removeEventListener("enhanced-search:open", handleOpen);
			window.removeEventListener("enhanced-search:close", handleClose);
			window.removeEventListener("enhanced-search:toggle", handleToggle);
		};
	}, [closeEnhancedSearch, openEnhancedSearch, toggleEnhancedSearch]);

	const value = useMemo(
		() => ({
			isEnhancedSearchOpen,
			openEnhancedSearch,
			closeEnhancedSearch,
			toggleEnhancedSearch,
		}),
		[isEnhancedSearchOpen, openEnhancedSearch, closeEnhancedSearch, toggleEnhancedSearch]
	);

	return <EnhancedNavigationContext.Provider value={value}>{children}</EnhancedNavigationContext.Provider>;
}

export function useEnhancedNavigation(): EnhancedNavigationContextValue {
	const context = useContext(EnhancedNavigationContext);
	if (!context) {
		throw new Error("useEnhancedNavigation must be used within an EnhancedNavigationProvider");
	}
	return context;
}
