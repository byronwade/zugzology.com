"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from '@/components/ui/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, LogIn } from "lucide-react";
import { useAuthContext } from "@/components/providers/auth-provider";

interface LoginFormProps {
	error?: string;
	registered?: boolean;
	callbackUrl?: string;
	storeName: string;
}

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
			console.log("🔐 [Client] Login attempt started", {
				email,
				timestamp: new Date().toISOString(),
			});

			// Use the auth context login method
			await login(email, password);

			// If login is successful, it will automatically redirect
			// But we can also handle any custom redirect here
			if (callbackUrl) {
				router.push(callbackUrl);
			}
		} catch (err) {
			console.error("🔐 [Client] Login error:", {
				error: err instanceof Error ? err.message : "Unknown error",
				timestamp: new Date().toISOString(),
			});
			setError(err instanceof Error ? err.message : "Login failed");
		} finally {
			setLoading(false);
		}
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
							<p className="text-lg">Welcome back to {storeName}. Access your account to manage orders and explore our premium mushroom cultivation supplies.</p>
					</blockquote>
				</div>
			</div>
			<div className="p-4 lg:p-8">
				<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
					<div className="flex flex-col space-y-2 text-center">
						<h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
						<p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
					</div>

					{registered && (
						<Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900">
							<AlertDescription className="text-green-800 dark:text-green-200">Registration successful! Please sign in with your new account.</AlertDescription>
						</Alert>
					)}

					{error && (
						<Alert variant="destructive">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<form onSubmit={onSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input id="email" name="email" type="email" placeholder="john@example.com" required disabled={loading} />
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input id="password" name="password" type="password" required disabled={loading} />
						</div>
						<Button className="w-full" type="submit" disabled={loading}>
							{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
							Sign In
						</Button>
					</form>

					<div className="space-y-2 text-center text-sm">
						<Link href="/forgot-password" className="text-muted-foreground hover:text-primary underline underline-offset-4">
							Forgot your password?
						</Link>
						<p className="text-muted-foreground">
								Don&apos;t have an account?{" "}
							<Link href="/register" className="underline underline-offset-4 hover:text-primary">
								Sign up
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
