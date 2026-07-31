import { ArrowRight, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/sections/section-heading";
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
		<section className="lit w-full bg-background">
			<div className="container mx-auto px-4 py-16 sm:py-20 lg:py-24">
				<SectionHeading
					align="center"
					eyebrow="By category"
					subtitle="Explore our curated collections of premium cultivation supplies"
					title="Shop by category"
				/>

				{/* Collections Grid */}
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
					{collections.map((collection) => {
						if (!collection) {
							return null;
						}

						const productCount = collection.products?.nodes?.length || 0;

						return (
							<Link
								className="group relative overflow-hidden rounded-lg border border-border bg-card transition-colors duration-300 hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
								href={`/collections/${collection.handle}`}
								key={collection.handle}
							>
								{/* Collection plate */}
								<div className="relative aspect-square w-full overflow-hidden border-border border-b bg-muted sm:aspect-[4/3]">
									<Image
										alt={collection.title}
										className="object-cover brightness-[0.9] transition-[transform,filter] duration-700 ease-out group-hover:scale-[1.06] group-hover:brightness-100"
										fill
										sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
										src={collection.image?.url || ASSETS.placeholders.collection}
									/>
									{/* Grade the plate so the count stays legible against any image */}
									<div className="absolute inset-0 bg-[linear-gradient(to_bottom,hsl(205_55%_3%/0.45)_0%,transparent_45%,hsl(205_55%_3%/0.35)_100%)]" />

									{/* Item count — a fact, so it runs on the slate */}
									<div className="absolute top-2 right-2 z-10 sm:top-3 sm:right-3">
										<div className="flex items-center gap-1.5 rounded-sm border border-white/15 bg-[hsl(205_55%_3%/0.75)] px-2 py-1 backdrop-blur-sm">
											<Package className="h-3 w-3 text-white/70" />
											<span className="slate text-white">{productCount}</span>
										</div>
									</div>
								</div>

								{/* Collection Info */}
								<div className="p-4 sm:p-5">
									<h3 className="display-mid mb-2 font-display font-semibold text-base text-foreground tracking-[-0.02em] transition-colors group-hover:text-primary sm:text-xl">
										{collection.title}
									</h3>
									<p className="mb-4 line-clamp-2 text-muted-foreground text-xs leading-relaxed sm:text-sm">
										{collection.description || `Discover our ${collection.title.toLowerCase()} collection`}
									</p>

									<div className="flex items-center gap-2 text-primary transition-all group-hover:gap-3">
										<span className="slate">Shop now</span>
										<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
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
