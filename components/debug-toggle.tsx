"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function DebugToggle() {
	const [isDebugEnabled, setIsDebugEnabled] = useState(false);

	// Initialize state from localStorage on mount
	useEffect(() => {
		const debugSetting = localStorage.getItem("debug");
		setIsDebugEnabled(debugSetting === "true");
	}, []);

	// Update localStorage when state changes
	const handleToggleDebug = (enabled: boolean) => {
		setIsDebugEnabled(enabled);
		localStorage.setItem("debug", enabled ? "true" : "false");

		// Force reload to apply changes
		window.location.reload();
	};

	return (
		<div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-lg border shadow-sm">
			<Switch id="debug-mode" checked={isDebugEnabled} onCheckedChange={handleToggleDebug} />
			<Label htmlFor="debug-mode" className="text-xs font-medium">
				Debug Mode
			</Label>
		</div>
	);
}
