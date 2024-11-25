"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export interface ThemeProviderProps {
	children: React.ReactNode;
	attribute?: "class" | "data-theme";
	defaultTheme?: string;
	enableSystem?: boolean;
}

export function ThemeProvider({ children, attribute = "class", defaultTheme = "system", ...props }: ThemeProviderProps) {
	return (
		<NextThemesProvider attribute={attribute} defaultTheme={defaultTheme} {...props}>
			{children}
		</NextThemesProvider>
	);
}
