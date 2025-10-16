"use client";

import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/features/products/product-card";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import type { PageLayout, PageTheme, ProductCarouselSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

type ProductCarouselSectionProps = {
	settings: ProductCarouselSettings;
	layout: PageLayout;
	theme: PageTheme;
};

/**
 * Product Carousel Section Component
 * Displays products in a grid with optional CTA
 */
export function ProductCarouselSection({ settings, layout, theme }: ProductCarouselSectionProps) {
	const { heading, subheading, ctaText, ctaLink } = settings;

	// Note: Product data should be passed via settings.products
	// This would come from the metaobject references
	const products = (settings as any).products || [];

	return (
		<section
			className={cn(
				"py-16 md:py-24",
				theme === "dark" && "bg-slate-900 text-white",
				theme === "default" && "bg-background"
			)}
		>
			<div className={cn(layout === "contained" ? "container mx-auto px-4" : "px-4")}>
				{/* Header */}
				<div className="mb-12 flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
					<div>
						<h2 className="mb-3 font-bold text-3xl tracking-tight md:text-4xl lg:text-5xl">{heading}</h2>
						{subheading && <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">{subheading}</p>}
					</div>

					{ctaText && ctaLink && (
						<Button asChild variant="outline">
							<Link href={ctaLink}>
								{ctaText}
								<ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
					)}
				</div>

				{/* Products Grid */}
				{products.length > 0 ? (
					<>
						{/* Mobile: List view */}
						<div className="flex flex-col gap-0 md:hidden">
							{products.map((product: any) => {
								const variant = product.variants?.nodes?.[0];
								if (!variant) {
									return null;
								}

								return (
									<ProductCard
										key={product.id}
										product={product}
										quantity={variant.quantityAvailable || 0}
										variantId={variant.id}
										view="list"
									/>
								);
							})}
						</div>

						{/* Desktop: Grid view */}
						<div className="hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-4">
							{products.map((product: any) => {
								const variant = product.variants?.nodes?.[0];
								if (!variant) {
									return null;
								}

								return (
									<div className="group relative" key={product.id}>
										<ProductCard
											product={product}
											quantity={variant.quantityAvailable || 0}
											variantId={variant.id}
											view="grid"
										/>
									</div>
								);
							})}
						</div>
					</>
				) : (
					<div className="rounded-lg border border-muted-foreground/20 border-dashed bg-muted/10 p-12 text-center">
						<p className="text-muted-foreground">
							No products configured for this section. Add products via metaobject references in Shopify.
						</p>
					</div>
				)}
			</div>
		</section>
	);
}
