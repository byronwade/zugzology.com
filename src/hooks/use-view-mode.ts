"use client";

import { useEffect, useState } from "react";

type ViewMode = "grid" | "list";

export function useViewMode() {
	const [mounted, setMounted] = useState(false);
	const [view, setView] = useState<ViewMode>("grid");

	// Hydration fix
	useEffect(() => {
		setMounted(true);
	}, []);

	// Load saved preference or set default based on screen width
	useEffect(() => {
		if (typeof window === 'undefined') return;

		const savedView = localStorage.getItem("viewMode") as ViewMode;
		if (savedView) {
			setView(savedView);
		} else {
			// Set default view based on screen width
			const isMobile = window.innerWidth < 768; // 768px is typical md breakpoint
			setView(isMobile ? "list" : "grid");
		}

		// Add resize listener to update view when screen size changes (if no saved preference)
		const handleResize = () => {
			if (!localStorage.getItem("viewMode")) {
				const isMobile = window.innerWidth < 768;
				setView(isMobile ? "list" : "grid");
			}
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Save preference
	const updateView = (newView: ViewMode) => {
		setView(newView);
		if (typeof window !== 'undefined') {
			localStorage.setItem("viewMode", newView);
		}
	};

	return {
		view,
		setView: updateView,
		mounted,
	};
}
