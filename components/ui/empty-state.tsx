import { Package, ShoppingBag, ArrowRight, Sparkles, Star, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";

interface EmptyStateProps {
	title?: string;
	description?: string;
	showCollectionCards?: boolean;
}

export function EmptyState({ title = "No Products Found", description = "We couldn't find any products to display at the moment. Check out our latest arrivals or browse all products.", showCollectionCards = true }: EmptyStateProps) {
	return (
		<div className="w-full py-12 px-4">
			<div className="max-w-3xl mx-auto text-center">
				<div className="bg-accent/50 rounded-xl p-8 md:p-12">
					<div className="mb-6">
						<div className="bg-background rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
							<Package className="w-8 h-8 text-primary" />
						</div>
						<h2 className="text-2xl md:text-3xl font-bold mb-3">{title}</h2>
						<p className="text-muted-foreground text-lg mb-6">{description}</p>
					</div>

					<div className="grid gap-4 md:flex md:gap-6 justify-center">
						<Button asChild size="lg" className="gap-2">
							<Link href="/products">
								<ShoppingBag className="w-5 h-5" />
								Browse All Products
							</Link>
						</Button>
						<Button asChild variant="outline" size="lg" className="gap-2">
							<Link href="/collections/new-arrivals">
								Latest Arrivals
								<ArrowRight className="w-5 h-5" />
							</Link>
						</Button>
					</div>

					{showCollectionCards && (
						<div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
							<Link href="/collections/new-arrivals" className="block">
								<div className="p-4 rounded-lg bg-background hover:bg-accent transition-colors">
									<div className="flex items-center justify-center mb-3">
										<Sparkles className="w-6 h-6 text-primary" />
									</div>
									<h3 className="font-medium mb-1">New Arrivals</h3>
									<p className="text-sm text-muted-foreground">Check out our latest products</p>
								</div>
							</Link>

							<Link href="/collections/best-sellers" className="block">
								<div className="p-4 rounded-lg bg-background hover:bg-accent transition-colors">
									<div className="flex items-center justify-center mb-3">
										<Star className="w-6 h-6 text-primary" />
									</div>
									<h3 className="font-medium mb-1">Best Sellers</h3>
									<p className="text-sm text-muted-foreground">Our most popular items</p>
								</div>
							</Link>

							<Link href="/sale" className="block">
								<div className="p-4 rounded-lg bg-background hover:bg-accent transition-colors">
									<div className="flex items-center justify-center mb-3">
										<Tag className="w-6 h-6 text-primary" />
									</div>
									<h3 className="font-medium mb-1">Special Offers</h3>
									<p className="text-sm text-muted-foreground">Great deals and discounts</p>
								</div>
							</Link>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
