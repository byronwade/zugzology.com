"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Client component that uses useSearchParams
function ScrollToTopClient() {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	useEffect(() => {
		// Scroll to top when the route (pathname or search params) changes
		window.scrollTo({ top: 0, behavior: "instant" });
	}, [pathname, searchParams]);

	// This component does not render anything
	return null;
}

// Wrapper component with Suspense boundary
export function ScrollToTop() {
	return (
		<Suspense fallback={null}>
			<ScrollToTopClient />
		</Suspense>
	);
}
