"use client";

import { ProductCard } from "@/components/features/products/product-card";
import { CollectionsSection } from "./collections-section";
import type { ProductSection } from "@/lib/api/shopify/product-sections";

type ProductSectionsRendererProps = {
	sections: ProductSection[];
	currentProductId: string;
};

export function ProductSectionsRenderer({ sections, currentProductId }: ProductSectionsRendererProps) {
	if (!sections || sections.length === 0) {
		return null;
	}

	return (
		<div className="space-y-16">
			{sections.map((section, index) => {
				// Render collections section
				if (section.type === "collections" && section.collections) {
					return (
						<section className="w-full" key={`${section.id}-${index}`}>
							<div className="mb-8">
								<h2 className="font-bold text-2xl text-neutral-900 dark:text-neutral-100">{section.title}</h2>
								<p className="mt-2 text-neutral-600 text-sm dark:text-neutral-400">{section.description}</p>
							</div>
							<CollectionsSection collections={section.collections} />
						</section>
					);
				}

				// Render products section
				if (section.type === "products" && section.products && section.products.length > 0) {
					return (
						<section className="w-full" key={`${section.id}-${index}`}>
							<div className="mb-8">
								<h2 className="font-bold text-2xl text-neutral-900 dark:text-neutral-100">{section.title}</h2>
								<p className="mt-2 text-neutral-600 text-sm dark:text-neutral-400">{section.description}</p>
							</div>
							<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
								{section.products.map((product) => {
									const variant = product.variants?.nodes?.[0];
									if (!variant) return null;

									return (
										<div className="group relative" key={product.id}>
											{/* Mobile: List View */}
											<div className="sm:hidden">
												<ProductCard
													product={product}
													quantity={variant.quantityAvailable}
													variantId={variant.id}
													view="list"
												/>
											</div>
											{/* Desktop: Grid View */}
											<div className="hidden sm:block">
												<ProductCard
													product={product}
													quantity={variant.quantityAvailable}
													variantId={variant.id}
													view="grid"
												/>
											</div>
										</div>
									);
								})}
							</div>
						</section>
					);
				}

				return null;
			})}
		</div>
	);
}
