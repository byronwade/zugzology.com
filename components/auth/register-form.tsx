"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, UserPlus } from "lucide-react";
import { useAuthContext } from "@/components/providers/auth-provider";

interface RegisterFormProps {
	storeName: string;
}

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

		console.log("🔐 [Client] Registration attempt started", {
			email,
			firstName,
			lastName,
			timestamp: new Date().toISOString(),
		});

		try {
			// Use the auth context register method
			const result = await register(firstName, lastName, email, password);

			console.log("🔐 [Client] Registration successful", {
				autoLogin: result.autoLogin,
				redirectUrl: result.redirectUrl,
			});

			// If autoLogin is false, redirect to login page with registered=true param
			if (!result.autoLogin) {
				router.push("/login?registered=true");
			}
			// If we have redirectUrl but no autoLogin, the hook will handle the redirect
		} catch (err) {
			console.error("🔐 [Client] Registration error:", {
				error: err instanceof Error ? err.message : "Unknown error",
				timestamp: new Date().toISOString(),
			});
			setError(err instanceof Error ? err.message : "Registration failed");
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
						<p className="text-lg">"Join our community of mushroom enthusiasts and discover the best products for your growing needs at {storeName}."</p>
					</blockquote>
				</div>
			</div>
			<div className="p-4 lg:p-8">
				<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
					<div className="flex flex-col space-y-2 text-center">
						<h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
						<p className="text-sm text-muted-foreground">Enter your information below to create your account</p>
					</div>

					{error && (
						<Alert variant="destructive">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<form onSubmit={onSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="firstName">First Name</Label>
							<Input id="firstName" name="firstName" placeholder="John" required disabled={loading} />
						</div>
						<div className="space-y-2">
							<Label htmlFor="lastName">Last Name</Label>
							<Input id="lastName" name="lastName" placeholder="Doe" required disabled={loading} />
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input id="email" name="email" type="email" placeholder="john@example.com" required disabled={loading} />
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input id="password" name="password" type="password" required disabled={loading} minLength={5} pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{5,}$" title="Password must be at least 5 characters and include at least one uppercase letter, one lowercase letter, and one number" />
							<p className="text-xs text-muted-foreground">Password must be at least 5 characters and include at least one uppercase letter, one lowercase letter, and one number</p>
						</div>
						<Button className="w-full" type="submit" disabled={loading}>
							{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
							Create Account
						</Button>
					</form>

					<p className="px-8 text-center text-sm text-muted-foreground">
						Already have an account?{" "}
						<Link href="/login" className="underline underline-offset-4 hover:text-primary">
							Sign in
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
