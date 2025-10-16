"use client";

import { Home, RefreshCw, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";

const productErrorMessages = [
	"Our spore network hit a snag",
	"The cultivation data needs a moment",
	"Unable to load product information",
	"Something went wrong with this product",
];

type ProductErrorProps = {
	error: Error & { digest?: string };
	reset: () => void;
};

export default function ProductError({ error, reset }: ProductErrorProps) {
	const funnyMessage = productErrorMessages[Math.floor(Math.random() * productErrorMessages.length)];

	useEffect(() => {
		if (typeof window !== "undefined" && window.gtag) {
			window.gtag("event", "exception", {
				description: error.message || "Product loading error",
				fatal: false,
				error_type: "product_loading_error",
				error_digest: error.digest,
			});
		}
	}, [error]);

	return (
		<div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
			{/* Full-screen Background Image */}
			<Image
				alt="Mushrooms in nature"
				className="object-cover"
				fill
				priority
				quality={90}
				src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1920&q=80"
			/>

			{/* Dark Gradient Overlay */}
			<div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/75 to-black/85" />

			{/* Content */}
			<div className="relative z-10 mx-auto max-w-2xl px-6 py-16 text-center">
				{/* Main Message */}
				<div className="mb-12 space-y-6">
					<h1 className="font-bold text-6xl text-white tracking-tight sm:text-7xl">Something Went Wrong</h1>

					<p className="text-2xl text-white/90 sm:text-3xl">{funnyMessage}</p>

					<p className="mx-auto max-w-md text-lg text-white/70">
						We're having trouble loading this product. This might be temporary—try refreshing the page.
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
						<Link href="/products">
							<ShoppingBag className="h-5 w-5" />
							All Products
						</Link>
					</Button>

					<Button asChild className="min-w-[180px] gap-2 text-white hover:bg-white/10" size="lg" variant="ghost">
						<Link href="/">
							<Home className="h-5 w-5" />
							Return to Home
						</Link>
					</Button>
				</div>

				{/* Help Text */}
				<div className="mt-12 rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
					<p className="mb-4 font-medium text-sm text-white/90">What you can try:</p>
					<ul className="space-y-2 text-left text-sm text-white/70">
						<li className="flex gap-3">
							<span className="text-white/90">•</span>
							<span>Click "Try Again" to reload the product</span>
						</li>
						<li className="flex gap-3">
							<span className="text-white/90">•</span>
							<span>Check your internet connection</span>
						</li>
						<li className="flex gap-3">
							<span className="text-white/90">•</span>
							<span>Browse our other products</span>
						</li>
						<li className="flex gap-3">
							<span className="text-white/90">•</span>
							<span>Contact support if the issue persists</span>
						</li>
					</ul>
				</div>
			</div>

			{/* Structured Data */}
			<script
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "WebPage",
						name: "Product Loading Error - Zugzology",
						description: "Unable to load product information.",
						mainEntity: {
							"@type": "ErrorPage",
							description: error.message || "Product information could not be loaded",
						},
					}),
				}}
				type="application/ld+json"
			/>
		</div>
	);
}
