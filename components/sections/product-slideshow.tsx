"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/components/ui/link";
import { ArrowRight, ShoppingCart, Star, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import type { ShopifyProduct } from "@/lib/types";

interface ProductSlideshowProps {
	products: ShopifyProduct[];
}

export function ProductSlideshow({ products }: ProductSlideshowProps) {
	const [activeProductIndex, setActiveProductIndex] = useState(0);

	useEffect(() => {
		if (!products?.length) return;

		const interval = setInterval(() => {
			setActiveProductIndex((prevIndex) => (prevIndex + 1) % products.length);
		}, 5000);
		return () => clearInterval(interval);
	}, [products?.length]);

	if (!products?.length) return null;

	const activeProduct = products[activeProductIndex];
	const rating = 4.8; // Default rating since Shopify products don't have ratings built-in

	return (
		<div className="relative overflow-hidden bg-blue-50 text-black">
			<div className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-[2000px] mx-auto">
					<div className="text-center lg:text-left">
						<div className="mb-4">
							<p className="text-lg font-semibold text-blue-600">THE HOME OF THE EASIEST WAY TO GROW MUSHROOMS</p>
						</div>
						<h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4" style={{ fontFamily: "'Spore', sans-serif" }}>
							MUSHROOM GROWING KIT IN A BAG
						</h1>
						<div className="flex items-center justify-center lg:justify-start mb-4">
							{[...Array(5)].map((_, i) => (
								<Star key={i} className={`w-5 h-5 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
							))}
							<span className="ml-2">{rating} OUT OF 5!</span>
						</div>
						<div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
							<Button asChild size="lg" className="bg-blue-600 text-white hover:bg-blue-700">
								<Link href="/shop">
									SHOP THIS COLLECTION <ArrowRight className="ml-2 h-5 w-5" />
								</Link>
							</Button>
							<Button variant="outline" size="lg" onClick={() => alert("Video modal would open here")} className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
								<Play className="mr-2 h-5 w-5" /> HOW DO OUR BAGS WORK?
							</Button>
						</div>
					</div>

					<div className="relative">
						<div className="text-center">
							<div className="relative w-[500px] h-[500px] mx-auto border border-foreground/10 hover:border-foreground/20 transition-colors duration-200 rounded-lg overflow-hidden">{activeProduct.images?.edges[0]?.node && <Image src={activeProduct.images.edges[0].node.url} alt={activeProduct.images.edges[0].node.altText || activeProduct.title} fill className="rounded-lg shadow-lg object-contain hover:scale-105 transition-transform duration-300" priority />}</div>
							<div className="mt-4">
								<h3 className="text-2xl font-bold">{activeProduct.title}</h3>
								<p className="text-sm italic mb-2">{activeProduct.productType}</p>
								<div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
									<Button asChild variant="secondary" className="bg-blue-600 text-white hover:bg-blue-700">
										<Link href={`/products/${activeProduct.handle}`}>
											View Product <ArrowRight className="ml-2 h-4 w-4" />
										</Link>
									</Button>
									<Button onClick={() => alert(`Added ${activeProduct.title} to cart!`)} className="bg-black text-white hover:bg-gray-800">
										Buy Now {formatPrice(activeProduct.priceRange.minVariantPrice.amount)} <ShoppingCart className="ml-2 h-4 w-4" />
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
