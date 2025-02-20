"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getAllCollections } from "@/lib/actions/shopify";
import type { ShopifyCollection } from "@/lib/types";

export function FeaturedCollections() {
	const [collections, setCollections] = useState<ShopifyCollection[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchCollections() {
			try {
				const allCollections = await getAllCollections();
				// Check if allCollections exists and is an array
				if (allCollections && Array.isArray(allCollections)) {
					// Filter out empty collections and take the top 4
					const topCollections = allCollections.filter((collection: ShopifyCollection) => collection && collection.products && collection.products.nodes && collection.products.nodes.length > 0).slice(0, 4);
					setCollections(topCollections);
				} else {
					console.warn("No collections found or invalid response format");
					setCollections([]);
				}
			} catch (error) {
				console.error("Error fetching collections:", error);
				setError("Failed to load collections");
				setCollections([]);
			} finally {
				setLoading(false);
			}
		}

		fetchCollections();
	}, []);

	if (error) {
		return null; // Silently fail if there's an error
	}

	if (loading) {
		return (
			<section className="w-full py-12 bg-white dark:bg-gray-950">
				<div className="container mx-auto px-4 md:px-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{[...Array(4)].map((_, i) => (
							<div key={i} className="aspect-[16/9] rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
						))}
					</div>
				</div>
			</section>
		);
	}

	if (!collections.length) return null;

	return (
		<section className="w-full py-12 bg-white dark:bg-gray-950">
			<div className="container mx-auto px-4 md:px-6">
				<div className="flex flex-col items-center justify-center text-center mb-12">
					<h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">Shop by Category</h2>
					<p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl">Explore our curated collections of premium cultivation supplies</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{collections.map((collection) => {
						if (!collection) return null;

						// Generate a gradient color based on the collection handle
						const gradientColors = {
							"growing-kits": "from-blue-500/20 via-blue-500/5 to-transparent",
							substrates: "from-green-500/20 via-green-500/5 to-transparent",
							equipment: "from-purple-500/20 via-purple-500/5 to-transparent",
							bulk: "from-amber-500/20 via-amber-500/5 to-transparent",
							default: "from-primary/20 via-primary/5 to-transparent",
						};

						const gradientColor = gradientColors[collection.handle as keyof typeof gradientColors] || gradientColors.default;

						return (
							<Link key={collection.handle} href={`/collections/${collection.handle}`} className="group relative overflow-hidden rounded-2xl">
								<div className={`absolute inset-0 bg-gradient-to-br ${gradientColor} z-10 opacity-40`} />
								<div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent z-20" />
								<div className="absolute inset-0 bg-black/10 z-20" />
								<div className="relative aspect-[16/9] w-full">
									<Image src={collection.image?.url || "/mycelium-roots.png"} alt={collection.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
								</div>
								<div className="absolute inset-0 z-30 flex flex-col justify-end p-6">
									<h3 className="text-2xl font-bold text-white mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] tracking-wide">{collection.title}</h3>
									<p className="text-gray-50 mb-4 line-clamp-2 text-sm sm:text-base drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] font-medium tracking-wide">{collection.description || `Explore our ${collection.title} collection`}</p>
									<div className="transform translate-y-8 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
										<Button variant="secondary" className="bg-white hover:bg-white/90 text-gray-900 border-0 shadow-[0_4px_14px_0_rgba(0,0,0,0.25)]">
											Shop Now <ArrowRight className="ml-2 h-4 w-4" />
										</Button>
									</div>
								</div>
							</Link>
						);
					})}
				</div>
			</div>
		</section>
	);
}
