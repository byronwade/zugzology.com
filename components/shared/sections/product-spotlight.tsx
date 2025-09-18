import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Star, ArrowRight, ShoppingCart, Truck, Shield, Clock } from "lucide-react";
import Image from "next/image";
import type { ShopifyProduct } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/features/products/add-to-cart-button";

interface ProductSpotlightProps {
	product: ShopifyProduct;
}

export function ProductSpotlight({ product }: ProductSpotlightProps) {
	if (!product) return null;

	const variant = product.variants.nodes[0];
	if (!variant) return null;

	const features = [
		{
			icon: Truck,
			title: "Fast Shipping",
			description: "Free shipping on this item",
		},
		{
			icon: Shield,
			title: "Guaranteed Quality",
			description: "Lab-tested for optimal results",
		},
		{
			icon: Clock,
			title: "Quick Setup",
			description: "Ready to use in minutes",
		},
	];

	return (
		<section className="w-full py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-950">
			<div className="container mx-auto px-4 md:px-6">
				<div className="grid lg:grid-cols-2 gap-12 items-center">
					{/* Image Side with Gallery */}
					<div className="space-y-4">
						<div className="aspect-square rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg">
							<div className="relative h-full w-full">
								<Image src={product.images.nodes[0]?.url || "/placeholder.svg"} alt={product.title} fill className="object-cover" />
								{variant.compareAtPrice && <Badge className="absolute top-4 right-4 bg-red-500 text-white">Save {Math.round(((parseFloat(variant.compareAtPrice.amount) - parseFloat(variant.price.amount)) / parseFloat(variant.compareAtPrice.amount)) * 100)}%</Badge>}
							</div>
						</div>
						<div className="grid grid-cols-4 gap-4">
							{product.images.nodes.slice(1, 5).map((image, i) => (
								<div key={i} className="aspect-square rounded-lg overflow-hidden bg-white dark:bg-gray-800">
									<Image src={image.url} alt={`${product.title} - View ${i + 2}`} width={200} height={200} className="object-cover w-full h-full hover:scale-110 transition-transform duration-300" />
								</div>
							))}
						</div>
					</div>

					{/* Content Side */}
					<div className="flex flex-col">
						<Badge variant="secondary" className="w-fit mb-4 bg-primary/10 text-primary">
							Featured Product
						</Badge>

						<h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">{product.title}</h2>

						<div className="flex items-center mt-4 space-x-2">
							<div className="flex items-center">
								{[...Array(5)].map((_, i) => (
									<Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
								))}
							</div>
							<span className="text-sm text-gray-600 dark:text-gray-400">(120+ Reviews)</span>
						</div>

						<div className="mt-6 space-y-6">
							<p className="text-lg text-gray-600 dark:text-gray-400">{product.description}</p>

							<div className="grid gap-4 sm:grid-cols-3">
								{features.map((feature) => (
									<div key={feature.title} className="flex flex-col items-center text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
										<feature.icon className="h-6 w-6 text-primary mb-2" />
										<h3 className="font-medium text-gray-900 dark:text-gray-100">{feature.title}</h3>
										<p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
									</div>
								))}
							</div>

							<div className="flex items-baseline gap-4">
								<span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{formatPrice(parseFloat(variant.price.amount), variant.price.currencyCode)}</span>
								{variant.compareAtPrice && <span className="text-xl text-gray-500 dark:text-gray-400 line-through">{formatPrice(parseFloat(variant.compareAtPrice.amount), variant.compareAtPrice.currencyCode)}</span>}
							</div>

							<div className="flex flex-col sm:flex-row gap-4">
								<AddToCartButton variant="default" size="lg" productId={product.id} variantId={variant.id} className="bg-primary hover:bg-primary/90">
									<ShoppingCart className="mr-2 h-5 w-5" />
									Add to Cart
								</AddToCartButton>
								<Button size="lg" variant="outline" className="border-gray-200 dark:border-gray-800" asChild>
									<Link href={`/products/${product.handle}`}>
										Learn More <ArrowRight className="ml-2 h-5 w-5" />
									</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
