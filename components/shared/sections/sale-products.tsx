import { ProductCard } from "@/components/features/products/product-card";
import { Button } from "@/components/ui/button";
import { Link } from '@/components/ui/link';
import { Badge } from "@/components/ui/badge";
import type { ShopifyProduct } from "@/lib/types";

interface SaleProductsProps {
	products: ShopifyProduct[];
}

export function SaleProducts({ products }: SaleProductsProps) {
	if (!products?.length) {
		console.log("No sale products available");
		return null;
	}

	console.log(`Rendering ${products.length} sale products`);

	return (
		<section className="w-full py-12 bg-gray-50 dark:bg-gray-900/50">
			<div className="container mx-auto px-4 md:px-6">
				<div className="flex items-center justify-between mb-8">
					<div>
						<div className="flex items-center gap-3">
							<h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">On Sale Now</h2>
							<Badge variant="destructive" className="bg-red-500 hover:bg-red-600">
								Save up to 50%
							</Badge>
						</div>
						<p className="mt-2 text-gray-600 dark:text-gray-400">Limited time offers on premium cultivation supplies</p>
					</div>
					<Button variant="outline" className="hidden sm:flex border-gray-200 dark:border-gray-800" asChild>
						<Link href="/collections/sale">View All Deals</Link>
					</Button>
				</div>

				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{products.map((product) => {
						const variant = product.variants.nodes[0];
						if (!variant) return null;

						const compareAtPrice = variant.compareAtPrice?.amount;
						const currentPrice = variant.price.amount;
						const hasDiscount = compareAtPrice && parseFloat(compareAtPrice) > parseFloat(currentPrice);
						const discountPercentage = hasDiscount ? Math.round(((parseFloat(compareAtPrice) - parseFloat(currentPrice)) / parseFloat(compareAtPrice)) * 100) : 0;

						return (
							<div key={product.id} className="group relative">
								<div className="relative">
									<ProductCard product={product} view="grid" variantId={variant.id} quantity={variant.quantityAvailable} />
									{hasDiscount && (
										<Badge variant="destructive" className="absolute top-4 right-4 z-10 bg-red-500 hover:bg-red-600">
											Save {discountPercentage}%
										</Badge>
									)}
								</div>
							</div>
						);
					})}
				</div>

				<Button variant="outline" className="w-full mt-8 sm:hidden border-gray-200 dark:border-gray-800" asChild>
					<Link href="/collections/sale">View All Deals</Link>
				</Button>
			</div>
		</section>
	);
}
