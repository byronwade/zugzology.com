"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function ScrollToTop() {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	useEffect(() => {
		// Scroll to top when the route (pathname or search params) changes
		window.scrollTo({ top: 0, behavior: "instant" });
	}, [pathname, searchParams]);

	// This component does not render anything
	return null;
}
