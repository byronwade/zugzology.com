"use client";

import { Loader2, UserPlus } from "lucide-react";
import { Link } from "@/components/ui/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthContext } from "@/components/providers/auth-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
		<div className="container relative flex-col items-center justify-center md:grid lg:min-h-[calc(100vh-var(--header-height))] lg:max-w-none lg:grid-cols-2 lg:px-0">
			<div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
				<div className="absolute inset-0 bg-zinc-900" />
				<div className="relative z-20 flex items-center font-medium text-lg">
					<Link href="/">{storeName}</Link>
				</div>
				<div className="relative z-20 mt-auto">
					<blockquote className="space-y-2">
						<p className="text-lg">
							Join our community of mushroom enthusiasts and discover the best products for your growing needs at{" "}
							{storeName}.
						</p>
					</blockquote>
				</div>
			</div>
			<div className="p-4 lg:p-8">
				<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
					<div className="flex flex-col space-y-2 text-center">
						<h1 className="font-semibold text-2xl tracking-tight">Create an account</h1>
						<p className="text-muted-foreground text-sm">Enter your information below to create your account</p>
					</div>

					{error && (
						<Alert variant="destructive">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<form className="space-y-4" onSubmit={onSubmit}>
						<div className="space-y-2">
							<Label htmlFor="firstName">First Name</Label>
							<Input disabled={loading} id="firstName" name="firstName" placeholder="John" required />
						</div>
						<div className="space-y-2">
							<Label htmlFor="lastName">Last Name</Label>
							<Input disabled={loading} id="lastName" name="lastName" placeholder="Doe" required />
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
								Password must be at least 5 characters and include at least one uppercase letter, one lowercase letter,
								and one number
							</p>
						</div>
						<Button className="w-full" disabled={loading} type="submit">
							{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
							Create Account
						</Button>
					</form>

					<p className="px-8 text-center text-muted-foreground text-sm">
						Already have an account?{" "}
						<Link className="underline underline-offset-4 hover:text-primary" href="/login">
							Sign in
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
