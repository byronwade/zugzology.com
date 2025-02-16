"use client";

import { useEffect } from "react";

type KeyCombo = string;

export function useKeyboardShortcut(keyCombo: KeyCombo, callback: () => void) {
	useEffect(() => {
		const keys = keyCombo.toLowerCase().split("+");

		function handleKeyDown(event: KeyboardEvent) {
			const pressedKey = event.key.toLowerCase();
			const isShiftPressed = event.shiftKey;
			const isCtrlPressed = event.ctrlKey;
			const isAltPressed = event.altKey;
			const isMetaPressed = event.metaKey;

			const hasShift = keys.includes("shift");
			const hasCtrl = keys.includes("ctrl");
			const hasAlt = keys.includes("alt");
			const hasMeta = keys.includes("meta");

			// Check if all modifier keys match
			const modifiersMatch = isShiftPressed === hasShift && isCtrlPressed === hasCtrl && isAltPressed === hasAlt && isMetaPressed === hasMeta;

			// Get the main key (last one in the combo)
			const mainKey = keys[keys.length - 1];

			// Check if the pressed key matches and all modifiers match
			if (pressedKey === mainKey && modifiersMatch) {
				event.preventDefault();
				callback();
			}
		}

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [keyCombo, callback]);
}
