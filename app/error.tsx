"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		// Log the error to an error reporting service
		console.error("Application error:", error);
	}, [error]);

	return (
		<div className="container flex items-center justify-center min-h-[80vh] px-4 py-8">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<div className="flex items-center space-x-2 text-amber-500 mb-2">
						<AlertTriangle className="h-5 w-5" />
						<span className="text-sm font-medium">Something went wrong</span>
					</div>
					<CardTitle className="text-2xl font-bold">Application Error</CardTitle>
					<CardDescription>{error.message || "An unexpected error occurred. Please try again."}</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-6">
					<div className="grid gap-4">
						<Button
							onClick={() => {
								// Clear any error state before resetting
								window.sessionStorage.removeItem("lastError");
								reset();
							}}
							className="w-full"
						>
							Try Again
						</Button>
						<div className="text-center text-sm text-muted-foreground">
							If you continue to experience issues, please contact our{" "}
							<Link href="/help" prefetch={false} className="underline underline-offset-4 hover:text-primary">
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
