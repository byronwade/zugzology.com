"use client";

import { useSession } from "next-auth/react";
import type React from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";

// Define the authentication context types
type User = {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	provider: string;
	hasToken: boolean;
};

type AuthContextType = {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	csrfToken: string | null;
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	register: (firstName: string, lastName: string, email: string, password: string) => Promise<RegisterResult>;
	checkAuth: () => Promise<void>;
};

type RegisterResult = {
	autoLogin?: boolean;
	redirectUrl?: string;
	csrfToken?: string;
	[key: string]: unknown;
};

type AuthProviderProps = {
	children: React.ReactNode;
};

type ExtendedSession = {
	user?: {
		id?: string;
		name?: string | null;
		email?: string | null;
		image?: string | null;
	};
	shopifyAccessToken?: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuthContext must be used within an AuthProvider");
	}
	return context;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [isReady, setIsReady] = useState(false);

	// Get NextAuth session
	const { data: session, status: sessionStatus } = useSession();
	const nextAuthLoading = sessionStatus === "loading";
	const nextAuthAuthenticated = sessionStatus === "authenticated";
	const sessionHasCustomerToken = !!(session as ExtendedSession | null)?.shopifyAccessToken;

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
		onAuthStateChange: (_isAuthenticated, _user) => {},
	});

	// Combined auth state - require a usable customer token
	const isAuthenticated = (nextAuthAuthenticated && sessionHasCustomerToken) || customAuthenticated;
	const isLoading = nextAuthLoading || customAuthLoading || !isReady;

	// Enhanced user object with Shopify token information
	const user: User | null = useMemo(() => {
		if (session && sessionHasCustomerToken) {
			return {
				id: (session as ExtendedSession).user?.id || "nextauth-user",
				email: (session as ExtendedSession).user?.email || "",
				firstName: (session as ExtendedSession).user?.name?.split(" ")[0] || "",
				lastName: (session as ExtendedSession).user?.name?.split(" ").slice(1).join(" ") || "",
				provider: "shopify",
				hasToken: sessionHasCustomerToken,
			};
		}

		return customUser as User | null;
	}, [customUser, session, sessionHasCustomerToken]);

	// Set up ready state after initial check
	useEffect(() => {
		const timer = setTimeout(() => {
			setIsReady(true);
		}, 500); // Short delay to ensure auth state is stable

		return () => clearTimeout(timer);
	}, []);

	// Log auth state changes
	useEffect(() => {}, []);

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
				checkAuth: async () => {
					await checkAuth(true);
					return;
				},
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
