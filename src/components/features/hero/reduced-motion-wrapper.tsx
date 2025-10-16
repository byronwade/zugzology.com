"use client";

import { useEffect, useState } from "react";

type ReducedMotionWrapperProps = {
	children: React.ReactNode;
	fallback?: React.ReactNode;
};

export function ReducedMotionWrapper({ children, fallback }: ReducedMotionWrapperProps) {
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		setPrefersReducedMotion(mediaQuery.matches);

		const handler = (event: MediaQueryListEvent) => {
			setPrefersReducedMotion(event.matches);
		};

		mediaQuery.addEventListener("change", handler);
		return () => {
			mediaQuery.removeEventListener("change", handler);
		};
	}, []);

	if (prefersReducedMotion && fallback) {
		return <>{fallback}</>;
	}

	return <>{children}</>;
}
