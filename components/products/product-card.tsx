"use client";

import Image from "next/image";
import Link from "next/link";
import { type Product } from "@/lib/types/shopify";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
	product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
	const firstImage = product.images.edges[0]?.node;
	const price = product.priceRange.minVariantPrice;

	return (
		<Link href={`/products/${product.handle}`} className="group block">
			<div className="border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
				{firstImage && (
					<div className="relative aspect-square">
						<Image src={firstImage.url} alt={firstImage.altText || product.title} fill className="object-cover transform group-hover:scale-105 transition-transform duration-300" sizes="(min-width: 768px) 33vw, 100vw" loading="lazy" quality={85} />
					</div>
				)}
				<div className="p-4">
					<h3 className="text-lg font-semibold group-hover:text-blue-600 transition-colors">{product.title}</h3>
					<p className="mt-1 text-sm text-gray-600">{formatPrice(price.amount, price.currencyCode)}</p>
					{!product.availableForSale && <p className="mt-2 text-sm text-red-600">Out of Stock</p>}
				</div>
			</div>
		</Link>
	);
}
