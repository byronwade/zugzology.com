import { ProductCard } from "@/components/features/products/product-card";
import { SectionHeading } from "@/components/sections/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import type { ShopifyProduct } from "@/lib/types";

type SaleProductsProps = {
	products: ShopifyProduct[];
};

export function SaleProducts({ products }: SaleProductsProps) {
	if (!products?.length) {
		return null;
	}

	return (
		<section className="lit w-full border-border border-y bg-muted/40">
			<div className="container mx-auto px-4 py-16 sm:py-20">
				<SectionHeading
					ctaHref="/collections/sale"
					ctaLabel="View all deals"
					eyebrow="Price reduced"
					subtitle="Limited time offers on premium cultivation supplies"
					title="On sale now"
				/>

				{/* Mobile: List view */}
				<div className="flex flex-col gap-0 sm:hidden">
					{products.map((product) => {
						const variant = product.variants.nodes[0];
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
					{products.map((product) => {
						const variant = product.variants.nodes[0];
						if (!variant) {
							return null;
						}

						const compareAtPrice = variant.compareAtPrice?.amount;
						const currentPrice = variant.price.amount;
						const hasDiscount = compareAtPrice && Number.parseFloat(compareAtPrice) > Number.parseFloat(currentPrice);
						const discountPercentage = hasDiscount
							? Math.round(
									((Number.parseFloat(compareAtPrice) - Number.parseFloat(currentPrice)) /
										Number.parseFloat(compareAtPrice)) *
										100
								)
							: 0;

						return (
							<div className="group relative" key={product.id}>
								<div className="relative">
									<ProductCard
										product={product}
										quantity={variant.quantityAvailable}
										variantId={variant.id}
										view="grid"
									/>
									{hasDiscount && (
										<Badge className="absolute top-3 right-3 z-10 shadow-flush" variant="flush">
											&minus;{discountPercentage}%
										</Badge>
									)}
								</div>
							</div>
						);
					})}
				</div>

				<Button asChild className="mt-10 w-full sm:hidden" variant="outline">
					<Link href="/collections/sale">View all deals</Link>
				</Button>
			</div>
		</section>
	);
}
