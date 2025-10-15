"use client";

import { ArrowRight, Play, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import { Link } from "@/components/ui/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { ShopifyProduct } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

type ProductSlideshowProps = {
	products: ShopifyProduct[];
};

export function ProductSlideshow({ products }: ProductSlideshowProps) {
	const [activeProductIndex, setActiveProductIndex] = useState(0);

	useEffect(() => {
		if (!products?.length) {
			return;
		}

		const interval = setInterval(() => {
			setActiveProductIndex((prevIndex) => (prevIndex + 1) % products.length);
		}, 5000);
		return () => clearInterval(interval);
	}, [products?.length]);

	if (!products?.length) {
		return null;
	}

	const activeProduct = products[activeProductIndex];
	const rating = 4.8; // Default rating since Shopify products don't have ratings built-in

	return (
		<div className="relative overflow-hidden bg-blue-50 text-black">
			<div className="w-full px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
				<div className="mx-auto grid max-w-[2000px] grid-cols-1 items-center gap-12 lg:grid-cols-2">
					<div className="text-center lg:text-left">
						<div className="mb-4">
							<p className="font-semibold text-blue-600 text-lg">THE HOME OF THE EASIEST WAY TO GROW MUSHROOMS</p>
						</div>
						<h1
							className="mb-4 font-extrabold text-4xl md:text-5xl lg:text-6xl"
							style={{ fontFamily: "'Spore', sans-serif" }}
						>
							MUSHROOM GROWING KIT IN A BAG
						</h1>
						<div className="mb-4 flex items-center justify-center lg:justify-start">
							{[...new Array(5)].map((_, i) => (
								<Star
									className={`h-5 w-5 ${i < Math.floor(rating) ? "fill-current text-yellow-400" : "text-muted-foreground"}`}
									key={i}
								/>
							))}
							<span className="ml-2">{rating} OUT OF 5!</span>
						</div>
						<div className="mb-8 flex flex-col justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 lg:justify-start">
							<Button asChild className="bg-blue-600 text-white hover:bg-blue-700" size="lg">
								<Link href="/shop">
									SHOP THIS COLLECTION <ArrowRight className="ml-2 h-5 w-5" />
								</Link>
							</Button>
							<Button
								className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
								onClick={() => alert("Video modal would open here")}
								size="lg"
								variant="outline"
							>
								<Play className="mr-2 h-5 w-5" /> HOW DO OUR BAGS WORK?
							</Button>
						</div>
					</div>

					<div className="relative">
						<div className="text-center">
							<div className="relative mx-auto h-[500px] w-[500px] overflow-hidden rounded-lg border border-foreground/10 transition-colors duration-200 hover:border-foreground/20">
								{activeProduct.images?.nodes[0] && (
									<Image
										alt={activeProduct.images.nodes[0].altText || activeProduct.title}
										className="rounded-lg object-contain shadow-lg transition-transform duration-300 hover:scale-105"
										fill
										priority
										sizes="(max-width: 1024px) 100vw, 500px"
										src={activeProduct.images.nodes[0].url}
									/>
								)}
							</div>
							<div className="mt-4">
								<h3 className="font-bold text-2xl">{activeProduct.title}</h3>
								<p className="mb-2 text-sm italic">{activeProduct.productType}</p>
								<div className="flex flex-col justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
									<Button asChild className="bg-blue-600 text-white hover:bg-blue-700" variant="secondary">
										<Link href={`/products/${activeProduct.handle}`}>
											View Product <ArrowRight className="ml-2 h-4 w-4" />
										</Link>
									</Button>
									<Button
										className="bg-foreground text-background hover:bg-foreground/90"
										onClick={() => alert(`Added ${activeProduct.title} to cart!`)}
									>
										Buy Now {formatPrice(activeProduct.priceRange.minVariantPrice.amount)}{" "}
										<ShoppingCart className="ml-2 h-4 w-4" />
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
