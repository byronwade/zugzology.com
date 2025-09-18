"use client";

import { Button } from "@/components/ui/button";
import { signIn, signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthContext } from "@/components/providers/auth-provider";
import { User } from "lucide-react";

export function LoginButton({ provider = "shopify", className = "" }: { provider?: string; className?: string }) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();
	const { login } = useAuthContext();

	const handleLogin = async () => {
		try {
			setIsLoading(true);
			setError(null);

			console.log("🔒 [LoginButton] Initiating Shopify login flow");

			// Use callbackUrl to ensure we redirect to the account page after login
			const result = await signIn(provider, {
				callbackUrl: "/account",
				redirect: false, // Don't redirect automatically, we'll handle it
			});

			// Log the full result for debugging
			console.log("🔒 [LoginButton] SignIn result:", {
				ok: result?.ok,
				error: result?.error,
				status: result?.status,
				url: result?.url,
				fullResult: JSON.stringify(result),
			});

			if (result?.error) {
				// Handle specific error cases
				if (result.error.includes("invalid_client")) {
					console.error("❌ [LoginButton] Invalid client error detected");
					setError(
						"Authentication failed: The Shopify app credentials are invalid or misconfigured. Please check your Shopify app settings."
					);

					// Log detailed debugging information
					console.error("❌ [LoginButton] Debugging info for invalid_client error:", {
						provider,
						timestamp: new Date().toISOString(),
						errorDetails: result.error,
						nextAuthUrl: process.env.NEXT_PUBLIC_NEXTAUTH_URL,
						shopifyShopId: process.env.NEXT_PUBLIC_SHOPIFY_SHOP_ID,
					});
				} else if (result.error.includes("callback")) {
					setError(
						"Authentication failed: Callback URL mismatch. Please ensure the redirect URI is correctly configured in your Shopify app."
					);
				} else if (result.error.includes("OAuthCallbackError")) {
					setError("Authentication was interrupted. Please try again.");
				} else {
					setError(`Authentication failed: ${result.error}`);
				}

				console.error("❌ [LoginButton] Login error:", result.error);
			} else if (result?.url) {
				// Successful login or redirect to Shopify
				console.log("🔄 [LoginButton] Redirecting to:", result.url);

				// If the URL contains shopify.com, it's the authorization URL
				if (result.url.includes("shopify.com")) {
					console.log("🔄 [LoginButton] Redirecting to Shopify for authentication");
					// Use window.location for a full page redirect to avoid issues with iframe redirects
					window.location.href = result.url;
				} else {
					console.log("✅ [LoginButton] Login successful, redirecting to:", result.url);
					router.push(result.url);
				}
			} else {
				console.warn("⚠️ [LoginButton] No error but also no redirect URL");
				setError("Authentication process could not be completed. Please try again.");
			}
		} catch (error) {
			console.error("❌ [LoginButton] Unexpected login error:", error);
			setError("An unexpected error occurred during login. Please try again later.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="w-full">
			<Button onClick={handleLogin} className={`w-full ${className}`} disabled={isLoading}>
				{isLoading ? "Connecting to Shopify..." : "Sign in with Shopify"}
			</Button>

			{error && (
				<div className="mt-2 p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
					{error}
					{error.includes("invalid_client") && (
						<div className="mt-1 text-xs text-gray-600">
							<p>This is typically a configuration issue. Please ensure:</p>
							<ul className="list-disc pl-5 mt-1 space-y-1">
								<li>Your Shopify app credentials are correct</li>
								<li>
									The redirect URI in Shopify matches exactly:{" "}
									<code className="bg-gray-100 px-1 rounded">
										{process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/auth/callback/shopify
									</code>
								</li>
								<li>
									Your app has the required scopes:{" "}
									<code className="bg-gray-100 px-1 rounded">openid email customer-account-api:full</code>
								</li>
							</ul>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export function LogoutButton({ className = "" }: { className?: string }) {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const { logout } = useAuthContext();

	const handleLogout = async () => {
		try {
			setIsLoading(true);

			// Log out of both systems
			console.log("🔒 [LogoutButton] Logging out of both auth systems");

			// Custom auth logout
			await logout().catch((err) => console.error("Custom auth logout error:", err));

			// NextAuth logout
			await signOut({ callbackUrl: "/" }).catch((err) => console.error("NextAuth logout error:", err));
		} catch (error) {
			console.error("❌ [LogoutButton] Logout error:", error);
			router.push("/");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Button onClick={handleLogout} variant="outline" className={`w-full ${className}`} disabled={isLoading}>
			{isLoading ? "Signing out..." : "Sign out"}
		</Button>
	);
}

export function UserAccountButton() {
	const { data: session } = useSession();

	return (
		<Button
			variant="ghost"
			size="sm"
			className="flex items-center gap-2 h-9 px-3 rounded-md text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
		>
			<User className="h-5 w-5" />
			<span className="text-sm font-medium">{session?.user?.name || "Account"}</span>
		</Button>
	);
}
