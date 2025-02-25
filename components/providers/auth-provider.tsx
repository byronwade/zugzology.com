"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSession } from "next-auth/react";

// Define the authentication context types
interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	provider?: string;
	hasToken?: boolean;
}

interface AuthContextType {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	csrfToken: string | null;
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	register: (firstName: string, lastName: string, email: string, password: string) => Promise<any>;
	checkAuth: (silent?: boolean) => Promise<boolean>;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
	user: null,
	isAuthenticated: false,
	isLoading: false,
	csrfToken: null,
	login: async () => {},
	logout: async () => {},
	register: async () => ({}),
	checkAuth: async () => false,
});

export const useAuthContext = () => useContext(AuthContext);

interface AuthProviderProps {
	children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [isReady, setIsReady] = useState(false);

	// Get NextAuth session
	const { data: session, status: sessionStatus } = useSession();
	const nextAuthLoading = sessionStatus === "loading";
	const nextAuthAuthenticated = sessionStatus === "authenticated";

	// Initialize the custom auth hook
	const {
		login,
		register,
		logout,
		checkAuth,
		isLoading: customAuthLoading,
		user: customUser,
		isAuthenticated: customAuthenticated,
		csrfToken,
	} = useAuth({
		onAuthStateChange: (isAuthenticated, user) => {
			// This will be called whenever auth state changes
			console.log("🔒 [AuthProvider] Custom auth state changed:", { isAuthenticated, user });
		},
	});

	// Combined auth state - prioritize NextAuth for Shopify integration
	const isAuthenticated = nextAuthAuthenticated || customAuthenticated;
	const isLoading = nextAuthLoading || customAuthLoading || !isReady;

	// Enhanced user object with Shopify token information
	const user = session?.user
		? {
				id: session.user.id || "nextauth-user",
				email: session.user.email || "",
				firstName: session.user.name?.split(" ")[0] || "",
				lastName: session.user.name?.split(" ").slice(1).join(" ") || "",
				provider: "shopify",
				hasToken: !!session.shopifyAccessToken,
		  }
		: customUser;

	// Log combined auth state with token information
	useEffect(() => {
		console.log("🔒 [AuthProvider] Auth state:", {
			nextAuth: {
				authenticated: nextAuthAuthenticated,
				loading: nextAuthLoading,
				hasToken: !!session?.shopifyAccessToken,
				user: session?.user
					? {
							email: session.user.email,
							name: session.user.name,
					  }
					: null,
			},
			customAuth: {
				authenticated: customAuthenticated,
				loading: customAuthLoading,
			},
			combined: {
				authenticated: isAuthenticated,
				loading: isLoading,
			},
		});
	}, [nextAuthAuthenticated, customAuthenticated, nextAuthLoading, customAuthLoading, session, isAuthenticated, isLoading]);

	// Check for token expiration or issues
	useEffect(() => {
		if (session && !session.shopifyAccessToken && nextAuthAuthenticated) {
			console.warn("⚠️ [AuthProvider] Session exists but no Shopify access token found");
		}
	}, [session, nextAuthAuthenticated]);

	// Set up ready state after initial check
	useEffect(() => {
		const timer = setTimeout(() => {
			setIsReady(true);
		}, 500); // Short delay to ensure auth state is stable

		return () => clearTimeout(timer);
	}, []);

	// Provide the auth context to the rest of the app
	return (
		<AuthContext.Provider
			value={{
				user,
				isAuthenticated,
				isLoading,
				csrfToken,
				login,
				logout,
				register,
				checkAuth,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
