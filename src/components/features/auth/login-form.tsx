"use client";

import { Loader2, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthContext } from "@/components/providers/auth-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/components/ui/link";

export type LoginFormProps = {
	error?: string;
	registered?: boolean;
	callbackUrl?: string;
	storeName: string;
};

export function LoginForm({ error: initialError, registered, callbackUrl, storeName }: LoginFormProps) {
	const router = useRouter();
	const [error, setError] = useState<string | null>(initialError || null);
	const [loading, setLoading] = useState(false);
	const { login } = useAuthContext();

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		setLoading(true);

		const formData = new FormData(event.currentTarget);
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;

		try {
			// Use the auth context login method
			await login(email, password);

			// If login is successful, it will automatically redirect
			// But we can also handle any custom redirect here
			if (callbackUrl) {
				router.push(callbackUrl);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Login failed");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="flex min-h-screen flex-col pt-[var(--header-height)] lg:flex-row">
			{/* Left Side - Branding & Info */}
			<div className="relative flex flex-1 flex-col justify-between bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 lg:p-16">
				<div>
					{/* Breadcrumb */}
					<nav aria-label="Breadcrumb" className="mb-12">
						<ol className="flex items-center space-x-2 text-sm">
							<li>
								<Link className="text-muted-foreground hover:text-foreground" href="/">
									Home
								</Link>
							</li>
							<li className="text-muted-foreground/50">/</li>
							<li className="font-medium text-foreground">Sign In</li>
						</ol>
					</nav>

					<div className="space-y-6">
						<h1 className="font-bold text-4xl tracking-tight md:text-5xl lg:text-6xl">
							Welcome Back to
							<br />
							<span className="text-primary">{storeName}</span>
						</h1>
						<p className="max-w-md text-lg text-muted-foreground">
							Sign in to access your account, track orders, and explore premium mushroom cultivation supplies.
						</p>
					</div>
				</div>

				{/* Features List */}
				<div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
					<div className="space-y-2">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
							<svg
								className="h-5 w-5 text-primary"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								viewBox="0 0 24 24"
							>
								<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</div>
						<h3 className="font-semibold text-foreground">Secure Access</h3>
						<p className="text-muted-foreground text-sm">Enterprise-grade security with Shopify authentication</p>
					</div>
					<div className="space-y-2">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
							<svg
								className="h-5 w-5 text-primary"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								viewBox="0 0 24 24"
							>
								<path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</div>
						<h3 className="font-semibold text-foreground">Order Tracking</h3>
						<p className="text-muted-foreground text-sm">Track your orders and manage your account easily</p>
					</div>
				</div>
			</div>

			{/* Right Side - Login Form */}
			<div className="flex flex-1 items-center justify-center bg-background p-8 lg:p-16">
				<div className="w-full max-w-md space-y-6">
					<div className="space-y-2">
						<h2 className="font-semibold text-2xl tracking-tight">Sign in to your account</h2>
						<p className="text-muted-foreground text-sm">Enter your credentials to access your account</p>
					</div>

					{registered && (
						<Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
							<AlertDescription className="text-green-800 dark:text-green-200">
								Registration successful! Please sign in with your new account.
							</AlertDescription>
						</Alert>
					)}

					{error && (
						<Alert variant="destructive">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<form className="space-y-4" onSubmit={onSubmit}>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input disabled={loading} id="email" name="email" placeholder="john@example.com" required type="email" />
						</div>
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label htmlFor="password">Password</Label>
								<Link
									className="text-muted-foreground text-xs underline underline-offset-4 hover:text-primary"
									href="/forgot-password"
								>
									Forgot password?
								</Link>
							</div>
							<Input disabled={loading} id="password" name="password" required type="password" />
						</div>
						<Button className="w-full" disabled={loading} type="submit">
							{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
							Sign In
						</Button>
					</form>

					<div className="space-y-4">
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-background px-2 text-muted-foreground">New to {storeName}?</span>
							</div>
						</div>

						<Link
							className="flex w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 font-medium text-sm hover:bg-accent hover:text-accent-foreground"
							href="/register"
						>
							Create an account
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
