import { Package, ShoppingBag, ArrowRight, Sparkles, Star, Tag, TrendingUp, Leaf, Zap, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

interface EmptyStateProps {
	title?: string;
	description?: string;
	showCollectionCards?: boolean;
	type?: "products" | "search" | "filtered" | "wishlist" | "cart";
	searchQuery?: string;
}

export function EmptyState({
	title = "No Products Found",
	description = "We couldn't find any products to display at the moment. Check out our latest arrivals or browse all products.",
	showCollectionCards = true,
	type = "products",
	searchQuery = "",
}: EmptyStateProps) {
	return (
		<div className="w-full py-12 px-4">
			<div className="max-w-3xl mx-auto text-center">
				<div className="bg-accent/50 rounded-xl p-8 md:p-12">
					<div className="mb-6">
						<div className="bg-background rounded-full w-20 h-20 mx-auto mb-5 flex items-center justify-center shadow-sm">
							{type === "search" && <Search className="w-10 h-10 text-primary" />}
							{type === "filtered" && <Tag className="w-10 h-10 text-primary" />}
							{type === "wishlist" && <Star className="w-10 h-10 text-primary" />}
							{type === "cart" && <ShoppingBag className="w-10 h-10 text-primary" />}
							{type === "products" && <Package className="w-10 h-10 text-primary" />}
						</div>

						<h2 className="text-2xl md:text-3xl font-bold mb-3">{title}</h2>
						<p className="text-muted-foreground text-lg mb-8">{description}</p>
					</div>

					<div className="grid gap-4 md:flex md:gap-6 justify-center mb-8">
						<Button asChild size="lg" className="gap-2">
							<Link href="/products">
								<ShoppingBag className="w-5 h-5" />
								Browse All Products
							</Link>
						</Button>

						{type === "search" ? (
							<Button asChild variant="outline" size="lg" className="gap-2">
								<Link href="/collections/best-sellers">
									<Star className="w-5 h-5" />
									Best Sellers
								</Link>
							</Button>
						) : (
							<Button asChild variant="outline" size="lg" className="gap-2">
								<Link href="/collections/new-arrivals">
									Latest Arrivals
									<ArrowRight className="w-5 h-5" />
								</Link>
							</Button>
						)}
					</div>

					{showCollectionCards && (
						<div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
							<Link href="/collections/new-arrivals" className="block group">
								<div className="p-6 rounded-lg bg-background hover:bg-accent transition-colors border border-border group-hover:border-primary/20">
									<div className="flex items-center justify-center mb-4">
										<Zap className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
									</div>
									<h3 className="font-medium text-lg mb-2">New Arrivals</h3>
									<p className="text-sm text-muted-foreground">Discover our latest products and innovations</p>
								</div>
							</Link>

							<Link href="/collections/best-sellers" className="block group">
								<div className="p-6 rounded-lg bg-background hover:bg-accent transition-colors border border-border group-hover:border-primary/20">
									<div className="flex items-center justify-center mb-4">
										<TrendingUp className="w-8 h-8 text-green-500 group-hover:scale-110 transition-transform" />
									</div>
									<h3 className="font-medium text-lg mb-2">Best Sellers</h3>
									<p className="text-sm text-muted-foreground">Shop our most popular and highly rated items</p>
								</div>
							</Link>

							<Link href="/collections/featured" className="block group">
								<div className="p-6 rounded-lg bg-background hover:bg-accent transition-colors border border-border group-hover:border-primary/20">
									<div className="flex items-center justify-center mb-4">
										<Sparkles className="w-8 h-8 text-amber-500 group-hover:scale-110 transition-transform" />
									</div>
									<h3 className="font-medium text-lg mb-2">Featured Collection</h3>
									<p className="text-sm text-muted-foreground">Handpicked selections you'll love</p>
								</div>
							</Link>
						</div>
					)}

					{type === "search" && searchQuery && (
						<div className="mt-8 bg-background rounded-lg p-6 border border-border">
							<h3 className="font-medium text-lg mb-3">Search Tips</h3>
							<ul className="text-sm text-muted-foreground space-y-2 text-left list-disc pl-5">
								<li>Check the spelling of your search terms</li>
								<li>Try using more general keywords (e.g., "shirt" instead of "blue cotton shirt")</li>
								<li>Search for related terms or alternative product names</li>
								<li>Remove filters if you're using any</li>
							</ul>
						</div>
					)}

					{type === "filtered" && (
						<div className="mt-8 bg-background rounded-lg p-6 border border-border">
							<h3 className="font-medium text-lg mb-3">Filter Tips</h3>
							<ul className="text-sm text-muted-foreground space-y-2 text-left list-disc pl-5">
								<li>Try selecting fewer filter options</li>
								<li>Expand your price range</li>
								<li>Consider different product categories</li>
								<li>Clear all filters and start over</li>
							</ul>
							<div className="mt-4">
								<Button variant="outline" size="sm" asChild>
									<Link href="/products">Clear All Filters</Link>
								</Button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
