"use client";

import { type CustomerAccessToken } from "@/lib/types/shopify";
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { customerAccessTokenCreateMutation } from "@/lib/shopify/mutations";
import { shopifyClient } from "@/lib/shopify/client";
import { useCart } from "@/lib/stores/cart";

interface CustomerData {
	accessToken: string | null;
	expiresAt: string | null;
}

interface CustomerContextType {
	customer: CustomerData | null;
	isLoading: boolean;
	login: (email: string, password: string) => Promise<void>;
	logout: () => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export function CustomerProvider({ children }: { children: React.ReactNode }) {
	const [customer, setCustomer] = useState<CustomerData | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const { setCart } = useCart();

	useEffect(() => {
		const storedToken = localStorage.getItem("customerAccessToken");
		if (storedToken) {
			const token = JSON.parse(storedToken);
			if (new Date(token.expiresAt) > new Date()) {
				setCustomer(token);
			} else {
				localStorage.removeItem("customerAccessToken");
			}
		}
	}, []);

	const login = useCallback(async (email: string, password: string) => {
		setIsLoading(true);
		try {
			const response = await shopifyClient.mutation<{
				customerAccessTokenCreate: {
					customerAccessToken: CustomerAccessToken | null;
					customerUserErrors: Array<{
						code: string;
						field: string[];
						message: string;
					}>;
				};
			}>(customerAccessTokenCreateMutation, {
				variables: {
					input: { email, password },
				},
			});

			const { customerAccessToken, customerUserErrors } = response.data?.customerAccessTokenCreate || {};

			if (customerUserErrors?.length) {
				throw new Error(customerUserErrors[0].message);
			}

			if (!customerAccessToken) {
				throw new Error("No access token returned");
			}

			const token = {
				accessToken: customerAccessToken.accessToken,
				expiresAt: customerAccessToken.expiresAt,
			};

			localStorage.setItem("customerAccessToken", JSON.stringify(token));
			setCustomer(token);
		} catch (error) {
			console.error("Login error:", error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	}, []);

	const logout = useCallback(() => {
		localStorage.removeItem("customerAccessToken");
		setCustomer(null);
		setCart(null);
	}, [setCart]);

	const value = useMemo(
		() => ({
			customer,
			isLoading,
			login,
			logout,
		}),
		[customer, isLoading, login, logout]
	);

	return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
}

export function useCustomer() {
	const context = useContext(CustomerContext);
	if (context === undefined) {
		throw new Error("useCustomer must be used within a CustomerProvider");
	}
	return context;
}
