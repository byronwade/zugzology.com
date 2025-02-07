"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Cart } from "@/lib/types";
import { nanoid } from "nanoid";

interface CartContext {
	cart: Cart | null;
	isLoading: boolean;
	error: Error | null;
}

const CartContext = createContext<CartContext>({
	cart: null,
	isLoading: false,
	error: null,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [cart, setCart] = useState<Cart | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [cartId, setCartId] = useLocalStorage<string | null>("cartId", null);
	const [shouldInitialize, setShouldInitialize] = useState(true);
	const mountedRef = useRef(false);
	const initializingRef = useRef(false);
	const sessionId = useRef(nanoid(7));
	const attemptsRef = useRef(0);

	// Mounting effect
	useEffect(() => {
		console.log(`[Cart Provider ${sessionId.current}] Mounting component, cartId:`, cartId || "none");
		mountedRef.current = true;
		return () => {
			console.log(`[Cart Provider ${sessionId.current}] Unmounting component`);
			mountedRef.current = false;
		};
	}, []);

	// Cart initialization effect
	useEffect(() => {
		const MAX_ATTEMPTS = 3;
		const RETRY_DELAY = 1000;

		async function initCart() {
			// Skip if conditions aren't met
			if (!shouldInitialize || !mountedRef.current || attemptsRef.current >= MAX_ATTEMPTS || initializingRef.current) {
				console.log(`[Cart Provider ${sessionId.current}] Skipping initialization:`, {
					shouldInit: shouldInitialize,
					mounted: mountedRef.current,
					attempts: attemptsRef.current,
					maxAttempts: MAX_ATTEMPTS,
					initializing: initializingRef.current,
				});
				return;
			}

			initializingRef.current = true;
			console.log(`[Cart Provider ${sessionId.current}] Starting initialization attempt ${attemptsRef.current + 1}/${MAX_ATTEMPTS}`);

			try {
				setIsLoading(true);
				setError(null);

				console.log(`[Cart Provider ${sessionId.current}] Sending POST request with cartId:`, cartId || "none");
				const response = await fetch("/api/cart", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ cartId }),
				});

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const currentCart = await response.json();
				console.log(`[Cart Provider ${sessionId.current}] Received cart response:`, {
					id: currentCart?.id,
					lines: currentCart?.lines?.edges?.length || 0,
				});

				if (mountedRef.current) {
					if (currentCart.id) {
						setCart(currentCart);
						// Only set cartId if it's different to prevent loops
						if (currentCart.id !== cartId) {
							setCartId(currentCart.id);
						}
						console.log(`[Cart Provider ${sessionId.current}] Cart initialized successfully:`, currentCart.id);
						setShouldInitialize(false);
					} else {
						throw new Error("Invalid cart response");
					}
				}
			} catch (err) {
				console.error(`[Cart Provider ${sessionId.current}] Initialization error:`, err);
				if (mountedRef.current) {
					setError(err instanceof Error ? err : new Error("Failed to create cart"));
					attemptsRef.current += 1;

					if (attemptsRef.current < MAX_ATTEMPTS) {
						console.log(`[Cart Provider ${sessionId.current}] Scheduling retry in ${RETRY_DELAY}ms (attempt ${attemptsRef.current}/${MAX_ATTEMPTS})`);
						setTimeout(() => {
							if (mountedRef.current) {
								initializingRef.current = false;
								initCart();
							}
						}, RETRY_DELAY);
					} else {
						console.log(`[Cart Provider ${sessionId.current}] Max attempts reached, giving up`);
						setShouldInitialize(false);
					}
				}
			} finally {
				if (mountedRef.current) {
					setIsLoading(false);
					if (!error && cart) {
						initializingRef.current = false;
					}
				}
			}
		}

		if (shouldInitialize) {
			initCart();
		}
	}, [shouldInitialize, cartId]);

	// Reset initialization when cartId changes externally
	useEffect(() => {
		if (!cart || cart.id !== cartId) {
			console.log(`[Cart Provider ${sessionId.current}] CartId changed externally, triggering re-initialization`);
			setShouldInitialize(true);
			attemptsRef.current = 0;
		}
	}, [cartId, cart]);

	return <CartContext.Provider value={{ cart, isLoading, error }}>{children}</CartContext.Provider>;
}

export function useCart() {
	const context = useContext(CartContext);
	if (!context) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
}
