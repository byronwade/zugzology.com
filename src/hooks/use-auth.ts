import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type UseAuthOptions = {
	redirectTo?: string;
	onAuthStateChange?: (isAuthenticated: boolean, user?: User) => void;
};

type User = {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
};

export function useAuth(options: UseAuthOptions = {}) {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
	const [csrfToken, setCsrfToken] = useState<string | null>(null);
	const router = useRouter();

	// Define checkAuth first since other functions depend on it
	const checkAuth = useCallback(
		async (silent = false) => {
			try {
				if (!silent) {
					setIsLoading(true);
				}

				const response = await fetch("/api/auth/check", {
					method: "GET",
					headers: {
						"Cache-Control": "no-cache, no-store, must-revalidate",
						Pragma: "no-cache",
					},
				});

				const data = await response.json();

				// Update authentication state
				setIsAuthenticated(data.authenticated);

				if (data.authenticated && data.user) {
					setUser(data.user);

					// Store CSRF token if available
					if (data.csrfToken) {
						setCsrfToken(data.csrfToken);
						localStorage.setItem("csrfToken", data.csrfToken);
					} else {
						// Restore from localStorage if not in response
						const storedToken = localStorage.getItem("csrfToken");
						if (storedToken) {
							setCsrfToken(storedToken);
						}
					}

					// Notify about auth state change
					if (options.onAuthStateChange) {
						options.onAuthStateChange(true, data.user);
					}

					return true;
				}
				setUser(null);

				// Notify about auth state change
				if (options.onAuthStateChange) {
					options.onAuthStateChange(false);
				}

				// Redirect if specified and not authenticated
				if (!(silent || data.authenticated) && options.redirectTo) {
					router.push(`/login?from=${encodeURIComponent(options.redirectTo)}`);
				}

				return false;
			} catch (_err) {
				setIsAuthenticated(false);
				setUser(null);

				// Notify about auth state change
				if (options.onAuthStateChange) {
					options.onAuthStateChange(false);
				}

				return false;
			} finally {
				if (!silent) {
					setIsLoading(false);
				}
			}
		},
		[router, options]
	);

	const login = useCallback(
		async (email: string, password: string) => {
			try {
				setIsLoading(true);
				setError(null);

				const response = await fetch("/api/auth/login", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email, password }),
				});

				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.message || "Login failed");
				}

				// Store CSRF token if provided
				if (data.csrfToken) {
					setCsrfToken(data.csrfToken);
					localStorage.setItem("csrfToken", data.csrfToken);
				}

				// Immediately check authentication to update state
				await checkAuth();

				if (data.redirectUrl) {
					router.push(data.redirectUrl);
					return;
				}

				if (options.redirectTo) {
					router.push(options.redirectTo);
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : "Login failed");
				throw err;
			} finally {
				setIsLoading(false);
			}
		},
		[router, options.redirectTo, checkAuth]
	);

	const register = useCallback(
		async (firstName: string, lastName: string, email: string, password: string) => {
			try {
				setIsLoading(true);
				setError(null);

				const response = await fetch("/api/auth/register", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ firstName, lastName, email, password }),
				});

				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.message || "Registration failed");
				}

				// If auto-login was performed
				if (data.autoLogin) {
					// Store CSRF token if provided
					if (data.csrfToken) {
						setCsrfToken(data.csrfToken);
						localStorage.setItem("csrfToken", data.csrfToken);
					}

					// Immediately check authentication to update state
					await checkAuth();

					if (data.redirectUrl) {
						router.push(data.redirectUrl);
						return;
					}
				}

				return data;
			} catch (err) {
				setError(err instanceof Error ? err.message : "Registration failed");
				throw err;
			} finally {
				setIsLoading(false);
			}
		},
		[router, checkAuth]
	);

	const logout = useCallback(async () => {
		try {
			setIsLoading(true);

			// Include CSRF token in the request if available
			const headers: Record<string, string> = { "Content-Type": "application/json" };
			if (csrfToken) {
				headers["X-CSRF-Token"] = csrfToken;
			}

			const response = await fetch("/api/auth/logout", {
				method: "POST",
				headers,
			});

			await response.json();

			// Clear local storage and state
			localStorage.removeItem("csrfToken");
			setCsrfToken(null);
			setUser(null);
			setIsAuthenticated(false);

			// Notify about auth state change
			if (options.onAuthStateChange) {
				options.onAuthStateChange(false);
			}
			router.push("/login");
		} catch (_err) {
			// Silently handle logout errors - user experience shouldn't be affected
			setError("Failed to logout");
		} finally {
			setIsLoading(false);
		}
	}, [router, csrfToken, options]);

	useEffect(() => {
		// Check authentication status on mount
		checkAuth();

		// Set up periodic silent auth check (every 5 minutes)
		const interval = setInterval(
			() => {
				checkAuth(true);
			},
			5 * 60 * 1000
		);

		return () => clearInterval(interval);
	}, [checkAuth]);

	return {
		login,
		register,
		logout,
		checkAuth,
		isLoading,
		error,
		user,
		isAuthenticated,
		csrfToken,
	};
}
