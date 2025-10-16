"use client";

import { ProductCard } from "@/components/features/products/product-card";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import type { ProductSection } from "@/lib/api/shopify/product-sections";
import { cn } from "@/lib/utils";
import { CollectionsSection } from "./collections-section";

type ProductSectionsRendererProps = {
	sections: ProductSection[];
	currentProductId: string;
};

// Map section IDs to their corresponding "View All" links
function getViewAllLink(sectionId: string): { href: string; label: string } | null {
	const linkMap: Record<string, { href: string; label: string }> = {
		"related-products": { href: "/products", label: "View All Products" },
		"best-sellers": { href: "/collections/best-sellers", label: "View All Best Sellers" },
		"sale-products": { href: "/collections/sale", label: "View All Deals" },
		"latest-products": { href: "/products", label: "View All New Arrivals" },
		"same-category": { href: "/products", label: "View All" },
		"collection-products": { href: "/collections/all", label: "View Collection" },
		"similar-tags": { href: "/products", label: "View All Products" },
		"random-products": { href: "/products", label: "Explore More" },
	};

	return linkMap[sectionId] || null;
}

export function ProductSectionsRenderer({ sections, currentProductId }: ProductSectionsRendererProps) {
	if (!sections || sections.length === 0) {
		return null;
	}

	return (
		<div className="space-y-0">
			{sections.map((section, index) => {
				// Alternate between bg-background and bg-muted/50 for visual rhythm
				const viewAllLink = getViewAllLink(section.id);

				// Render collections section
				if (section.type === "collections" && section.collections) {
					return (
						<section
							className={cn("w-full", index % 2 === 0 ? "bg-background" : "bg-muted/50")}
							key={`${section.id}-${index}`}
						>
							<div className="container mx-auto px-4 py-8 sm:py-12">
								<div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
									<div>
										<h2 className="font-bold text-2xl text-foreground tracking-tight sm:text-3xl">{section.title}</h2>
										<p className="mt-2 text-muted-foreground">{section.description}</p>
									</div>
								</div>
								<CollectionsSection collections={section.collections} />
							</div>
						</section>
					);
				}

				// Render products section
				if (section.type === "products" && section.products && section.products.length > 0) {
					return (
						<section
							className={cn("w-full", index % 2 === 0 ? "bg-background" : "bg-muted/50")}
							key={`${section.id}-${index}`}
						>
							<div className="container mx-auto px-4 py-8 sm:py-12">
								<div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
									<div>
										<h2 className="font-bold text-2xl text-foreground tracking-tight sm:text-3xl">{section.title}</h2>
										{section.description && (
											<p className="mt-2 max-w-2xl text-base text-muted-foreground sm:text-lg">{section.description}</p>
										)}
									</div>
									{viewAllLink && (
										<Button asChild variant="outline">
											<Link href={viewAllLink.href}>{viewAllLink.label}</Link>
										</Button>
									)}
								</div>

								{/* Mobile: List view */}
								<div className="flex flex-col gap-0 sm:hidden">
									{section.products.map((product) => {
										const variant = product.variants?.nodes?.[0];
										if (!variant) {
											return null;
										}

										return (
											<ProductCard
												key={product.id}
												product={product}
												quantity={variant.quantityAvailable}
												variantId={variant.id}
												view="list"
											/>
										);
									})}
								</div>

								{/* Desktop: Grid view */}
								<div className="hidden gap-6 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
									{section.products.map((product) => {
										const variant = product.variants?.nodes?.[0];
										if (!variant) {
											return null;
										}

										return (
											<div className="group relative" key={product.id}>
												<ProductCard
													product={product}
													quantity={variant.quantityAvailable}
													variantId={variant.id}
													view="grid"
												/>
											</div>
										);
									})}
								</div>
							</div>
						</section>
					);
				}

				return null;
			})}
		</div>
	);
}
