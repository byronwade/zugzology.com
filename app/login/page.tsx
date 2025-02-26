import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginButton } from "@/components/auth/next-auth-buttons";
import Link from "next/link";
import { Metadata } from "next";
import { getSiteSettings } from "@/lib/actions/shopify";

export const metadata: Metadata = {
	title: "Login | Zugzology",
	description: "Sign in to your Zugzology account to manage your orders and profile",
};

export default async function LoginPage() {
	const session = await auth();
	const siteSettings = await getSiteSettings();
	const storeName = siteSettings?.name || "Zugzology";

	// If already authenticated, redirect to account page
	if (session) {
		redirect("/account");
	}

	return (
		<div className="container relative flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0 lg:min-h-[calc(100vh-var(--header-height))]">
			<div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
				<div className="absolute inset-0 bg-zinc-900" />
				<div className="relative z-20 flex items-center text-lg font-medium">
					<Link href="/">{storeName}</Link>
				</div>
				<div className="relative z-20 mt-auto">
					<blockquote className="space-y-2">
						<p className="text-lg">"Welcome back to {storeName}. Sign in to access your account and explore our premium mushroom growing supplies."</p>
					</blockquote>
				</div>
			</div>
			<div className="p-4 lg:p-8">
				<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
					<div className="flex flex-col space-y-2 text-center">
						<h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
						<p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
					</div>

					<div className="grid gap-4">
						<LoginButton className="w-full" />
						<div className="text-center text-sm text-muted-foreground">
							Don't have an account?{" "}
							<Link href="/register" className="underline underline-offset-4 hover:text-primary">
								Create one
							</Link>
						</div>
						<div className="text-center text-xs text-muted-foreground">
							By continuing, you agree to our{" "}
							<Link href="/terms" className="underline underline-offset-4 hover:text-primary">
								Terms of Service
							</Link>{" "}
							and{" "}
							<Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
								Privacy Policy
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
