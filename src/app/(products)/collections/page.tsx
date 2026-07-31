import { ArrowRight, Package } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAllCollections } from "@/lib/api/shopify/actions";
import { ASSETS } from "@/lib/config/wadesdesign.config";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/seo-utils";

/**
 * Collections index.
 *
 * Shopify navigation menus commonly contain a top-level "Collections" entry
 * pointing at /collections, but only /collections/[handle] existed, so that
 * link 404'd — including for Next's own prefetch, which surfaced as a console
 * error in every Lighthouse run.
 */
export function generateMetadata(): Metadata {
	return generateSEOMetadata({
		title: "All Collections",
		description:
			"Browse every Zugzology collection of premium mushroom cultivation supplies — grow kits, substrates, liquid cultures, equipment and more.",
		url: "/collections",
		openGraph: { type: "website", siteName: "Zugzology" },
	});
}

export default async function CollectionsIndexPage(): Promise<React.ReactElement> {
	const allCollections = await getAllCollections().catch(() => []);
	const collections = (allCollections ?? []).filter(Boolean);

	return (
		<div className="min-h-screen bg-background">
			<section className="w-full bg-background">
				<div className="container mx-auto px-4 py-12 sm:py-16">
					<div className="mb-10 max-w-2xl">
						<h1 className="font-bold text-3xl text-foreground sm:text-4xl">All collections</h1>
						<p className="mt-3 text-base text-muted-foreground sm:text-lg">
							Browse every curated collection of premium cultivation supplies.
						</p>
					</div>

					{collections.length === 0 ? (
						<p className="text-muted-foreground">
							No collections are available right now.{" "}
							<Link className="text-primary underline underline-offset-4" href="/products">
								Browse all products
							</Link>{" "}
							instead.
						</p>
					) : (
						<div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
							{collections.map((collection) => {
								const productCount = collection.products?.nodes?.length || 0;

								return (
									<Link
										className="group relative overflow-hidden rounded-xl border border-border bg-card outline-none transition-all duration-300 hover:border-primary/40 hover:shadow-lg focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
										href={`/collections/${collection.handle}`}
										key={collection.handle}
									>
										<div className="relative aspect-square w-full overflow-hidden bg-muted sm:aspect-[4/3]">
											<Image
												alt=""
												className="object-cover transition-transform duration-500 group-hover:scale-105"
												fill
												sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
												src={collection.image?.url || ASSETS.placeholders.collection}
											/>
											<div className="absolute top-2 right-2 z-10 sm:top-3 sm:right-3">
												<div className="flex items-center gap-1.5 rounded-md border border-border bg-background/90 px-2 py-1 backdrop-blur-sm">
													<Package aria-hidden="true" className="h-3 w-3 text-muted-foreground" />
													<span className="font-medium text-foreground text-xs">{productCount}</span>
												</div>
											</div>
										</div>

										<div className="p-3 sm:p-5">
											<h2 className="mb-1.5 font-semibold text-foreground text-sm transition-colors group-hover:text-primary sm:mb-2 sm:text-lg">
												{collection.title}
											</h2>
											<p className="mb-2 line-clamp-2 text-muted-foreground text-xs leading-relaxed sm:mb-4 sm:text-sm">
												{collection.description || `Discover our ${collection.title.toLowerCase()} collection`}
											</p>
											<span className="flex items-center gap-1.5 font-medium text-primary text-xs transition-all group-hover:gap-3 sm:gap-2 sm:text-sm">
												Shop now
												<ArrowRight aria-hidden="true" className="h-3 w-3 sm:h-4 sm:w-4" />
											</span>
										</div>
									</Link>
								);
							})}
						</div>
					)}
				</div>
			</section>
		</div>
	);
}
