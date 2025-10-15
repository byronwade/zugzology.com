import { Link } from "@/components/ui/link";
import { ProductCard } from "@/components/features/products/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ShopifyProduct } from "@/lib/types";

type SaleProductsProps = {
	products: ShopifyProduct[];
};

export function SaleProducts({ products }: SaleProductsProps) {
	if (!products?.length) {
		return null;
	}

	return (
		<section className="w-full bg-muted/50">
			<div className="container mx-auto px-4 py-12">
				<div className="mb-8 flex items-center justify-between">
					<div>
						<div className="flex items-center gap-3">
							<h2 className="font-bold text-2xl text-foreground tracking-tight sm:text-3xl">On Sale Now</h2>
							<Badge variant="destructive">Save up to 50%</Badge>
						</div>
						<p className="mt-2 text-muted-foreground dark:text-muted-foreground">
							Limited time offers on premium cultivation supplies
						</p>
					</div>
					<Button asChild className="hidden sm:flex" variant="outline">
						<Link href="/collections/sale">View All Deals</Link>
					</Button>
				</div>

				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
										<Badge className="absolute top-4 right-4 z-10" variant="destructive">
											Save {discountPercentage}%
										</Badge>
									)}
								</div>
							</div>
						);
					})}
				</div>

				<Button asChild className="mt-8 w-full sm:hidden" variant="outline">
					<Link href="/collections/sale">View All Deals</Link>
				</Button>
			</div>
		</section>
	);
}
