"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/types/shopify";
import { useState } from "react";

interface ProductCardProps {
	product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
	const [imageLoaded, setImageLoaded] = useState(false);
	const image = product.images?.edges[0]?.node;

	return (
		<Link href={`/products/${product.handle}`} className="group">
			<div className="aspect-square overflow-hidden rounded-lg bg-gray-100">{image && <Image src={image.url} alt={image.altText || product.title} width={500} height={500} className={`h-full w-full object-cover object-center transition-all duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"} group-hover:scale-105`} onLoad={() => setImageLoaded(true)} />}</div>
			<div className="mt-4 space-y-1">
				<h3 className="text-sm font-medium">{product.title}</h3>
				<p className="text-sm text-gray-500">${product.priceRange.minVariantPrice.amount}</p>
			</div>
		</Link>
	);
}
