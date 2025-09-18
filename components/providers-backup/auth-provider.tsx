"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSession } from "next-auth/react";

// Define the authentication context types
interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	provider: string;
	hasToken: boolean;
}

interface AuthContextType {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	csrfToken: string | null;
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
	checkAuth: () => Promise<void>;
}

interface AuthProviderProps {
	children: React.ReactNode;
}

interface ExtendedSession {
	user?: {
		id?: string;
		name?: string | null;
		email?: string | null;
		image?: string | null;
	};
	shopifyAccessToken?: string;
}

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
			console.log("[Auth Provider] Auth state changed:", { isAuthenticated, user });
		},
	});

	// Combined auth state - prioritize NextAuth for Shopify integration
	const isAuthenticated = nextAuthAuthenticated || customAuthenticated;
	const isLoading = nextAuthLoading || customAuthLoading || !isReady;

	// Enhanced user object with Shopify token information
	const user: User | null = useMemo(() => {
		if (session) {
			return {
				id: (session as ExtendedSession).user?.id || "nextauth-user",
				email: (session as ExtendedSession).user?.email || "",
				firstName: (session as ExtendedSession).user?.name?.split(" ")[0] || "",
				lastName: (session as ExtendedSession).user?.name?.split(" ").slice(1).join(" ") || "",
				provider: "shopify",
				hasToken: !!(session as ExtendedSession).shopifyAccessToken,
			};
		}

		return customUser as User | null;
	}, [customUser, session]);

	// Set up ready state after initial check
	useEffect(() => {
		const timer = setTimeout(() => {
			setIsReady(true);
		}, 500); // Short delay to ensure auth state is stable

		return () => clearTimeout(timer);
	}, []);

	// Log auth state changes
	useEffect(() => {
		console.log("[Auth Provider] Auth state:", {
			isAuthenticated,
			isLoading,
			user: user?.email,
			provider: user?.provider,
			hasToken: user?.hasToken,
		});
	}, [isAuthenticated, isLoading, user]);

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
