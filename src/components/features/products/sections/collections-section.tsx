"use client";

import { ArrowRight, Package } from "lucide-react";
import Image from "next/image";
import { Link } from "@/components/ui/link";
import { ASSETS } from "@/lib/config/wadesdesign.config";
import type { ShopifyCollection } from "@/lib/types";

type CollectionsSectionProps = {
	collections: ShopifyCollection[];
};

// Collection Card Component - Grid View
function CollectionCardGrid({ collection }: { collection: ShopifyCollection }) {
	const productCount = collection.products?.nodes?.length || 0;

	return (
		<Link
			className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-lg"
			href={`/collections/${collection.handle}`}
		>
			{/* Collection Image */}
			<div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
				<Image
					alt={collection.title}
					className="object-cover transition-transform duration-500 group-hover:scale-110"
					fill
					sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
					src={collection.image?.url || ASSETS.placeholders.collection}
				/>
				{/* Subtle Gradient Overlay */}
				<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />

				{/* Product Count Badge */}
				<div className="absolute top-3 right-3 z-10">
					<div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/90 px-3 py-1.5 backdrop-blur-sm dark:bg-black/90">
						<Package className="h-3.5 w-3.5 text-foreground" />
						<span className="font-semibold text-foreground text-xs">{productCount}</span>
					</div>
				</div>
			</div>

			{/* Collection Info */}
			<div className="p-5">
				<h3 className="mb-2 font-semibold text-foreground text-lg transition-colors group-hover:text-primary">
					{collection.title}
				</h3>
				<p className="mb-4 line-clamp-2 text-muted-foreground text-sm leading-relaxed">
					{collection.description || `Discover our ${collection.title.toLowerCase()} collection`}
				</p>

				{/* Shop Now Link */}
				<div className="flex items-center gap-2 font-medium text-primary text-sm transition-all group-hover:gap-3">
					<span>Shop Now</span>
					<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
				</div>
			</div>
		</Link>
	);
}

// Collection Card Component - List View (Mobile)
function CollectionCardList({ collection }: { collection: ShopifyCollection }) {
	const productCount = collection.products?.nodes?.length || 0;

	return (
		<Link
			className="group flex gap-3 border-border border-b bg-background px-3 py-3 transition-colors hover:bg-muted/50"
			href={`/collections/${collection.handle}`}
		>
			{/* Collection Image */}
			<div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
				<Image
					alt={collection.title}
					className="object-cover transition-transform duration-300 group-hover:scale-110"
					fill
					sizes="80px"
					src={collection.image?.url || ASSETS.placeholders.collection}
				/>
				{/* Product Count Badge */}
				<div className="absolute top-1 right-1">
					<div className="flex items-center gap-1 rounded-full border border-white/20 bg-white/90 px-1.5 py-0.5 backdrop-blur-sm dark:bg-black/90">
						<Package className="h-2.5 w-2.5 text-foreground" />
						<span className="font-semibold text-[10px] text-foreground">{productCount}</span>
					</div>
				</div>
			</div>

			{/* Collection Info */}
			<div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
				<h3 className="truncate font-semibold text-foreground text-sm transition-colors group-hover:text-primary">
					{collection.title}
				</h3>
				<p className="line-clamp-1 text-muted-foreground text-xs leading-relaxed">
					{collection.description || `Discover our ${collection.title.toLowerCase()} collection`}
				</p>
				<div className="mt-1 flex items-center gap-1 text-primary text-xs">
					<span className="font-medium">Shop Now</span>
					<ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
				</div>
			</div>
		</Link>
	);
}

export function CollectionsSection({ collections }: CollectionsSectionProps) {
	if (!collections?.length) {
		return null;
	}

	return (
		<>
			{/* Mobile: List view */}
			<div className="flex flex-col gap-0 sm:hidden">
				{collections.map((collection) => {
					if (!collection) {
						return null;
					}
					return <CollectionCardList collection={collection} key={collection.handle} />;
				})}
			</div>

			{/* Desktop: Grid view */}
			<div className="hidden gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-4">
				{collections.map((collection) => {
					if (!collection) {
						return null;
					}
					return <CollectionCardGrid collection={collection} key={collection.handle} />;
				})}
			</div>
		</>
	);
}
