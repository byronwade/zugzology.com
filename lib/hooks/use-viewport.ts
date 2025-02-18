"use client";

import { useState, useEffect } from "react";

export function useViewport() {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkViewport = () => {
			setIsMobile(window.innerWidth < 640);
		};

		// Initial check
		checkViewport();

		// Add event listener
		window.addEventListener("resize", checkViewport);

		// Cleanup
		return () => window.removeEventListener("resize", checkViewport);
	}, []);

	return { isMobile };
}
