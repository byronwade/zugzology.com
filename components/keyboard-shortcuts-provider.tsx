"use client";

import { useKeyboardShortcuts } from "@/lib/hooks/use-keyboard-shortcuts";

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
	useKeyboardShortcuts();
	return <>{children}</>;
}
