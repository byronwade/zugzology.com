"use client";

import Link from "next/link";
import Image from "next/image";
import { ShopifyProduct } from "@/lib/types";

interface ProductCardProps {
	product: ShopifyProduct;
	collectionHandle?: string;
	view?: "grid" | "list";
}

export function ProductCard({ product, collectionHandle, view = "grid" }: ProductCardProps) {
	const firstImage = product.images.edges[0]?.node;
	const firstVariant = product.variants.edges[0]?.node;
	const price = firstVariant?.price?.amount || "0";

	const productUrl = `/products/${product.handle}`;

	return (
		<Link prefetch={true} href={productUrl} className={`group ${view === "list" ? "flex gap-4" : ""}`}>
			<div className={`aspect-square overflow-hidden rounded-lg bg-gray-100 ${view === "list" ? "w-48" : "w-full"}`}>{firstImage && <Image src={firstImage.url} alt={firstImage.altText || product.title} width={firstImage.width || 500} height={firstImage.height || 500} className="h-full w-full object-cover object-center group-hover:opacity-75" />}</div>
			<div className={`mt-4 ${view === "list" ? "flex-1" : ""}`}>
				<h3 className="text-sm text-gray-700">{product.title}</h3>
				<p className="mt-1 text-sm text-gray-500">{product.availableForSale ? "In stock" : "Out of stock"}</p>
				<p className="text-sm font-medium text-gray-900">${parseFloat(price).toFixed(2)}</p>
			</div>
		</Link>
	);
}
