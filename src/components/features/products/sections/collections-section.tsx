"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { Link } from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import { ASSETS } from "@/lib/config/wadesdesign.config";
import type { ShopifyCollection } from "@/lib/types";

type CollectionsSectionProps = {
	collections: ShopifyCollection[];
};

export function CollectionsSection({ collections }: CollectionsSectionProps) {
	if (!collections?.length) {
		return null;
	}

	return (
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
	);
}
