"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { getSession, setSession } from "@/lib/actions/session";

interface User {
	accessToken: string;
	customerAccessToken: string;
	idToken: string;
}

interface Session {
	user: User | null;
	expires: string | null;
}

interface SessionContextValue {
	session: Session | null;
	isLoading: boolean;
	error: Error | null;
	mutate: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function fetchSession(): Promise<Session> {
	try {
		const response = await fetch("/api/auth/session", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "no-store, max-age=0",
			},
			credentials: "include",
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(error || "Failed to fetch session");
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("[Session Provider] Fetch error:", error);
		throw error;
	}
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const retryCount = useRef(0);
	const mounted = useRef(false);

	// Helper function to fetch session with retry logic
	const fetchSessionWithRetry = async (retryAttempt = 0): Promise<Session | null> => {
		try {
			const data = await fetchSession();
			retryCount.current = 0; // Reset retry count on success
			return data;
		} catch (err) {
			console.error(`[Session Provider] Fetch error (attempt ${retryAttempt + 1}/${MAX_RETRIES}):`, err);

			if (retryAttempt < MAX_RETRIES - 1) {
				await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
				return fetchSessionWithRetry(retryAttempt + 1);
			}

			throw err;
		}
	};

	// Initial session fetch
	useEffect(() => {
		mounted.current = true;

		const initSession = async () => {
			try {
				const data = await fetchSessionWithRetry();
				if (mounted.current) {
					setSession(data);
					setError(null);
				}
			} catch (err) {
				if (mounted.current) {
					setError(err instanceof Error ? err : new Error("Failed to fetch session"));
					setSession(null);
				}
			} finally {
				if (mounted.current) {
					setIsLoading(false);
				}
			}
		};

		initSession();

		return () => {
			mounted.current = false;
		};
	}, []);

	// Set up periodic refresh (every 5 minutes)
	useEffect(() => {
		const interval = setInterval(async () => {
			if (!mounted.current) return;

			try {
				const data = await fetchSessionWithRetry();
				if (mounted.current) {
					setSession(data);
					setError(null);
				}
			} catch (err) {
				console.error("[Session Provider] Refresh error:", err);
				if (mounted.current) {
					setError(err instanceof Error ? err : new Error("Failed to refresh session"));
				}
			}
		}, 5 * 60 * 1000);

		return () => {
			clearInterval(interval);
		};
	}, []);

	// Set up focus refresh with debounce
	useEffect(() => {
		let timeoutId: NodeJS.Timeout;

		const handleFocus = async () => {
			if (!mounted.current) return;

			// Clear any pending refresh
			clearTimeout(timeoutId);

			// Debounce the refresh to prevent multiple rapid calls
			timeoutId = setTimeout(async () => {
				try {
					const data = await fetchSessionWithRetry();
					if (mounted.current) {
						setSession(data);
						setError(null);
					}
				} catch (err) {
					console.error("[Session Provider] Focus refresh error:", err);
					if (mounted.current) {
						setError(err instanceof Error ? err : new Error("Failed to refresh session"));
					}
				}
			}, 100);
		};

		window.addEventListener("focus", handleFocus);
		return () => {
			window.removeEventListener("focus", handleFocus);
			clearTimeout(timeoutId);
		};
	}, []);

	const value = {
		session,
		isLoading,
		error,
		mutate: async () => {
			if (!mounted.current) return;

			setIsLoading(true);
			try {
				const data = await fetchSessionWithRetry();
				if (mounted.current) {
					setSession(data);
					setError(null);
				}
			} catch (err) {
				if (mounted.current) {
					setError(err instanceof Error ? err : new Error("Failed to fetch session"));
					setSession(null);
				}
			} finally {
				if (mounted.current) {
					setIsLoading(false);
				}
			}
		},
	};

	return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
	const context = useContext(SessionContext);
	if (context === undefined) {
		throw new Error("useSession must be used within a SessionProvider");
	}
	return context;
}
