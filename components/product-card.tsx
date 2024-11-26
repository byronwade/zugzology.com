"use client";

import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/utils/formatters";

interface Money {
	amount: string;
	currencyCode: string;
}

interface ProductCardProps {
	product: {
		id: string;
		title: string;
		handle: string;
		description: string;
		price: Money;
		compareAtPrice?: Money | null;
		image: {
			url: string;
			altText: string | null;
			width: number;
			height: number;
		} | null;
		availableForSale: boolean;
	};
}

export default function ProductCard({ product }: ProductCardProps) {
	console.log("Product price data:", {
		price: product.price,
		compareAtPrice: product.compareAtPrice,
	});

	if (!product?.price?.amount || !product?.price?.currencyCode) {
		console.warn("Missing price data for product:", product.title);
		return null;
	}

	const formattedPrice = formatMoney(product.price.amount, product.price.currencyCode);

	return (
		<Link href={`/products/${product.handle}`} className="group">
			<div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg">
				{product.image ? (
					<Image src={product.image.url} alt={product.image.altText || product.title} width={400} height={400} className="h-full w-full object-cover object-center group-hover:opacity-75" />
				) : (
					<div className="h-full w-full bg-gray-200 flex items-center justify-center">
						<span className="text-gray-400">No image</span>
					</div>
				)}
			</div>
			<h3 className="mt-4 text-sm text-gray-700">{product.title}</h3>
			<div className="mt-1 flex items-center gap-2">
				<p className="text-lg font-medium text-gray-900">{formattedPrice}</p>
				{product.compareAtPrice && <p className="text-sm text-gray-500 line-through">{formatMoney(product.compareAtPrice.amount, product.compareAtPrice.currencyCode)}</p>}
			</div>
			{!product.availableForSale && <p className="mt-1 text-sm text-red-500">Out of stock</p>}
		</Link>
	);
}
