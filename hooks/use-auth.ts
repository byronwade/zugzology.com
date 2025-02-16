import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UseAuthOptions {
	redirectTo?: string;
}

export function useAuth(options: UseAuthOptions = {}) {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
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
					data: data,
				});

				if (!response.ok) {
					throw new Error(data.message || "Login failed");
				}

				if (data.redirect) {
					console.log("�� [useAuth] Redirecting to:", data.redirect);
					router.push(data.redirect);
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

	const logout = useCallback(async () => {
		try {
			console.log("🔒 [useAuth] Starting logout process...");
			setIsLoading(true);
			const response = await fetch("/api/auth/logout", {
				method: "POST",
			});

			const data = await response.json();
			console.log("📦 [useAuth] Logout response:", {
				status: response.status,
				success: response.ok,
				data: data,
			});

			if (data.logoutUrl) {
				console.log("🔄 [useAuth] Redirecting to logout URL:", data.logoutUrl);
				window.location.href = data.logoutUrl;
				return;
			}

			console.log("🔄 [useAuth] Redirecting to login page");
			router.push("/login");
		} catch (err) {
			console.error("❌ [useAuth] Logout error:", err);
		} finally {
			setIsLoading(false);
		}
	}, [router]);

	const refreshToken = useCallback(async () => {
		try {
			console.log("🔄 [useAuth] Starting token refresh...");
			const response = await fetch("/api/auth/refresh", {
				method: "POST",
			});

			console.log("📦 [useAuth] Refresh response:", {
				status: response.status,
				success: response.ok,
			});

			if (!response.ok) {
				throw new Error("Token refresh failed");
			}

			return true;
		} catch (err) {
			console.error("❌ [useAuth] Token refresh error:", err);
			return false;
		}
	}, []);

	useEffect(() => {
		// Check authentication status on mount
		const checkAuth = async () => {
			try {
				console.log("🔍 [useAuth] Checking authentication status...");
				const response = await fetch("/api/auth/check", {
					method: "GET",
				});

				console.log("📦 [useAuth] Auth check response:", {
					status: response.status,
					success: response.ok,
				});

				if (!response.ok && options.redirectTo) {
					console.log("🔄 [useAuth] Not authenticated, redirecting to login");
					router.push(`/login?from=${encodeURIComponent(options.redirectTo)}`);
				}
			} catch (err) {
				console.error("❌ [useAuth] Auth check error:", err);
			} finally {
				setIsLoading(false);
			}
		};

		checkAuth();
	}, [router, options.redirectTo]);

	return {
		login,
		logout,
		refreshToken,
		isLoading,
		error,
	};
}
