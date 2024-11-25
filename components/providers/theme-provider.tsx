"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export interface ThemeProviderProps {
	children: React.ReactNode;
	attribute?: "class" | "data-theme";
	defaultTheme?: string;
	enableSystem?: boolean;
	storageKey?: string;
}

export function ThemeProvider({ children, attribute = "class", defaultTheme = "light", enableSystem = false, storageKey = "theme", ...props }: ThemeProviderProps) {
	return (
		<NextThemesProvider attribute={attribute} defaultTheme={defaultTheme} enableSystem={enableSystem} storageKey={storageKey} {...props}>
			{children}
		</NextThemesProvider>
	);
}
