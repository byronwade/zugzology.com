import { Award, Star, TrendingUp } from "lucide-react";
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
		<section className="relative w-full overflow-hidden bg-muted/50 py-16">
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

				<div className="relative">
					{/* Mobile: List view */}
					<div className="flex flex-col gap-0 sm:hidden">
						{products.slice(0, 5).map((product, index) => (
							<div className="relative" key={product.id}>
								<Badge className="absolute top-2 left-4 z-20 bg-primary font-semibold text-primary-foreground text-xs">
									#{index + 1}
								</Badge>
								<ProductCard
									product={product}
									quantity={product.variants.nodes[0]?.quantityAvailable}
									variantId={product.variants.nodes[0]?.id}
									view="list"
								/>
							</div>
						))}
					</div>

					{/* Desktop: Grid view */}
					<div className="hidden gap-6 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
						{products.slice(0, 5).map((product, index) => (
							<div className="group relative" key={product.id}>
								<div className="hover:-translate-y-1 relative overflow-hidden rounded-lg bg-neutral-100 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-neutral-950">
									{/* Best Seller Badge - Top Right */}
									<div className="absolute top-3 right-3 z-20">
										<Badge className="bg-primary font-semibold text-primary-foreground shadow-md">
											#{index + 1} Best Seller
										</Badge>
									</div>

									{/* Product Card */}
									<ProductCard
										product={product}
										quantity={product.variants.nodes[0]?.quantityAvailable}
										variantId={product.variants.nodes[0]?.id}
										view="grid"
									/>

									{/* Rating Section - Below Product Card */}
									<div className="flex items-center justify-between gap-2 rounded-b-lg bg-neutral-100 px-3 py-2 dark:bg-[#111111]">
										<div className="flex items-center gap-1">
											{[...new Array(5)].map((_, i) => (
												<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" key={i} />
											))}
											<span className="ml-1 text-muted-foreground text-xs">(4.8)</span>
										</div>
										<Badge className="border-primary/20 bg-primary/10 text-primary" variant="outline">
											<Award className="mr-1 h-3.5 w-3.5" />
											<span className="text-xs">Top Rated</span>
										</Badge>
									</div>
								</div>
							</div>
						))}
					</div>
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
