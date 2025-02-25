import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginButton } from "@/components/auth/next-auth-buttons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Login | Zugzology",
	description: "Sign in to your Zugzology account to manage your orders and profile",
};

export default async function LoginPage() {
	const session = await auth();

	// If already authenticated, redirect to account page
	if (session) {
		redirect("/account");
	}

	return (
		<div className="container flex items-center justify-center min-h-[80vh] px-4 py-8">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<div className="flex items-center justify-between">
						<CardTitle className="text-2xl font-bold">Login</CardTitle>
						<Button asChild variant="ghost" size="sm">
							<Link href="/">
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back to home
							</Link>
						</Button>
					</div>
					<CardDescription>Sign in to your account to access your profile and orders</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-6">
					<div className="grid gap-4">
						<LoginButton className="w-full" />
						<div className="text-center text-sm text-muted-foreground">
							By continuing, you agree to our{" "}
							<Link href="/terms" className="underline underline-offset-4">
								Terms of Service
							</Link>{" "}
							and{" "}
							<Link href="/privacy" className="underline underline-offset-4">
								Privacy Policy
							</Link>
							.
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
