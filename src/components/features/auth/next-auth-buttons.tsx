"use client";

import { User } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { useAuthContext } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";

export function LoginButton({ provider = "shopify", className = "" }: { provider?: string; className?: string }) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();
	const { login } = useAuthContext();

	const handleLogin = async () => {
		try {
			setIsLoading(true);
			setError(null);

			// Use callbackUrl to ensure we redirect to the account page after login
			const result = await signIn(provider, {
				callbackUrl: "/account",
				redirect: false, // Don't redirect automatically, we'll handle it
			});

			if (result?.error) {
				// Handle specific error cases
				if (result.error.includes("invalid_client")) {
					setError(
						"Authentication failed: The Shopify app credentials are invalid or misconfigured. Please check your Shopify app settings."
					);
				} else if (result.error.includes("callback")) {
					setError(
						"Authentication failed: Callback URL mismatch. Please ensure the redirect URI is correctly configured in your Shopify app."
					);
				} else if (result.error.includes("OAuthCallbackError")) {
					setError("Authentication was interrupted. Please try again.");
				} else {
					setError(`Authentication failed: ${result.error}`);
				}
			} else if (result?.url) {
				// If the URL contains shopify.com, it's the authorization URL
				if (result.url.includes("shopify.com")) {
					// Use window.location for a full page redirect to avoid issues with iframe redirects
					window.location.href = result.url;
				} else {
					router.push(result.url);
				}
			} else {
				setError("Authentication process could not be completed. Please try again.");
			}
		} catch (_error) {
			setError("An unexpected error occurred during login. Please try again later.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="w-full">
			<Button className={`w-full ${className}`} disabled={isLoading} onClick={handleLogin}>
				{isLoading ? "Connecting to Shopify..." : "Sign in with Shopify"}
			</Button>

			{error && (
				<div className="mt-2 rounded-md border border-red-200 bg-red-50 p-3 text-red-500 text-sm">
					{error}
					{error.includes("invalid_client") && (
						<div className="mt-1 text-muted-foreground text-xs">
							<p>This is typically a configuration issue. Please ensure:</p>
							<ul className="mt-1 list-disc space-y-1 pl-5">
								<li>Your Shopify app credentials are correct</li>
								<li>
									The redirect URI in Shopify matches exactly:{" "}
									<code className="rounded bg-muted px-1">
										{process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/auth/callback/shopify
									</code>
								</li>
								<li>
									Your app has the required scopes:{" "}
									<code className="rounded bg-muted px-1">openid email customer-account-api:full</code>
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

			// Custom auth logout
			await logout().catch((_err) => {});

			// NextAuth logout
			await signOut({ callbackUrl: "/" }).catch((_err) => {});
		} catch (_error) {
			router.push("/");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Button className={`w-full ${className}`} disabled={isLoading} onClick={handleLogout} variant="outline">
			{isLoading ? "Signing out..." : "Sign out"}
		</Button>
	);
}

export function UserAccountButton() {
	const { data: session } = useSession();

	return (
		<Button
			className="flex h-9 items-center gap-2 rounded-md px-3 text-muted-foreground hover:bg-muted hover:text-foreground"
			size="sm"
			variant="ghost"
		>
			<User className="h-5 w-5" />
			<span className="font-medium text-sm">{session?.user?.name || "Account"}</span>
		</Button>
	);
}
