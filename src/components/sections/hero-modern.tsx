"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PrefetchLink } from "@/components/ui/prefetch-link";
import type { ShopifyProduct } from "@/lib/types";

type HeroModernProps = {
	products?: ShopifyProduct[];
};

export function HeroModern({ products = [] }: HeroModernProps) {
	const [isVisible, setIsVisible] = useState(false);
	const featuredProduct = products[0];

	useEffect(() => {
		setIsVisible(true);
	}, []);

	return (
		<section className="relative min-h-[90vh] overflow-hidden bg-background">
			{/* Subtle gradient background */}
			<div className="absolute inset-0 bg-gradient-to-b from-muted/50 via-background to-background" />

			{/* Animated gradient orb - subtle and minimal */}
			<div className="absolute top-1/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-primary/5 blur-3xl" style={{ animationDuration: "8s" }} />

			<div className="container relative z-10 mx-auto px-4">
				<div className="flex min-h-[90vh] items-center">
					<div className="grid w-full items-center gap-12 lg:grid-cols-2 lg:gap-16">
						{/* Left Content - Ultra Minimal */}
						<div className={`space-y-8 transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
							{/* Small badge */}
							<div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 backdrop-blur-sm">
								<Sparkles className="h-3.5 w-3.5 text-primary" />
								<span className="text-foreground/70 text-sm">Premium Cultivation Supplies</span>
							</div>

							{/* Massive, bold headline */}
							<div className="space-y-4">
								<h1 className="font-bold text-6xl leading-[1.1] tracking-tight text-foreground md:text-7xl lg:text-8xl">
									Grow
									<br />
									<span className="text-primary">Better</span>
									<br />
									Mushrooms
								</h1>

								<p className="max-w-lg text-lg text-muted-foreground md:text-xl">
									Professional-grade supplies for serious growers.
									<br />
									<span className="text-foreground">Simple. Reliable. Results.</span>
								</p>
							</div>

							{/* Clean CTAs */}
							<div className="flex flex-wrap gap-4">
								<Button asChild className="h-12 px-8 text-base" size="lg">
									<PrefetchLink href="/products">
										Start Growing
										<ArrowRight className="ml-2 h-4 w-4" />
									</PrefetchLink>
								</Button>
								<Button asChild className="h-12 px-8 text-base" size="lg" variant="outline">
									<PrefetchLink href="/collections/all">View Collections</PrefetchLink>
								</Button>
							</div>

							{/* Minimal stats - clean and simple */}
							<div className="grid grid-cols-3 gap-6 pt-8 lg:gap-8">
								<div className="space-y-1">
									<div className="font-bold text-3xl text-foreground">10K+</div>
									<div className="text-muted-foreground text-sm">Growers</div>
								</div>
								<div className="space-y-1">
									<div className="font-bold text-3xl text-foreground">95%</div>
									<div className="text-muted-foreground text-sm">Success</div>
								</div>
								<div className="space-y-1">
									<div className="font-bold text-3xl text-foreground">24/7</div>
									<div className="text-muted-foreground text-sm">Support</div>
								</div>
							</div>
						</div>

						{/* Right Content - Featured Product Image (minimal) */}
						{featuredProduct?.images?.nodes?.[0] && (
							<div className={`relative hidden lg:block transition-all duration-1000 delay-300 ${isVisible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}`}>
								<div className="relative aspect-square overflow-hidden rounded-3xl border bg-muted/50">
									{/* Product Image */}
									<Image
										alt={featuredProduct.title}
										className="object-cover transition-transform duration-700 hover:scale-105"
										fill
										priority
										sizes="(max-width: 1024px) 100vw, 50vw"
										src={featuredProduct.images.nodes[0].url}
									/>

									{/* Minimal overlay with product info */}
									<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent">
										<div className="absolute bottom-0 left-0 right-0 p-8 text-white">
											<div className="space-y-2">
												<div className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-medium">Featured</div>
												<h3 className="font-semibold text-2xl">{featuredProduct.title}</h3>
												<PrefetchLink className="inline-flex items-center gap-2 text-sm text-white/80 transition-colors hover:text-white" href={`/products/${featuredProduct.handle}`}>
													View Product
													<ArrowRight className="h-4 w-4" />
												</PrefetchLink>
											</div>
										</div>
									</div>
								</div>

								{/* Floating badge - minimal decoration */}
								<div className="absolute -top-4 -right-4 rounded-2xl border bg-background p-4 shadow-lg">
									<div className="text-center">
										<div className="font-bold text-2xl text-primary">Free</div>
										<div className="text-muted-foreground text-xs">Shipping $75+</div>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
