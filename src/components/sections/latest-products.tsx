import { ProductCard } from "@/components/features/products/product-card";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import type { ShopifyProduct } from "@/lib/types";

type LatestProductsProps = {
	products: ShopifyProduct[];
};

export function LatestProducts({ products }: LatestProductsProps) {
	if (!products?.length) {
		return null;
	}

	return (
		<section className="w-full bg-muted/50">
			<div className="container mx-auto px-4 py-12">
				<div className="mb-8 flex items-center justify-between">
					<div>
						<h2 className="font-bold text-2xl text-foreground tracking-tight sm:text-3xl">Latest Products</h2>
						<p className="mt-2 text-muted-foreground">Check out our newest cultivation supplies and equipment</p>
					</div>
					<Button asChild className="hidden sm:flex" variant="outline">
						<Link href="/products">View All Products</Link>
					</Button>
				</div>

				{/* Mobile: List view */}
				<div className="flex flex-col gap-0 sm:hidden">
					{products.map((product) => (
						<ProductCard
							key={product.id}
							product={product}
							quantity={product.variants.nodes[0]?.quantityAvailable}
							variantId={product.variants.nodes[0]?.id}
							view="list"
						/>
					))}
				</div>

				{/* Desktop: Grid view */}
				<div className="hidden gap-6 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
					{products.map((product) => (
						<div className="group relative" key={product.id}>
							<ProductCard
								product={product}
								quantity={product.variants.nodes[0]?.quantityAvailable}
								variantId={product.variants.nodes[0]?.id}
								view="grid"
							/>
						</div>
					))}
				</div>

				<Button asChild className="mt-8 w-full sm:hidden" variant="outline">
					<Link href="/products">View All Products</Link>
				</Button>
			</div>
		</section>
	);
}
