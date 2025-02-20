"use client";

import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768; // Match the breakpoint used in recommendation sections

export function useViewport() {
	const [mounted, setMounted] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		setMounted(true);

		// Use matchMedia for more reliable breakpoint detection
		const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

		const checkViewport = () => {
			setIsMobile(mql.matches);
		};

		// Initial check
		checkViewport();

		// Add event listener using the modern API
		if (typeof mql.addEventListener === "function") {
			mql.addEventListener("change", checkViewport);
			return () => mql.removeEventListener("change", checkViewport);
		} else {
			// Fallback for older browsers
			window.addEventListener("resize", checkViewport);
			return () => window.removeEventListener("resize", checkViewport);
		}
	}, []);

	// During SSR or before hydration, assume desktop view
	if (!mounted) return { isMobile: false };

	return { isMobile };
}
