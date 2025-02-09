"use client";

import Image from "next/image";
import Link from "next/link";
import type { ShopifyCollection } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CollectionsGridProps {
	collections: ShopifyCollection[];
	className?: string;
}

export function CollectionsGrid({ collections, className }: CollectionsGridProps) {
	if (!collections?.length) {
		return (
			<div className="w-full py-12 text-center">
				<p className="text-muted-foreground">No collections found.</p>
			</div>
		);
	}

	// Take only the first 8 collections
	const displayCollections = collections.slice(0, 8);

	return (
		<section className="w-full bg-white dark:bg-black">
			<h2 className="text-3xl font-bold py-8 text-center">🍄🛍️ All in One Mushroom Grow Bags and Mycology Supplies 🔬</h2>
			<div className={cn("grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 w-full", className)}>
				{displayCollections.map((collection) => (
					<Link key={collection.id} href={`/collections/${collection.handle}`} className="group relative bg-white dark:bg-neutral-900 overflow-hidden transition-all duration-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 border-[10px] border-transparent hover:border-purple-500">
						<div className="relative aspect-square w-full overflow-hidden">
							{collection.image ? (
								<Image src={collection.image.url} alt={collection.image.altText || collection.title} fill sizes="(min-width: 1280px) 12.5vw, (min-width: 768px) 25vw, 50vw" className="object-cover transition-transform duration-300 group-hover:scale-105" priority />
							) : (
								<div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
									<p className="text-sm text-neutral-500">No image</p>
								</div>
							)}
						</div>
						<div className="absolute bottom-0 left-0 right-0 p-2 bg-white/90 dark:bg-black/90 backdrop-blur-sm">
							<h3 className="font-bold text-xs sm:text-sm text-center line-clamp-2">{collection.title}</h3>
						</div>
					</Link>
				))}
			</div>
		</section>
	);
}
