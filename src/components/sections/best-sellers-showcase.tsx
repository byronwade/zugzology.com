import { TrendingUp } from "lucide-react";
import { ProductCard } from "@/components/features/products/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import type { ShopifyProduct } from "@/lib/types";

type BestSellersShowcaseProps = {
	products: ShopifyProduct[];
};

export function BestSellersShowcase({ products }: BestSellersShowcaseProps) {
	if (!products?.length) {
		return null;
	}

	return (
		<section className="relative w-full overflow-hidden bg-muted/50 py-12 sm:py-16">
			{/* Background Pattern */}
			<div className="absolute inset-0 z-0 opacity-5">
				<div
					className="absolute inset-0"
					style={{
						backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
					}}
				/>
			</div>

			<div className="container relative z-10 mx-auto px-4 md:px-6">
				<div className="mb-12 flex flex-col items-center text-center">
					<div className="mb-4 flex items-center gap-2">
						<TrendingUp className="h-6 w-6 text-primary" />
						<Badge className="bg-primary/10 text-primary" variant="secondary">
							Most Popular
						</Badge>
					</div>
					<h2 className="font-bold text-3xl text-foreground tracking-tight sm:text-4xl">Best Sellers</h2>
					<p className="mt-4 max-w-2xl text-lg text-muted-foreground dark:text-muted-foreground">
						Our most popular products, trusted by thousands of cultivators
					</p>
				</div>

				{/* List below sm, grid at sm and up — one render, see ProductCardView.
				    The rank badge is the one thing that genuinely differs between the two:
				    a bare "#1" top-left on the list row, "#1 Best Seller" top-right on the
				    grid card. Both are emitted and one is hidden per breakpoint, which
				    costs a span instead of a second copy of every card. */}
				<div className="relative flex flex-col gap-0 sm:grid sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
					{products.slice(0, 5).map((product, index) => (
						<div className="relative" key={product.id}>
							<Badge className="absolute top-2 left-4 z-20 bg-primary font-semibold text-primary-foreground text-xs sm:hidden">
								#{index + 1}
							</Badge>
							<div className="absolute top-3 right-3 z-20 hidden sm:block">
								<Badge className="bg-primary font-semibold text-primary-foreground shadow-md">
									#{index + 1} Best Seller
								</Badge>
							</div>

							<ProductCard
								product={product}
								quantity={product.variants.nodes[0]?.quantityAvailable}
								variantId={product.variants.nodes[0]?.id}
								view="responsive"
							/>
						</div>
					))}
				</div>

				<div className="mt-12 text-center">
					<Button asChild size="lg">
						<Link href="/collections/best-sellers">View All Best Sellers</Link>
					</Button>
				</div>
			</div>
		</section>
	);
}
