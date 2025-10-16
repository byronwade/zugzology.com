"use client";

import { Loader2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthContext } from "@/components/providers/auth-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/components/ui/link";

export type RegisterFormProps = {
	storeName: string;
};

export function RegisterForm({ storeName }: RegisterFormProps) {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const { register } = useAuthContext();

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		setLoading(true);

		const formData = new FormData(event.currentTarget);
		const firstName = formData.get("firstName") as string;
		const lastName = formData.get("lastName") as string;
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;

		try {
			// Use the auth context register method
			const result = await register(firstName, lastName, email, password);

			// If autoLogin is false, redirect to login page with registered=true param
			if (!result?.autoLogin) {
				router.push("/login?registered=true");
			}
			// If we have redirectUrl but no autoLogin, the hook will handle the redirect
		} catch (err) {
			setError(err instanceof Error ? err.message : "Registration failed");
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
							<li className="font-medium text-foreground">Create Account</li>
						</ol>
					</nav>

					<div className="space-y-6">
						<h1 className="font-bold text-4xl tracking-tight md:text-5xl lg:text-6xl">
							Join the
							<br />
							<span className="text-primary">{storeName}</span>
							<br />
							Community
						</h1>
						<p className="max-w-md text-lg text-muted-foreground">
							Create your account to unlock exclusive deals, track orders, and connect with fellow mycology enthusiasts.
						</p>
					</div>
				</div>

				{/* Benefits List */}
				<div className="mt-12 space-y-4">
					<div className="flex items-start space-x-3">
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
							<svg
								className="h-4 w-4 text-primary"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								viewBox="0 0 24 24"
							>
								<path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</div>
						<div>
							<h3 className="font-medium text-foreground">Exclusive Member Discounts</h3>
							<p className="text-muted-foreground text-sm">Access special pricing and early product launches</p>
						</div>
					</div>
					<div className="flex items-start space-x-3">
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
							<svg
								className="h-4 w-4 text-primary"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								viewBox="0 0 24 24"
							>
								<path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</div>
						<div>
							<h3 className="font-medium text-foreground">Order Tracking & History</h3>
							<p className="text-muted-foreground text-sm">Manage your purchases and track shipments in real-time</p>
						</div>
					</div>
					<div className="flex items-start space-x-3">
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
							<svg
								className="h-4 w-4 text-primary"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								viewBox="0 0 24 24"
							>
								<path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</div>
						<div>
							<h3 className="font-medium text-foreground">Expert Support</h3>
							<p className="text-muted-foreground text-sm">Priority access to our cultivation specialists</p>
						</div>
					</div>
				</div>
			</div>

			{/* Right Side - Registration Form */}
			<div className="flex flex-1 items-center justify-center bg-background p-8 lg:p-16">
				<div className="w-full max-w-md space-y-6">
					<div className="space-y-2">
						<h2 className="font-semibold text-2xl tracking-tight">Create your account</h2>
						<p className="text-muted-foreground text-sm">Get started with {storeName} today</p>
					</div>

					{error && (
						<Alert variant="destructive">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<form className="space-y-4" onSubmit={onSubmit}>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="firstName">First Name</Label>
								<Input disabled={loading} id="firstName" name="firstName" placeholder="John" required />
							</div>
							<div className="space-y-2">
								<Label htmlFor="lastName">Last Name</Label>
								<Input disabled={loading} id="lastName" name="lastName" placeholder="Doe" required />
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input disabled={loading} id="email" name="email" placeholder="john@example.com" required type="email" />
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								disabled={loading}
								id="password"
								minLength={5}
								name="password"
								pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{5,}$"
								required
								title="Password must be at least 5 characters and include at least one uppercase letter, one lowercase letter, and one number"
								type="password"
							/>
							<p className="text-muted-foreground text-xs">
								Must include uppercase, lowercase, and number (minimum 5 characters)
							</p>
						</div>
						<Button className="w-full" disabled={loading} type="submit">
							{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
							Create Account
						</Button>
					</form>

					<div className="space-y-4">
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-background px-2 text-muted-foreground">Already have an account?</span>
							</div>
						</div>

						<Link
							className="flex w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 font-medium text-sm hover:bg-accent hover:text-accent-foreground"
							href="/login"
						>
							Sign in instead
						</Link>
					</div>

					<p className="text-center text-muted-foreground text-xs">
						By continuing, you agree to our{" "}
						<Link className="underline underline-offset-4 hover:text-primary" href="/terms">
							Terms of Service
						</Link>{" "}
						and{" "}
						<Link className="underline underline-offset-4 hover:text-primary" href="/privacy">
							Privacy Policy
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
