"use client";

import React, { createContext, useContext, useState } from "react";

interface PromoContextType {
	showPromo: boolean;
	setShowPromo: (show: boolean) => void;
}

const PromoContext = createContext<PromoContextType | undefined>(undefined);

export function PromoProvider({ children }: { children: React.ReactNode }) {
	const [showPromo, setShowPromo] = useState(true);

	return <PromoContext.Provider value={{ showPromo, setShowPromo }}>{children}</PromoContext.Provider>;
}

export function usePromo() {
	const context = useContext(PromoContext);
	if (context === undefined) {
		throw new Error("usePromo must be used within a PromoProvider");
	}
	return context;
}
