"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function useAnchorScroll() {
	const pathname = usePathname();
	const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		// Function to handle scroll state class
		const handleScroll = () => {
			document.documentElement.classList.add("scrolling");

			if (scrollTimeout.current) {
				clearTimeout(scrollTimeout.current);
			}

			scrollTimeout.current = setTimeout(() => {
				document.documentElement.classList.remove("scrolling");
			}, 150);
		};

		// Add scroll listener to track user scrolling
		window.addEventListener("scroll", handleScroll, { passive: true });

		return () => {
			window.removeEventListener("scroll", handleScroll);
			if (scrollTimeout.current) {
				clearTimeout(scrollTimeout.current);
			}
			document.documentElement.classList.remove("scrolling");
		};
	}, [pathname]); // Re-run when the pathname changes
}
