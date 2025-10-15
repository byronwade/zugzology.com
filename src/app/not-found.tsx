"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { Search, Home, ShoppingBag, BookOpen } from "lucide-react";
import { Link } from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/features/products/product-card";
import type { ShopifyProduct } from "@/lib/types";

const funnyMessages = [
	"This page is more elusive than a rare morel",
	"Lost in the mycelium network",
	"This spore hasn't landed yet",
	"Wandered off the cultivation path",
];

function NotFoundContent() {
	const [searchQuery, setSearchQuery] = useState("");
	const [recommendedProducts, setRecommendedProducts] = useState<ShopifyProduct[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [funnyMessage] = useState(() => funnyMessages[Math.floor(Math.random() * funnyMessages.length)]);

	useEffect(() => {
		if (typeof window !== "undefined" && window.gtag) {
			window.gtag("event", "page_view", {
				page_type: "404_error",
				page_location: window.location.href,
				page_title: "Page Not Found",
			});
		}

		const fetchProducts = async () => {
			try {
				const response = await fetch("/api/products?limit=4");
				const products = await response.json();
				if (Array.isArray(products)) {
					setRecommendedProducts(products);
				}
			} catch (error) {
				console.error("Failed to fetch products:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchProducts();
	}, []);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
		}
	};

	return (
		<div className="relative flex min-h-screen w-full flex-col overflow-hidden">
			{/* Full-screen Background Image */}
			<Image
				src="https://images.unsplash.com/photo-1509773896068-7fd415d91e2e?w=1920&q=80"
				alt="Beautiful mushrooms"
				fill
				className="object-cover"
				priority
				quality={90}
				unoptimized={process.env.NODE_ENV === 'development'}
			/>

			{/* Dark Gradient Overlay */}
			<div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-black/90" />

			{/* Content */}
			<div className="relative z-10 flex flex-1 flex-col">
				{/* Hero Section */}
				<div className="flex flex-1 items-center justify-center px-6 py-16">
					<div className="w-full max-w-2xl text-center">
						<div className="mb-12 space-y-6">
							<h1 className="font-bold text-9xl text-white tracking-tight sm:text-[12rem]">
								404
							</h1>

							<p className="text-2xl text-white/90 sm:text-3xl">
								{funnyMessage}
							</p>

							<p className="mx-auto max-w-md text-lg text-white/70">
								The page you're looking for doesn't exist. Let's help you find what you need.
							</p>
						</div>

						{/* Search Bar */}
						<div className="mx-auto mb-8 max-w-xl">
							<form onSubmit={handleSearch} className="flex gap-3">
								<div className="relative flex-1">
									<Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-white/40" />
									<Input
										type="search"
										placeholder="Search for mushroom supplies..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="border-white/20 bg-white/10 py-6 pl-12 text-white placeholder:text-white/40 backdrop-blur-sm focus:border-white/30 focus:bg-white/15"
									/>
								</div>
								<Button
									type="submit"
									size="lg"
									className="bg-white px-8 text-black hover:bg-white/90"
								>
									Search
								</Button>
							</form>
						</div>

						{/* Quick Links */}
						<div className="flex flex-wrap justify-center gap-4">
							<Button
								asChild
								size="lg"
								className="gap-2 bg-white text-black hover:bg-white/90"
							>
								<Link href="/products">
									<ShoppingBag className="h-5 w-5" />
									Shop Products
								</Link>
							</Button>
							<Button
								asChild
								variant="outline"
								size="lg"
								className="gap-2 border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
							>
								<Link href="/blogs">
									<BookOpen className="h-5 w-5" />
									Browse Guides
								</Link>
							</Button>
							<Button
								asChild
								variant="ghost"
								size="lg"
								className="gap-2 text-white hover:bg-white/10"
							>
								<Link href="/">
									<Home className="h-5 w-5" />
									Go Home
								</Link>
							</Button>
						</div>
					</div>
				</div>

				{/* Recommended Products */}
				{(isLoading || recommendedProducts.length > 0) && (
					<div className="border-t border-white/10 bg-black/40 px-6 py-16 backdrop-blur-sm">
						<div className="container mx-auto max-w-7xl">
							<div className="mb-8 text-center">
								<h2 className="mb-2 font-bold text-2xl text-white">Popular Products</h2>
								<p className="text-white/60">Explore our mushroom growing supplies</p>
							</div>

							{isLoading ? (
								<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
									{[...Array(4)].map((_, i) => (
										<div key={i} className="h-80 animate-pulse rounded-xl bg-white/5" />
									))}
								</div>
							) : (
								<Suspense
									fallback={
										<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
											{[...Array(4)].map((_, i) => (
												<div key={i} className="h-80 animate-pulse rounded-xl bg-white/5" />
											))}
										</div>
									}
								>
									<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
										{recommendedProducts.map((product) => (
											<ProductCard key={product.id} product={product} />
										))}
									</div>
								</Suspense>
							)}
						</div>
					</div>
				)}
			</div>

			{/* Structured Data */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "WebPage",
						name: "Page Not Found - 404 | Zugzology",
						description: "The requested page could not be found.",
						mainEntity: {
							"@type": "ErrorPage",
							description: "HTTP 404 - Page Not Found",
						},
					}),
				}}
			/>
		</div>
	);
}

export default function NotFound() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center bg-black">
					<h1 className="font-bold text-8xl text-white">404</h1>
				</div>
			}
		>
			<NotFoundContent />
		</Suspense>
	);
}
