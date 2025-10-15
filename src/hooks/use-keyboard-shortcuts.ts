"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCart, useSearch } from "@/components/providers";

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
					} else {
						openCart();
					}
				}
			},
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			// Ignore if user is typing in an input, except for specific allowed shortcuts
			if (
				(e.target instanceof HTMLInputElement ||
					e.target instanceof HTMLTextAreaElement ||
					e.target instanceof HTMLSelectElement) &&
				!((e.key === "/" && !e.target.value.length) || (e.key === "k" && e.shiftKey))
			) {
				return;
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
