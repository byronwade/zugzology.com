"use client";

import { useEffect } from "react";
import Image from "next/image";
import { RefreshCw, Home, MessageCircle } from "lucide-react";
import { Link } from "@/components/ui/link";
import { Button } from "@/components/ui/button";

const errorMessages = [
	"Our mycelium network got tangled",
	"Something spore-adic happened",
	"The cultivation process hit a snag",
	"Our fungi network needs a moment",
];

const getRandomMessage = () => errorMessages[Math.floor(Math.random() * errorMessages.length)];

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		if (typeof window !== "undefined" && window.gtag) {
			window.gtag("event", "exception", {
				description: error.message || "Unknown error",
				fatal: false,
				error_type: "application_error",
				error_digest: error.digest,
			});
		}
		console.error("Application error:", error);
	}, [error]);

	const humorousMessage = getRandomMessage();

	return (
		<div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
			{/* Full-screen Background Image */}
			<Image
				src="https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=1920&q=80"
				alt="Mystical mushrooms"
				fill
				className="object-cover"
				priority
				quality={90}
			/>

			{/* Dark Gradient Overlay */}
			<div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/80" />

			{/* Content */}
			<div className="relative z-10 mx-auto max-w-2xl px-6 py-16 text-center">
				{/* Main Message */}
				<div className="mb-12 space-y-6">
					<h1 className="font-bold text-6xl text-white tracking-tight sm:text-7xl md:text-8xl">
						Oops!
					</h1>

					<p className="text-2xl text-white/90 sm:text-3xl">
						{humorousMessage}
					</p>

					<p className="mx-auto max-w-md text-lg text-white/70">
						Don't worry, we're cultivating a solution. Our team has been notified.
					</p>

					{/* Technical Details (Development only) */}
					{process.env.NODE_ENV === "development" && error.message && (
						<details className="mx-auto mt-6 max-w-lg rounded-lg border border-white/10 bg-white/5 p-4 text-left backdrop-blur-sm">
							<summary className="cursor-pointer font-medium text-sm text-white/90">Technical Details</summary>
							<code className="mt-2 block text-xs text-red-400">{error.message}</code>
							{error.digest && <code className="mt-1 block text-xs text-white/50">Digest: {error.digest}</code>}
						</details>
					)}
				</div>

				{/* Action Buttons */}
				<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Button
						onClick={reset}
						size="lg"
						className="min-w-[180px] gap-2 bg-white text-black hover:bg-white/90"
					>
						<RefreshCw className="h-5 w-5" />
						Try Again
					</Button>

					<Button
						asChild
						variant="outline"
						size="lg"
						className="min-w-[180px] gap-2 border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
					>
						<Link href="/">
							<Home className="h-5 w-5" />
							Go Home
						</Link>
					</Button>
				</div>

				{/* Support Link */}
				<div className="mt-8">
					<Link
						href="/help"
						className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white/90"
					>
						<MessageCircle className="h-4 w-4" />
						Contact Support
					</Link>
				</div>
			</div>

			{/* Structured Data */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "WebPage",
						name: "Application Error - Zugzology",
						description: "An unexpected error occurred.",
						mainEntity: {
							"@type": "ErrorPage",
							description: error.message || "An unexpected error occurred",
						},
					}),
				}}
			/>
		</div>
	);
}
