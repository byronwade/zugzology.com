"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from "react";
import { toast } from "sonner";

interface WishlistContextType {
	wishlist: string[];
	addToWishlist: (handle: string) => void;
	removeFromWishlist: (handle: string) => void;
	isInWishlist: (handle: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Custom hook for synchronized localStorage
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

	// Synchronized update function
	const setValue = useCallback(
		(value: any) => {
			try {
				// Update state immediately
				const newValue = typeof value === "function" ? value(storedValue) : value;
				// Ensure we're only storing valid strings
				const validatedValue = Array.isArray(newValue) ? newValue.filter((item): item is string => typeof item === "string" && item.length > 0) : [];
				setStoredValue(validatedValue);

				// Update localStorage immediately after state
				queueMicrotask(() => {
					localStorage.setItem(key, JSON.stringify(validatedValue));
				});
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

	const addToWishlist = useCallback(
		(handle: string) => {
			if (!isInitialized || !handle) return;

			setWishlist((prev: string[]) => {
				// Ensure we're not adding duplicates
				if (prev.includes(handle)) {
					return prev;
				}

				// Add the new handle and ensure it's unique
				const newWishlist = [...new Set([...prev, handle])];

				// Dispatch a custom event to notify other components
				window.dispatchEvent(
					new CustomEvent("wishlist-updated", {
						detail: { wishlist: newWishlist },
					})
				);

				return newWishlist;
			});
		},
		[setWishlist, isInitialized]
	);

	const removeFromWishlist = useCallback(
		(handle: string) => {
			if (!isInitialized || !handle) return;

			setWishlist((prev: string[]) => {
				const newWishlist = prev.filter((item) => item !== handle);

				// Only dispatch event and show toast if something was actually removed
				if (newWishlist.length !== prev.length) {
					// Dispatch a custom event to notify other components
					window.dispatchEvent(
						new CustomEvent("wishlist-updated", {
							detail: { wishlist: newWishlist },
						})
					);
				}

				return newWishlist;
			});
		},
		[setWishlist, isInitialized]
	);

	// Listen for wishlist updates from other components
	useEffect(() => {
		const handleWishlistUpdate = (event: CustomEvent) => {
			const newWishlist = event.detail.wishlist;
			setWishlist(newWishlist);
		};

		window.addEventListener("wishlist-updated", handleWishlistUpdate as EventListener);

		return () => {
			window.removeEventListener("wishlist-updated", handleWishlistUpdate as EventListener);
		};
	}, [setWishlist]);

	const isInWishlist = useCallback((handle: string) => wishlist.includes(handle), [wishlist]);

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
