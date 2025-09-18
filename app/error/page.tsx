import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginButton } from "@/components/features/auth/next-auth-buttons";

export const metadata: Metadata = {
	title: "Authentication Error | Zugzology",
	description: "There was an error with your authentication request",
};

export default async function AuthErrorPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
	const params = await searchParams;
	const error = params?.error as string | undefined;
	const errorType = error || "Unknown";

	// Log the error details for debugging
	console.log("🔍 [Error Page] Authentication error:", {
		errorType,
		params: JSON.stringify(params),
	});

	const errorMessages: Record<string, { title: string; description: string; solution?: string }> = {
		Configuration: {
			title: "Configuration Error",
			description: "There was an issue with our authentication system configuration.",
			solution: "This is likely due to missing or incorrect environment variables. Please check that all required Shopify credentials are properly set.",
		},
		AccessDenied: {
			title: "Access Denied",
			description: "You do not have permission to sign in.",
			solution: "Please contact support if you believe this is an error.",
		},
		Verification: {
			title: "Verification Error",
			description: "The verification link was invalid or has expired.",
			solution: "Please try to sign in again with a fresh authentication request.",
		},
		OAuthSignin: {
			title: "OAuth Sign-in Error",
			description: "There was a problem starting the sign in process with Shopify.",
			solution: "Please ensure you're using a valid Shopify account and try again.",
		},
		OAuthCallback: {
			title: "OAuth Callback Error",
			description: "There was a problem during the Shopify authentication callback.",
			solution: "This could be due to an invalid or expired authorization code. Please try signing in again.",
		},
		invalid_client: {
			title: "Invalid Client Error",
			description: "The authentication server rejected our client credentials.",
			solution: "This is likely due to incorrect Shopify API credentials or a mismatch between the redirect URI configured in Shopify and the one used in the request.",
		},
		Default: {
			title: "Authentication Error",
			description: "An error occurred during authentication.",
			solution: "Please try again or contact support if the issue persists.",
		},
	};

	// Check if the error contains additional details (like "invalid_client")
	const lowerCaseError = typeof error === "string" ? error.toLowerCase() : "";
	const detectedErrorType = lowerCaseError.includes("invalid_client") ? "invalid_client" : lowerCaseError.includes("configuration") ? "Configuration" : errorType;

	const errorInfo = errorMessages[detectedErrorType] || errorMessages.Default;

	return (
		<div className="container flex items-center justify-center min-h-[80vh] px-4 py-8">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<div className="flex items-center space-x-2 text-amber-500 mb-2">
						<AlertTriangle className="h-5 w-5" />
						<span className="text-sm font-medium">Authentication Issue</span>
					</div>
					<CardTitle className="text-2xl font-bold">{errorInfo.title}</CardTitle>
					<CardDescription>{errorInfo.description}</CardDescription>
					{errorInfo.solution && <p className="mt-2 text-sm text-muted-foreground">{errorInfo.solution}</p>}
					{detectedErrorType === "invalid_client" && (
						<div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm">
							<p className="font-medium text-amber-800">Troubleshooting Tips:</p>
							<ul className="list-disc pl-5 mt-1 text-amber-700 space-y-1">
								<li>Verify that your Shopify API credentials are correct</li>
									<li>Ensure the redirect URI matches what&apos;s configured in Shopify</li>
								<li>Check that your Shopify app has the necessary scopes</li>
								<li>Verify that the NEXTAUTH_URL environment variable is set correctly</li>
								<li>Make sure your Shopify app is properly configured in the Shopify Partner Dashboard</li>
							</ul>
						</div>
					)}
				</CardHeader>
				<CardContent className="grid gap-6">
					<div className="grid gap-4">
						<LoginButton className="w-full" />
						<div className="text-center text-sm text-muted-foreground">
							If you continue to experience issues, please contact our{" "}
							<Link href="/help" className="underline underline-offset-4 hover:text-primary">
								customer support
							</Link>
							.
						</div>
					</div>
				</CardContent>
				<CardFooter>
					<Button asChild variant="ghost" className="w-full">
						<Link href="/" prefetch={false}>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to home
						</Link>
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
