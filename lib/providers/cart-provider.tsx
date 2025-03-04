"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface CartContextType {
	isOpen: boolean;
	openCart: () => void;
	closeCart: () => void;
	cart: {
		totalQuantity: number;
	} | null;
	isInitialized: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
	const [isOpen, setIsOpen] = useState(false);
	const [cart, setCart] = useState<{ totalQuantity: number } | null>({ totalQuantity: 0 });
	const [isInitialized, setIsInitialized] = useState(true);

	const openCart = () => setIsOpen(true);
	const closeCart = () => setIsOpen(false);

	return (
		<CartContext.Provider
			value={{
				isOpen,
				openCart,
				closeCart,
				cart,
				isInitialized,
			}}
		>
			{children}
		</CartContext.Provider>
	);
}

export function useCart(): CartContextType {
	const context = useContext(CartContext);
	if (context === undefined) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
}
