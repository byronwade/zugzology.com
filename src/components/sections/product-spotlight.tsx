import { ArrowRight, Clock, Shield, ShoppingCart, Star, Truck } from "lucide-react";
import Image from "next/image";
import { Link } from "@/components/ui/link";
import { AddToCartButton } from "@/components/features/products/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ShopifyProduct } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

type ProductSpotlightProps = {
	product: ShopifyProduct;
};

export function ProductSpotlight({ product }: ProductSpotlightProps) {
	if (!product) {
		return null;
	}

	const variant = product.variants.nodes[0];
	if (!variant) {
		return null;
	}

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
		<section className="w-full bg-gradient-to-b from-muted to-background">
			<div className="container mx-auto px-4 py-12">
				<div className="grid items-center gap-12 lg:grid-cols-2">
					{/* Image Side with Gallery */}
					<div className="space-y-4">
						<div className="aspect-square overflow-hidden rounded-xl bg-card shadow-lg">
							<div className="relative h-full w-full">
								<Image
									alt={product.title}
									className="object-cover"
									fill
									sizes="(max-width: 1024px) 100vw, 50vw"
									src={product.images.nodes[0]?.url || "/placeholder.svg"}
								/>
								{variant.compareAtPrice && (
									<Badge className="absolute top-4 right-4 bg-red-500 text-white">
										Save{" "}
										{Math.round(
											((Number.parseFloat(variant.compareAtPrice.amount) - Number.parseFloat(variant.price.amount)) /
												Number.parseFloat(variant.compareAtPrice.amount)) *
												100
										)}
										%
									</Badge>
								)}
							</div>
						</div>
						<div className="grid grid-cols-4 gap-4">
							{product.images.nodes.slice(1, 5).map((image, i) => (
								<div className="aspect-square overflow-hidden rounded-lg bg-card" key={i}>
									<Image
										alt={`${product.title} - View ${i + 2}`}
										className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
										height={200}
										src={image.url}
										width={200}
									/>
								</div>
							))}
						</div>
					</div>

					{/* Content Side */}
					<div className="flex flex-col">
						<Badge className="mb-4 w-fit bg-primary/10 text-primary" variant="secondary">
							Featured Product
						</Badge>

						<h2 className="font-bold text-3xl text-foreground tracking-tight sm:text-4xl">{product.title}</h2>

						<div className="mt-4 flex items-center space-x-2">
							<div className="flex items-center">
								{[...new Array(5)].map((_, i) => (
									<Star className="h-5 w-5 fill-yellow-400 text-yellow-400" key={i} />
								))}
							</div>
							<span className="text-muted-foreground text-sm">(120+ Reviews)</span>
						</div>

						<div className="mt-6 space-y-6">
							<p className="text-lg text-muted-foreground">{product.description}</p>

							<div className="grid gap-4 sm:grid-cols-3">
								{features.map((feature) => (
									<div className="flex flex-col items-center rounded-lg bg-muted p-4 text-center" key={feature.title}>
										<feature.icon className="mb-2 h-6 w-6 text-primary" />
										<h3 className="font-medium text-foreground">{feature.title}</h3>
										<p className="text-muted-foreground text-sm">{feature.description}</p>
									</div>
								))}
							</div>

							<div className="flex items-baseline gap-4">
								<span className="font-bold text-3xl text-foreground">
									{formatPrice(Number.parseFloat(variant.price.amount), variant.price.currencyCode)}
								</span>
								{variant.compareAtPrice && (
									<span className="text-muted-foreground text-xl line-through">
										{formatPrice(Number.parseFloat(variant.compareAtPrice.amount), variant.compareAtPrice.currencyCode)}
									</span>
								)}
							</div>

							<div className="flex flex-col gap-4 sm:flex-row">
								<AddToCartButton
									className="bg-primary hover:bg-primary/90"
									productId={product.id}
									size="lg"
									variant="default"
									variantId={variant.id}
								>
									<ShoppingCart className="mr-2 h-5 w-5" />
									Add to Cart
								</AddToCartButton>
								<Button asChild className="border" size="lg" variant="outline">
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
