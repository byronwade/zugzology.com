"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PageError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	// Error boundary component - no side effects needed

	return (
		<div className="flex min-h-[60vh] w-full items-center justify-center bg-background">
			<div className="container mx-auto px-4 py-16 text-center">
				<div className="mx-auto max-w-md">
					<AlertCircle className="mx-auto mb-4 h-16 w-16 text-destructive" />
					<h1 className="mb-2 font-bold text-3xl text-foreground">Something went wrong</h1>
					<p className="mb-6 text-muted-foreground">
						We encountered an error while loading this page. This could be a temporary issue.
					</p>
					<div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
						<Button onClick={reset} size="lg">
							Try again
						</Button>
						<Button asChild size="lg" variant="outline">
							<a href="/">Return home</a>
						</Button>
					</div>
					{error.digest && <p className="mt-4 font-mono text-muted-foreground text-sm">Error ID: {error.digest}</p>}
				</div>
			</div>
		</div>
	);
}
