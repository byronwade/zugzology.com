"use client";

import { useEffect } from "react";
import { Link } from '@/components/ui/link';
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Script from "next/script";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		// Log the error to an error reporting service
		console.error("Application error:", error);
		
		// Track error in analytics
		if (typeof window !== 'undefined' && window.gtag) {
			window.gtag('event', 'exception', {
				description: error.message || 'Unknown error',
				fatal: false,
				error_type: 'application_error',
				error_digest: error.digest
			});
		}
	}, [error]);

	// Generate structured data for error page
	const errorStructuredData = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		"name": "Application Error - Zugzology",
		"description": "An unexpected error occurred while processing your request. Please try again or contact support.",
		"url": typeof window !== 'undefined' ? window.location.href : '',
		"mainEntity": {
			"@type": "ErrorPage",
			"description": error.message || "An unexpected error occurred"
		},
		"breadcrumb": {
			"@type": "BreadcrumbList",
			"itemListElement": [
				{
					"@type": "ListItem",
					"position": 1,
					"name": "Home",
					"item": typeof window !== 'undefined' ? window.location.origin : ''
				},
				{
					"@type": "ListItem",
					"position": 2,
					"name": "Error",
					"item": typeof window !== 'undefined' ? window.location.href : ''
				}
			]
		}
	};

	return (
		<>
			{/* JSON-LD Structured Data */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(errorStructuredData),
				}}
			/>
			
			{/* Google Analytics for Error Tracking */}
			<Script id="error-analytics" strategy="afterInteractive">
				{`
					window.dataLayer = window.dataLayer || [];
					window.dataLayer.push({
						'event': 'page_view',
						'page_type': 'error',
						'page_location': window.location.href,
						'error_message': '${error.message?.replace(/'/g, "\\'")}',
						'error_digest': '${error.digest || 'unknown'}'
					});
				`}
			</Script>
			
			<div className="container flex items-center justify-center min-h-[80vh] px-4 py-8">
				{/* Breadcrumb Navigation */}
				<nav className="absolute top-4 left-4" aria-label="Breadcrumb">
					<ol className="flex items-center space-x-2 text-sm text-gray-600">
						<li>
							<Link href="/" className="hover:text-gray-900">Home</Link>
						</li>
						<li className="text-gray-400">/</li>
						<li className="text-gray-900 font-medium">Error</li>
					</ol>
				</nav>
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
		</>
	);
}
