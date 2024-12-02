"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";

interface LoginFormProps {
	redirectTo?: string;
}

export function LoginForm({ redirectTo }: LoginFormProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [mounted, setMounted] = useState(false);

	// Handle hydration mismatch
	useEffect(() => {
		setMounted(true);
	}, []);

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsLoading(true);
		setError("");

		const formData = new FormData(event.currentTarget);
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;

		try {
			const response = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Failed to login");
			}

			// Redirect to the original destination or account page
			router.push(redirectTo || "/account");
			router.refresh();
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	}

	if (!mounted) {
		return (
			<div className="w-full h-[400px] flex items-center justify-center">
				<Icons.spinner className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Sign In</CardTitle>
				<CardDescription>Enter your email and password to access your account</CardDescription>
			</CardHeader>
			<form onSubmit={onSubmit} suppressHydrationWarning>
				<CardContent className="space-y-4">
					{error && (
						<Alert variant="destructive">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input id="email" name="email" type="email" placeholder="name@example.com" required disabled={isLoading} suppressHydrationWarning />
					</div>
					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input id="password" name="password" type="password" required disabled={isLoading} suppressHydrationWarning />
					</div>
				</CardContent>
				<CardFooter className="flex flex-col space-y-4">
					<Button type="submit" className="w-full" disabled={isLoading}>
						{isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
						Sign In
					</Button>
					<Button variant="outline" type="button" className="w-full" onClick={() => router.push("/register")}>
						Create Account
					</Button>
					<Button variant="link" type="button" className="w-full" onClick={() => router.push("/forgot-password")}>
						Forgot Password?
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
