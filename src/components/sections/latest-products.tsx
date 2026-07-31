import { ProductCard } from "@/components/features/products/product-card";
import { SectionHeading } from "@/components/sections/section-heading";
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
		<section className="lit w-full border-border border-y bg-muted/40">
			<div className="container mx-auto px-4 py-16 sm:py-20">
				<SectionHeading
					ctaHref="/products"
					ctaLabel="View all products"
					eyebrow="Newest first"
					subtitle="Check out our newest cultivation supplies and equipment"
					title="Latest products"
				/>

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

				<Button asChild className="mt-10 w-full sm:hidden" variant="outline">
					<Link href="/products">View all products</Link>
				</Button>
			</div>
		</section>
	);
}
