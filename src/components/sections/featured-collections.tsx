"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { Link } from "@/components/ui/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getAllCollections } from "@/lib/actions/shopify";
import { ASSETS } from "@/lib/config/wadesdesign.config";
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
					const topCollections = allCollections
						.filter(
							(collection: ShopifyCollection) => collection?.products?.nodes && collection.products.nodes.length > 0
						)
						.slice(0, 4);
					setCollections(topCollections);
				} else {
					setCollections([]);
				}
			} catch (_error) {
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
			<section className="w-full bg-background">
				<div className="container mx-auto px-4 py-12">
					<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
						{[...new Array(4)].map((_, i) => (
							<div className="aspect-[16/9] animate-pulse rounded-2xl bg-muted" key={i} />
						))}
					</div>
				</div>
			</section>
		);
	}

	if (!collections.length) {
		return null;
	}

	return (
		<section className="w-full bg-background">
			<div className="container mx-auto px-4 py-12">
				<div className="mb-12 flex flex-col items-center justify-center text-center">
					<h2 className="font-bold text-3xl text-foreground tracking-tight sm:text-4xl">Shop by Category</h2>
					<p className="mt-4 max-w-2xl text-lg text-muted-foreground">
						Explore our curated collections of premium cultivation supplies
					</p>
				</div>

				<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
					{collections.map((collection) => {
						if (!collection) {
							return null;
						}

						// Generate a gradient color based on the collection handle
						const gradientColors = {
							"growing-kits": "from-blue-500/20 via-blue-500/5 to-transparent",
							substrates: "from-green-500/20 via-green-500/5 to-transparent",
							equipment: "from-purple-500/20 via-purple-500/5 to-transparent",
							bulk: "from-amber-500/20 via-amber-500/5 to-transparent",
							default: "from-primary/20 via-primary/5 to-transparent",
						};

						const gradientColor =
							gradientColors[collection.handle as keyof typeof gradientColors] || gradientColors.default;

						return (
							<Link
								className="group relative overflow-hidden rounded-2xl"
								href={`/collections/${collection.handle}`}
								key={collection.handle}
							>
								<div className={`absolute inset-0 bg-gradient-to-br ${gradientColor} z-10 opacity-40`} />
								<div className="absolute inset-0 z-20 bg-gradient-to-t from-black via-black/70 to-transparent" />
								<div className="absolute inset-0 z-20 bg-black/10" />
								<div className="relative aspect-[16/9] w-full">
									<Image
										alt={collection.title}
										className="object-cover transition-transform duration-300 group-hover:scale-105"
										fill
										sizes="(max-width: 768px) 100vw, 50vw"
										src={collection.image?.url || ASSETS.placeholders.collection}
									/>
								</div>
								<div className="absolute inset-0 z-30 flex flex-col justify-end p-6">
									<h3 className="mb-2 font-bold text-2xl text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">
										{collection.title}
									</h3>
									<p className="mb-4 line-clamp-2 font-medium text-muted text-sm tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] sm:text-base">
										{collection.description || `Explore our ${collection.title} collection`}
									</p>
									<div className="translate-y-8 transform opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
										<Button
											className="border-0 bg-card text-foreground shadow-[0_4px_14px_0_rgba(0,0,0,0.25)] hover:bg-card/90"
											variant="secondary"
										>
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
