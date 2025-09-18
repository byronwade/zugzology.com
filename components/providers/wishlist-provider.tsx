"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useAIPredictionStore } from "@/stores/ai-prediction-store";

interface WishlistContextType {
	wishlist: string[];
	addToWishlist: (handle: string) => void;
	removeFromWishlist: (handle: string) => void;
	isInWishlist: (handle: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Optimized localStorage hook with immediate updates
function useSyncedLocalStorage(key: string, initialValue: any) {
	const [storedValue, setStoredValue] = useState(initialValue);
	const [isInitialized, setIsInitialized] = useState(false);

	// Initialize from localStorage
	useEffect(() => {
		try {
			const item = localStorage.getItem(key);
			let value = initialValue;
			if (item) {
				const parsed = JSON.parse(item);
				// Ensure the parsed value is an array of strings
				if (Array.isArray(parsed)) {
					value = parsed.filter((item): item is string => typeof item === "string" && item.length > 0);
				}
			}
			setStoredValue(value);
			setIsInitialized(true);
		} catch (error) {
			console.error("Error reading from localStorage:", error);
			setStoredValue(initialValue);
			setIsInitialized(true);
		}
	}, [key, initialValue]);

	// Optimized update function with immediate state and localStorage update
	const setValue = useCallback(
		(value: any) => {
			try {
				// Calculate the new value
				const newValue = typeof value === "function" ? value(storedValue) : value;
				// Ensure we're only storing valid strings
				const validatedValue = Array.isArray(newValue) ? newValue.filter((item): item is string => typeof item === "string" && item.length > 0) : [];
				
				// Update state immediately
				setStoredValue(validatedValue);

				// Update localStorage synchronously for immediate persistence
				localStorage.setItem(key, JSON.stringify(validatedValue));
			} catch (error) {
				console.error("Error saving to localStorage:", error);
			}
		},
		[key, storedValue]
	);

	return [storedValue, setValue, isInitialized] as const;
}

export function WishlistProvider({ children }: { children: ReactNode }) {
	const [wishlist, setWishlist, isInitialized] = useSyncedLocalStorage("wishlist", []);
	
	// AI tracking
	const { trackInteraction } = useAIPredictionStore();

	const addToWishlist = useCallback(
		(handle: string) => {
			if (!isInitialized || !handle) return;

			setWishlist((prev: string[]) => {
				// Quick duplicate check
				if (prev.includes(handle)) {
					return prev;
				}
				
				// Track wishlist add with AI prediction store
				trackInteraction({
					productId: handle,
					type: 'wishlist_add',
					context: 'wishlist-action'
				});
				
				// Show success toast
				toast.success('Added to wishlist', {
					description: 'Product has been added to your wishlist',
					duration: 2000
				});
				
				// Optimized add - just append instead of spreading and deduplicating
				return [...prev, handle];
			});
		},
		[setWishlist, isInitialized, trackInteraction]
	);

	const removeFromWishlist = useCallback(
		(handle: string) => {
			if (!isInitialized || !handle) return;

			setWishlist((prev: string[]) => {
				// Quick existence check
				if (!prev.includes(handle)) {
					return prev;
				}
				
				// Track wishlist remove with AI prediction store
				trackInteraction({
					productId: handle,
					type: 'wishlist_remove',
					context: 'wishlist-action'
				});
				
				// Show removal toast
				toast.info('Removed from wishlist', {
					description: 'Product has been removed from your wishlist',
					duration: 2000
				});
				
				// Optimized remove - filter once
				return prev.filter((item) => item !== handle);
			});
		},
		[setWishlist, isInitialized, trackInteraction]
	);

	// Optimized wishlist lookup using Set for O(1) performance
	const wishlistSet = useMemo(() => new Set(wishlist), [wishlist]);
	const isInWishlist = useCallback((handle: string) => wishlistSet.has(handle), [wishlistSet]);

	// Memoize the context value to prevent unnecessary rerenders
	const value = useMemo(
		() => ({
			wishlist,
			addToWishlist,
			removeFromWishlist,
			isInWishlist,
		}),
		[wishlist, addToWishlist, removeFromWishlist, isInWishlist]
	);

	if (!isInitialized) {
		return null;
	}

	return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
	const context = useContext(WishlistContext);
	if (context === undefined) {
		throw new Error("useWishlist must be used within a WishlistProvider");
	}
	return context;
}
