import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UseAuthOptions {
	redirectTo?: string;
	onAuthStateChange?: (isAuthenticated: boolean, user?: any) => void;
}

interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
}

export function useAuth(options: UseAuthOptions = {}) {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
	const [csrfToken, setCsrfToken] = useState<string | null>(null);
	const router = useRouter();

	const login = useCallback(
		async (email: string, password: string) => {
			try {
				console.log("🔐 [useAuth] Starting login process...");
				setIsLoading(true);
				setError(null);

				const response = await fetch("/api/auth/login", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email, password }),
				});

				const data = await response.json();
				console.log("📦 [useAuth] Login response:", {
					status: response.status,
					success: response.ok,
				});

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
					console.log("🔄 [useAuth] Redirecting to:", data.redirectUrl);
					router.push(data.redirectUrl);
					return;
				}

				if (options.redirectTo) {
					console.log("🔄 [useAuth] Redirecting to:", options.redirectTo);
					router.push(options.redirectTo);
				}
			} catch (err) {
				console.error("❌ [useAuth] Login error:", err);
				setError(err instanceof Error ? err.message : "Login failed");
				throw err;
			} finally {
				setIsLoading(false);
			}
		},
		[router, options.redirectTo]
	);

	const register = useCallback(
		async (firstName: string, lastName: string, email: string, password: string) => {
			try {
				console.log("📝 [useAuth] Starting registration process...");
				setIsLoading(true);
				setError(null);

				const response = await fetch("/api/auth/register", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ firstName, lastName, email, password }),
				});

				const data = await response.json();
				console.log("📦 [useAuth] Registration response:", {
					status: response.status,
					success: response.ok,
				});

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
						console.log("🔄 [useAuth] Redirecting to:", data.redirectUrl);
						router.push(data.redirectUrl);
						return;
					}
				}

				return data;
			} catch (err) {
				console.error("❌ [useAuth] Registration error:", err);
				setError(err instanceof Error ? err.message : "Registration failed");
				throw err;
			} finally {
				setIsLoading(false);
			}
		},
		[router]
	);

	const logout = useCallback(async () => {
		try {
			console.log("🔒 [useAuth] Starting logout process...");
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

			const data = await response.json();
			console.log("📦 [useAuth] Logout response:", {
				status: response.status,
				success: response.ok,
			});

			// Clear local storage and state
			localStorage.removeItem("csrfToken");
			setCsrfToken(null);
			setUser(null);
			setIsAuthenticated(false);

			// Notify about auth state change
			if (options.onAuthStateChange) {
				options.onAuthStateChange(false);
			}

			console.log("🔄 [useAuth] Redirecting to login page");
			router.push("/login");
		} catch (err) {
			console.error("❌ [useAuth] Logout error:", err);
		} finally {
			setIsLoading(false);
		}
	}, [router, csrfToken, options.onAuthStateChange]);

	const checkAuth = useCallback(
		async (silent = false) => {
			try {
				if (!silent) {
					console.log("🔍 [useAuth] Checking authentication status...");
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

				if (!silent) {
					console.log("📦 [useAuth] Auth check response:", {
						status: response.status,
						authenticated: data.authenticated,
					});
				}

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
				} else {
					setUser(null);

					// Notify about auth state change
					if (options.onAuthStateChange) {
						options.onAuthStateChange(false);
					}

					// Redirect if specified and not authenticated
					if (!silent && !data.authenticated && options.redirectTo) {
						console.log("🔄 [useAuth] Not authenticated, redirecting to login");
						router.push(`/login?from=${encodeURIComponent(options.redirectTo)}`);
					}

					return false;
				}
			} catch (err) {
				console.error("❌ [useAuth] Auth check error:", err);
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
		[router, options.redirectTo, options.onAuthStateChange]
	);

	useEffect(() => {
		// Check authentication status on mount
		checkAuth();

		// Set up periodic silent auth check (every 5 minutes)
		const interval = setInterval(() => {
			checkAuth(true);
		}, 5 * 60 * 1000);

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
