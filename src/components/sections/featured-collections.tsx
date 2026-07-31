import { ArrowRight, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getAllCollections } from "@/lib/api/shopify/actions";
import { ASSETS } from "@/lib/config/wadesdesign.config";

// Server Component - fetches data on server, no client JS needed
export async function FeaturedCollections() {
	const allCollections = await getAllCollections();

	// Filter out empty collections and take the top 4
	const collections = allCollections
		.filter((collection) => collection?.products?.nodes && collection.products.nodes.length > 0)
		.slice(0, 4);

	if (!collections.length) {
		return null;
	}

	return (
		<section className="w-full bg-background">
			<div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
				{/* Section Header */}
				<div className="mb-8 text-center sm:mb-12">
					<h2 className="font-bold text-2xl text-foreground tracking-tight sm:text-3xl lg:text-4xl">
						Shop by Category
					</h2>
					<p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground sm:mt-4 sm:text-lg">
						Explore our curated collections of premium cultivation supplies
					</p>
				</div>

				{/* Collections Grid */}
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
					{collections.map((collection) => {
						if (!collection) {
							return null;
						}

						const productCount = collection.products?.nodes?.length || 0;

						return (
							<Link
								className="group relative overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-lg sm:rounded-xl"
								href={`/collections/${collection.handle}`}
								key={collection.handle}
							>
								{/* Collection Image */}
								<div className="relative aspect-square w-full overflow-hidden bg-muted sm:aspect-[4/3]">
									<Image
										alt={collection.title}
										className="object-cover transition-transform duration-500 group-hover:scale-110"
										fill
										sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
										src={collection.image?.url || ASSETS.placeholders.collection}
									/>
									{/* Subtle Gradient Overlay */}
									<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />

									{/* Product Count Badge */}
									<div className="absolute top-2 right-2 z-10 sm:top-3 sm:right-3">
										<div className="flex items-center gap-1 rounded-full border border-white/20 bg-white/90 px-2 py-1 backdrop-blur-sm sm:gap-1.5 sm:px-3 sm:py-1.5 dark:bg-black/90">
											<Package className="h-3 w-3 text-foreground sm:h-3.5 sm:w-3.5" />
											<span className="font-semibold text-[10px] text-foreground sm:text-xs">{productCount}</span>
										</div>
									</div>
								</div>

								{/* Collection Info */}
								<div className="p-3 sm:p-5">
									<h3 className="mb-1.5 font-semibold text-foreground text-sm transition-colors group-hover:text-primary sm:mb-2 sm:text-lg">
										{collection.title}
									</h3>
									<p className="mb-2 line-clamp-2 text-muted-foreground text-xs leading-relaxed sm:mb-4 sm:text-sm">
										{collection.description || `Discover our ${collection.title.toLowerCase()} collection`}
									</p>

									{/* Shop Now Link */}
									<div className="flex items-center gap-1.5 font-medium text-primary text-xs transition-all group-hover:gap-3 sm:gap-2 sm:text-sm">
										<span>Shop Now</span>
										<ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1 sm:h-4 sm:w-4" />
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
