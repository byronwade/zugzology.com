"use client";

import { Providers as CentralizedProviders } from "@/components/providers";
import { ReactNode } from "react";

// Optimized providers using NextMaster-inspired patterns
// Now using centralized provider organization
export function Providers({ children }: { children: ReactNode }) {
	return <CentralizedProviders>{children}</CentralizedProviders>;
}
