"use client";

import { useState, useEffect } from "react";

type ViewMode = "grid" | "list";

export function useViewMode(defaultView: ViewMode = "grid") {
	const [mounted, setMounted] = useState(false);
	const [view, setView] = useState<ViewMode>(defaultView);

	// Hydration fix
	useEffect(() => {
		setMounted(true);
	}, []);

	// Load saved preference
	useEffect(() => {
		const savedView = localStorage.getItem("viewMode") as ViewMode;
		if (savedView) {
			setView(savedView);
		}
	}, []);

	// Save preference
	const updateView = (newView: ViewMode) => {
		setView(newView);
		localStorage.setItem("viewMode", newView);
	};

	return {
		view,
		setView: updateView,
		mounted,
	};
}
