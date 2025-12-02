"use client";

import { BookOpen, Home, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";

const blogErrorMessages = [
	"Our knowledge base needs a moment",
	"The mycelial wisdom network got tangled",
	"This article is taking a cultivation break",
	"Unable to load article content",
];

type BlogErrorProps = {
	error: Error & { digest?: string };
	reset: () => void;
};

export default function BlogError({ error, reset }: BlogErrorProps) {
	const funnyMessage = blogErrorMessages[Math.floor(Math.random() * blogErrorMessages.length)];

	useEffect(() => {
		if (typeof window !== "undefined" && window.gtag) {
			window.gtag("event", "exception", {
				description: error.message || "Blog error",
				fatal: false,
				error_type: "blog_error",
				error_digest: error.digest,
			});
		}
	}, [error]);

	return (
		<div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
			{/* Full-screen Background Image */}
			<Image
				alt="Mushroom in forest"
				className="object-cover"
				fill
				priority
				quality={90}
				src="https://images.unsplash.com/photo-1518534270498-155ba742fc44?w=1920&q=80"
			/>

			{/* Dark Gradient Overlay */}
			<div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/75 to-black/85" />

			{/* Content */}
			<div className="relative z-10 mx-auto max-w-2xl px-6 py-16 text-center">
				{/* Main Message */}
				<div className="mb-12 space-y-6">
					<h1 className="font-bold text-6xl text-white tracking-tight sm:text-7xl">Oops!</h1>

					<p className="text-2xl text-white/90 sm:text-3xl">{funnyMessage}</p>

					<p className="mx-auto max-w-md text-lg text-white/70">
						We're having trouble loading this article. Our content team has been notified.
					</p>

					{/* Technical Details (Development only) */}
					{process.env.NODE_ENV === "development" && error.message && (
						<details className="mx-auto mt-6 max-w-lg rounded-lg border border-white/10 bg-white/5 p-4 text-left backdrop-blur-sm">
							<summary className="cursor-pointer font-medium text-sm text-white/90">Technical Details</summary>
							<code className="mt-2 block text-red-400 text-xs">{error.message}</code>
							{error.digest && <code className="mt-1 block text-white/50 text-xs">Digest: {error.digest}</code>}
						</details>
					)}
				</div>

				{/* Action Buttons */}
				<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Button className="min-w-[180px] gap-2 bg-white text-black hover:bg-white/90" onClick={reset} size="lg">
						<RefreshCw className="h-5 w-5" />
						Try Again
					</Button>

					<Button
						asChild
						className="min-w-[180px] gap-2 border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
						size="lg"
						variant="outline"
					>
						<Link href="/blogs">
							<BookOpen className="h-5 w-5" />
							All Articles
						</Link>
					</Button>

					<Button asChild className="min-w-[180px] gap-2 text-white hover:bg-white/10" size="lg" variant="ghost">
						<Link href="/">
							<Home className="h-5 w-5" />
							Go Home
						</Link>
					</Button>
				</div>
			</div>

			{/* Structured Data */}
			<script
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data is safe with JSON.stringify
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "WebPage",
						name: "Blog Error - Zugzology",
						description: "An error occurred while loading this blog article.",
						mainEntity: {
							"@type": "ErrorPage",
							description: error.message || "An unexpected error occurred",
						},
					}),
				}}
				type="application/ld+json"
			/>
		</div>
	);
}
