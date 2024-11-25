"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { customerAccessTokenCreateMutation, dedupedRequest } from "../shopify";
import { useCart } from "@/lib/stores/cart";

interface CustomerData {
	id: string;
	firstName?: string;
	lastName?: string;
	email: string;
	orders?: {
		edges: Array<{
			node: {
				id: string;
				orderNumber: number;
				totalPrice: string;
				processedAt: string;
				fulfillmentStatus: string;
			};
		}>;
	};
}

interface CustomerContextType {
	isAuthenticated: boolean;
	customer: CustomerData | null;
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
}

interface CustomerResponse {
	customer: CustomerData;
}

interface TokenResponse {
	customerAccessTokenCreate: {
		customerAccessToken: {
			accessToken: string;
		};
		customerUserErrors: Array<{
			message: string;
		}>;
	};
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

const getCustomerQuery = `
	query getCustomer($customerAccessToken: String!) {
		customer(customerAccessToken: $customerAccessToken) {
			id
			firstName
			lastName
			email
			orders(first: 10) {
				edges {
					node {
						id
						orderNumber
						totalPrice
						processedAt
						fulfillmentStatus
					}
				}
			}
		}
	}
`;

export function CustomerProvider({ children }: { children: React.ReactNode }) {
	const [customer, setCustomer] = useState<CustomerData | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const { loadCustomerCart, clearCart } = useCart();

	useEffect(() => {
		const storedToken = typeof window !== "undefined" ? localStorage.getItem("shopifyCustomerToken") : null;
		if (storedToken) {
			void fetchCustomerData(storedToken);
		}
	}, []);

	async function fetchCustomerData(currentToken: string) {
		try {
			const { data } = await dedupedRequest<CustomerResponse>(getCustomerQuery, {
				customerAccessToken: currentToken,
			});

			if (data?.customer) {
				setCustomer(data.customer);
				setIsAuthenticated(true);
				await loadCustomerCart(data.customer.id);
			}
		} catch (error) {
			console.error("Error fetching customer data:", error);
			await logout();
		}
	}

	async function login(email: string, password: string) {
		try {
			const { data } = await dedupedRequest<TokenResponse>(customerAccessTokenCreateMutation, {
				input: { email, password },
			});

			const newToken = data?.customerAccessTokenCreate?.customerAccessToken?.accessToken;
			if (newToken) {
				localStorage.setItem("shopifyCustomerToken", newToken);
				await fetchCustomerData(newToken);
			} else {
				throw new Error(data?.customerAccessTokenCreate?.customerUserErrors[0]?.message || "Login failed");
			}
		} catch (error) {
			throw error;
		}
	}

	async function logout() {
		localStorage.removeItem("shopifyCustomerToken");
		setCustomer(null);
		setIsAuthenticated(false);
		clearCart();
	}

	return <CustomerContext.Provider value={{ isAuthenticated, customer, login, logout }}>{children}</CustomerContext.Provider>;
}

export function useCustomer() {
	const context = useContext(CustomerContext);
	if (context === undefined) {
		throw new Error("useCustomer must be used within a CustomerProvider");
	}
	return context;
}
