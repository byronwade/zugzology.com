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

// Debounce function to limit localStorage updates
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout;
	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}

export function WishlistProvider({ children }: { children: ReactNode }) {
	const [wishlist, setWishlist] = useState<string[]>([]);

	// Memoize the localStorage update function
	const updateLocalStorage = useMemo(
		() =>
			debounce((newWishlist: string[]) => {
				localStorage.setItem("wishlist", JSON.stringify(newWishlist));
			}, 300),
		[]
	);

	// Initialize wishlist from localStorage
	useEffect(() => {
		try {
			const storedWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
			setWishlist(storedWishlist);
		} catch (error) {
			console.error("Error loading wishlist:", error);
			setWishlist([]);
		}
	}, []);

	const addToWishlist = useCallback(
		(handle: string) => {
			setWishlist((prev) => {
				if (!prev.includes(handle)) {
					const newWishlist = [...prev, handle];
					updateLocalStorage(newWishlist);
					toast.success("Added to wishlist");
					return newWishlist;
				}
				return prev;
			});
		},
		[updateLocalStorage]
	);

	const removeFromWishlist = useCallback(
		(handle: string) => {
			setWishlist((prev) => {
				const newWishlist = prev.filter((item) => item !== handle);
				updateLocalStorage(newWishlist);
				toast.success("Removed from wishlist");
				return newWishlist;
			});
		},
		[updateLocalStorage]
	);

	const isInWishlist = useCallback((handle: string) => wishlist.includes(handle), [wishlist]);

	const value = useMemo(
		() => ({
			wishlist,
			addToWishlist,
			removeFromWishlist,
			isInWishlist,
		}),
		[wishlist, addToWishlist, removeFromWishlist, isInWishlist]
	);

	return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
	const context = useContext(WishlistContext);
	if (context === undefined) {
		throw new Error("useWishlist must be used within a WishlistProvider");
	}
	return context;
}
