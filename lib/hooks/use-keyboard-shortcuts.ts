"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearch } from "@/lib/providers/search-provider";
import { useCart } from "@/lib/providers/cart-provider";

export function useKeyboardShortcuts() {
	const router = useRouter();
	const { setIsDropdownOpen, setSearchQuery } = useSearch();
	const { openCart, closeCart, isOpen } = useCart();

	useEffect(() => {
		const handlers: { [key: string]: (e: KeyboardEvent) => void } = {
			// Navigation shortcuts (Shift + key)
			h: (e) => {
				if (e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey) {
					e.preventDefault();
					router.push("/");
				}
			},
			s: (e) => {
				if (e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey) {
					e.preventDefault();
					router.push("/search");
				}
			},
			a: (e) => {
				if (e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey) {
					e.preventDefault();
					router.push("/account");
				}
			},
			c: (e) => {
				if (e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey) {
					e.preventDefault();
					router.push("/collections");
				}
			},
			b: (e) => {
				if (e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey) {
					e.preventDefault();
					router.push("/blogs");
				}
			},
			"/": (e) => {
				if (e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey) {
					e.preventDefault();
					router.push("/help");
				}
			},

			// Actions
			k: (e) => {
				if (e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey) {
					e.preventDefault();
					const searchInput = document.querySelector('input[type="text"][placeholder*="Search"]') as HTMLInputElement;
					if (searchInput) {
						searchInput.focus();
					}
				}
			},
			Escape: () => {
				setSearchQuery("");
				setIsDropdownOpen(false);
				if (document.activeElement instanceof HTMLElement) {
					document.activeElement.blur();
				}
				closeCart();
			},
			o: (e) => {
				if (e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey) {
					e.preventDefault();
					if (isOpen) {
						closeCart();
						console.log("Cart closing via keyboard");
					} else {
						openCart();
						console.log("Cart opening via keyboard");
					}
				}
			},
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			// Log the key press for debugging
			console.log("Key pressed:", {
				key: e.key,
				shiftKey: e.shiftKey,
				metaKey: e.metaKey,
				ctrlKey: e.ctrlKey,
				altKey: e.altKey,
				target: e.target,
				cartIsOpen: isOpen,
			});

			// Ignore if user is typing in an input, except for specific allowed shortcuts
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
				if (!(e.key === "/" && !e.target.value.length) && !(e.key === "k" && e.shiftKey)) {
					return;
				}
			}

			const handler = handlers[e.key.toLowerCase()];
			if (handler) {
				handler(e);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [router, setIsDropdownOpen, setSearchQuery, openCart, closeCart, isOpen]);
}
