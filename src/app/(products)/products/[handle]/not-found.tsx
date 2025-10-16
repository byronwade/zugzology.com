"use client";

import { Home, Search, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/features/products/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/components/ui/link";
import type { ShopifyProduct } from "@/lib/types";

const productNotFoundMessages = [
	"This mushroom isn't in our forest anymore",
	"Product not found in our cultivation",
	"This spore has moved on",
	"Can't locate this strain",
];

export default function ProductNotFound() {
	const [searchQuery, setSearchQuery] = useState("");
	const [recommendedProducts, setRecommendedProducts] = useState<ShopifyProduct[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [funnyMessage] = useState(
		() => productNotFoundMessages[Math.floor(Math.random() * productNotFoundMessages.length)]
	);

	useEffect(() => {
		if (typeof window !== "undefined" && window.gtag) {
			const productHandle = window.location.pathname.split("/").pop();
			window.gtag("event", "page_view", {
				page_type: "product_404",
				page_location: window.location.href,
				product_handle: productHandle,
				error_type: "product_not_found",
			});
		}

		const fetchProducts = async () => {
			try {
				const response = await fetch("/api/products?limit=8");
				const products = await response.json();
				if (Array.isArray(products)) {
					setRecommendedProducts(products);
				}
			} catch (_error) {
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
				alt="Delicate mushrooms"
				className="object-cover"
				fill
				priority
				quality={90}
				src="https://images.unsplash.com/photo-1459262838948-3e2de6c1ec80?w=1920&q=80"
			/>

			{/* Dark Gradient Overlay */}
			<div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-black/90" />

			{/* Content */}
			<div className="relative z-10 flex flex-1 flex-col">
				{/* Hero Section */}
				<div className="flex flex-1 items-center justify-center px-6 py-16">
					<div className="w-full max-w-2xl text-center">
						<div className="mb-12 space-y-6">
							<h1 className="font-bold text-6xl text-white tracking-tight sm:text-7xl">Product Not Found</h1>

							<p className="text-2xl text-white/90 sm:text-3xl">{funnyMessage}</p>

							<p className="mx-auto max-w-md text-lg text-white/70">
								This product may have been discontinued or moved. Explore our other amazing cultivation supplies.
							</p>
						</div>

						{/* Search Bar */}
						<div className="mx-auto mb-8 max-w-xl">
							<form className="flex gap-3" onSubmit={handleSearch}>
								<div className="relative flex-1">
									<Search className="-translate-y-1/2 absolute top-1/2 left-4 h-5 w-5 text-white/40" />
									<Input
										className="border-white/20 bg-white/10 py-6 pl-12 text-white backdrop-blur-sm placeholder:text-white/40 focus:border-white/30 focus:bg-white/15"
										onChange={(e) => setSearchQuery(e.target.value)}
										placeholder="Search for a different product..."
										type="search"
										value={searchQuery}
									/>
								</div>
								<Button className="bg-white px-8 text-black hover:bg-white/90" size="lg" type="submit">
									Search
								</Button>
							</form>
						</div>

						{/* Quick Actions */}
						<div className="flex flex-wrap justify-center gap-4">
							<Button asChild className="gap-2 bg-white text-black hover:bg-white/90" size="lg">
								<Link href="/products">
									<ShoppingBag className="h-5 w-5" />
									View All Products
								</Link>
							</Button>
							<Button
								asChild
								className="gap-2 border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
								size="lg"
								variant="outline"
							>
								<Link href="/collections">Browse Collections</Link>
							</Button>
							<Button asChild className="gap-2 text-white hover:bg-white/10" size="lg" variant="ghost">
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
					<div className="border-white/10 border-t bg-black/40 px-6 py-16 backdrop-blur-sm">
						<div className="container mx-auto max-w-7xl">
							<div className="mb-8 text-center">
								<h2 className="mb-2 font-bold text-2xl text-white">You Might Like These</h2>
								<p className="text-white/60">Explore our popular mushroom cultivation products</p>
							</div>

							{isLoading ? (
								<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
									{[...new Array(8)].map((_, i) => (
										<div className="h-96 animate-pulse rounded-xl bg-white/5" key={i} />
									))}
								</div>
							) : (
								<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
									{recommendedProducts.slice(0, 8).map((product) => (
										<ProductCard key={product.id} product={product} />
									))}
								</div>
							)}
						</div>
					</div>
				)}
			</div>

			{/* Structured Data */}
			<script
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "WebPage",
						name: "Product Not Found - Zugzology",
						description: "The requested product could not be found.",
						mainEntity: {
							"@type": "ErrorPage",
							description: "HTTP 404 - Product Not Found",
						},
					}),
				}}
				type="application/ld+json"
			/>
		</div>
	);
}
