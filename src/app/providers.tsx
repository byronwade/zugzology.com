"use client";

import type { ReactNode } from "react";
import { Providers as CentralizedProviders } from "@/components/providers";

// Optimized providers using NextMaster-inspired patterns
// Now using centralized provider organization
export function Providers({ children }: { children: ReactNode }) {
	return <CentralizedProviders>{children}</CentralizedProviders>;
}
