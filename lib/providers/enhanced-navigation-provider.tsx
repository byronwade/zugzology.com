"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface EnhancedNavigationContextType {
	isQuickActionOpen: boolean;
	toggleQuickAction: () => void;
	closeQuickAction: () => void;
	isEnhancedSearchOpen: boolean;
	openEnhancedSearch: () => void;
	closeEnhancedSearch: () => void;
}

const EnhancedNavigationContext = createContext<EnhancedNavigationContextType | undefined>(undefined);

export function useEnhancedNavigation() {
	const context = useContext(EnhancedNavigationContext);
	if (context === undefined) {
		throw new Error("useEnhancedNavigation must be used within an EnhancedNavigationProvider");
	}
	return context;
}

interface EnhancedNavigationProviderProps {
	children: ReactNode;
}

export function EnhancedNavigationProvider({ children }: EnhancedNavigationProviderProps) {
	const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
	const [isEnhancedSearchOpen, setIsEnhancedSearchOpen] = useState(false);

	const toggleQuickAction = useCallback(() => {
		setIsQuickActionOpen((prev) => !prev);
	}, []);

	const closeQuickAction = useCallback(() => {
		setIsQuickActionOpen(false);
	}, []);

	const openEnhancedSearch = useCallback(() => {
		setIsEnhancedSearchOpen(true);
	}, []);

	const closeEnhancedSearch = useCallback(() => {
		setIsEnhancedSearchOpen(false);
	}, []);

	return (
		<EnhancedNavigationContext.Provider
			value={{
				isQuickActionOpen,
				toggleQuickAction,
				closeQuickAction,
				isEnhancedSearchOpen,
				openEnhancedSearch,
				closeEnhancedSearch,
			}}
		>
			{children}
		</EnhancedNavigationContext.Provider>
	);
}
