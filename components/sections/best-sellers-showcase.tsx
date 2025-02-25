import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, Award } from "lucide-react";
import type { ShopifyProduct } from "@/lib/types";

interface BestSellersShowcaseProps {
	products: ShopifyProduct[];
}

export function BestSellersShowcase({ products }: BestSellersShowcaseProps) {
	if (!products?.length) return null;

	return (
		<section className="relative w-full py-16 overflow-hidden bg-gray-50 dark:bg-gray-900/50">
			{/* Background Pattern */}
			<div className="absolute inset-0 z-0 opacity-5">
				<div
					className="absolute inset-0"
					style={{
						backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
					}}
				/>
			</div>

			<div className="relative z-10 container mx-auto px-4 md:px-6">
				<div className="flex flex-col items-center text-center mb-12">
					<div className="flex items-center gap-2 mb-4">
						<TrendingUp className="h-6 w-6 text-primary" />
						<Badge variant="secondary" className="bg-primary/10 text-primary">
							Most Popular
						</Badge>
					</div>
					<h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">Best Sellers</h2>
					<p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl">Our most popular products, trusted by thousands of cultivators</p>
				</div>

				<div className="relative">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{products.slice(0, 4).map((product, index) => (
							<div key={product.id} className="group relative">
								<div className="absolute -top-4 left-4 z-20">
									<Badge className="bg-primary text-white font-semibold">#{index + 1} Best Seller</Badge>
								</div>
								<div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
									<ProductCard product={product} view="grid" variantId={product.variants.nodes[0]?.id} quantity={product.variants.nodes[0]?.quantityAvailable} />
									<div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
										<div className="flex items-center space-x-1">
											{[...Array(5)].map((_, i) => (
												<Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
											))}
										</div>
										<Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
											<Award className="h-4 w-4 mr-1" />
											Top Rated
										</Badge>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="mt-12 text-center">
					<Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
						<Link href="/collections/best-sellers">View All Best Sellers</Link>
					</Button>
				</div>
			</div>
		</section>
	);
}
