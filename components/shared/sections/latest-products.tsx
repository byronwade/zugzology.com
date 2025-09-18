import { ProductCard } from "@/components/features/products/product-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { ShopifyProduct } from "@/lib/types";

interface LatestProductsProps {
	products: ShopifyProduct[];
}

export function LatestProducts({ products }: LatestProductsProps) {
	if (!products?.length) return null;

	return (
		<section className="w-full py-12 bg-gray-50 dark:bg-gray-900/50">
			<div className="container mx-auto px-4 md:px-6">
				<div className="flex items-center justify-between mb-8">
					<div>
						<h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">Latest Products</h2>
						<p className="mt-2 text-gray-600 dark:text-gray-400">Check out our newest cultivation supplies and equipment</p>
					</div>
					<Button variant="outline" className="hidden sm:flex border-gray-200 dark:border-gray-800" asChild>
						<Link href="/products">View All Products</Link>
					</Button>
				</div>

				<div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-800 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-4 sm:divide-y-0">
					{products.map((product) => (
						<div key={product.id} className="group relative">
							<ProductCard product={product} view="grid" variantId={product.variants.nodes[0]?.id} quantity={product.variants.nodes[0]?.quantityAvailable} />
						</div>
					))}
				</div>

				<Button variant="outline" className="w-full mt-8 sm:hidden border-gray-200 dark:border-gray-800" asChild>
					<Link href="/products">View All Products</Link>
				</Button>
			</div>
		</section>
	);
}
