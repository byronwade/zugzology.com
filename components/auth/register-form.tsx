"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";

export function RegisterForm() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsLoading(true);
		setError("");

		const formData = new FormData(event.currentTarget);
		const firstName = formData.get("firstName") as string;
		const lastName = formData.get("lastName") as string;
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;
		const confirmPassword = formData.get("confirmPassword") as string;

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			setIsLoading(false);
			return;
		}

		try {
			console.log("Starting registration process...");

			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify({
					firstName,
					lastName,
					email,
					password,
				}),
			});

			console.log("Registration response status:", response.status);
			const data = await response.json();
			console.log("Registration response data:", data);

			if (!response.ok) {
				throw new Error(data.message || "Failed to create account");
			}

			console.log("Registration successful, redirecting...");
			router.push("/login?registered=true");
			router.refresh();
		} catch (err) {
			console.error("Registration error details:", err);
			setError(err instanceof Error ? err.message : "An error occurred during registration");
		} finally {
			setIsLoading(false);
		}
	}

	if (!mounted) {
		return (
			<div className="w-full h-[600px] flex items-center justify-center">
				<Icons.spinner className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Create Account</CardTitle>
				<CardDescription>Enter your details to create a new account</CardDescription>
			</CardHeader>
			<form onSubmit={onSubmit} suppressHydrationWarning>
				<CardContent className="space-y-4">
					{error && (
						<Alert variant="destructive">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="firstName">First Name</Label>
							<Input id="firstName" name="firstName" autoComplete="given-name" required disabled={isLoading} suppressHydrationWarning />
						</div>
						<div className="space-y-2">
							<Label htmlFor="lastName">Last Name</Label>
							<Input id="lastName" name="lastName" autoComplete="family-name" required disabled={isLoading} suppressHydrationWarning />
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input id="email" name="email" type="email" autoComplete="email" placeholder="name@example.com" required disabled={isLoading} suppressHydrationWarning />
					</div>
					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input id="password" name="password" type="password" autoComplete="new-password" required disabled={isLoading} suppressHydrationWarning minLength={5} />
					</div>
					<div className="space-y-2">
						<Label htmlFor="confirmPassword">Confirm Password</Label>
						<Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required disabled={isLoading} suppressHydrationWarning minLength={5} />
					</div>
				</CardContent>
				<CardFooter className="flex flex-col space-y-4">
					<Button type="submit" className="w-full" disabled={isLoading}>
						{isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
						{isLoading ? "Creating Account..." : "Create Account"}
					</Button>
					<Button variant="outline" type="button" className="w-full" onClick={() => router.push("/login")}>
						Already have an account? Sign In
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
