"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { shopifyClient, customerAccessTokenCreateMutation, dedupedRequest } from "../shopify";

interface CustomerContextType {
	isAuthenticated: boolean;
	customer: any | null;
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
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
	const [customer, setCustomer] = useState<any | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [accessToken, setAccessToken] = useState<string | null>(null);

	useEffect(() => {
		// Check for existing token in localStorage
		const token = typeof window !== "undefined" ? localStorage.getItem("shopifyCustomerToken") : null;
		if (token) {
			setAccessToken(token);
			fetchCustomerData(token);
		}
	}, []);

	async function fetchCustomerData(token: string) {
		try {
			const { data } = await dedupedRequest(getCustomerQuery, {
				customerAccessToken: token,
			});

			if (data?.customer) {
				setCustomer(data.customer);
				setIsAuthenticated(true);
			}
		} catch (error) {
			console.error("Error fetching customer data:", error);
			logout();
		}
	}

	async function login(email: string, password: string) {
		try {
			const { data } = await dedupedRequest(customerAccessTokenCreateMutation, {
				input: {
					email,
					password,
				},
			});

			if (data?.customerAccessTokenCreate?.customerAccessToken?.accessToken) {
				const token = data.customerAccessTokenCreate.customerAccessToken.accessToken;
				if (typeof window !== "undefined") {
					localStorage.setItem("shopifyCustomerToken", token);
				}
				setAccessToken(token);
				await fetchCustomerData(token);
			} else {
				throw new Error(data?.customerAccessTokenCreate?.customerUserErrors[0]?.message || "Login failed");
			}
		} catch (error) {
			throw error;
		}
	}

	async function logout() {
		if (typeof window !== "undefined") {
			localStorage.removeItem("shopifyCustomerToken");
		}
		setAccessToken(null);
		setCustomer(null);
		setIsAuthenticated(false);
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
