"use client";

import Image from "next/image";
import { ValidatedLink } from "@/components/ui/validated-link";

interface ProductCardProps {
	id: string;
	name: string;
	description?: string;
	price: number;
	image: string;
	isFeatured?: boolean;
}

interface OptimizedProduct {
	id: string;
	title: string;
	handle: string;
	description: string;
	price: string;
	compareAtPrice: string | null;
	isOnSale: boolean;
	featuredImage?: {
		url: string;
		altText?: string;
		blurDataURL?: string;
	};
	tags?: string[];
}

function formatProductPrice(price: string): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
	}).format(parseFloat(price));
}

export function ProductCard({ id, name, description, price, image, isFeatured }: ProductCardProps) {
	return (
		<ValidatedLink href={`/products/${id}`} className="group block">
			<div className="relative overflow-hidden rounded-lg mb-3 bg-gray-100">
				<Image
					src={image}
					alt={name}
					width={500}
					height={500}
					className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
					sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
					loading="lazy"
				/>
				{isFeatured && (
					<div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
						Featured
					</div>
				)}
			</div>
			<h3 className="text-lg font-medium text-gray-900 group-hover:text-primary transition-colors">{name}</h3>
			{description && <p className="mt-1 text-sm text-gray-600 line-clamp-2">{description}</p>}
			<div className="mt-2 font-semibold text-gray-900">${price.toFixed(2)}</div>
		</ValidatedLink>
	);
}

export function ShopifyProductCard({ product }: { product: OptimizedProduct }) {
	const isFeatured = product.tags?.includes("featured") || product.tags?.includes("best-seller");

	return (
		<ValidatedLink href={`/products/${product.handle}`} className="group block">
			<div className="relative overflow-hidden rounded-lg mb-3 bg-gray-100">
				<Image
					src={product.featuredImage?.url || "/placeholder-product.png"}
					alt={product.featuredImage?.altText || product.title}
					width={500}
					height={500}
					className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
					sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
					loading="lazy"
					blurDataURL={product.featuredImage?.blurDataURL}
					placeholder={product.featuredImage?.blurDataURL ? "blur" : "empty"}
				/>
				{product.isOnSale && (
					<div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">Sale</div>
				)}
				{isFeatured && !product.isOnSale && (
					<div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
						Featured
					</div>
				)}
			</div>
			<h3 className="text-lg font-medium text-gray-900 group-hover:text-primary transition-colors">{product.title}</h3>
			<div className="mt-1 flex items-center">
				<span className={`text-gray-900 ${product.isOnSale ? "font-bold text-red-600" : ""}`}>
					{formatProductPrice(product.price)}
				</span>
				{product.isOnSale && product.compareAtPrice && (
					<span className="ml-2 text-sm text-gray-500 line-through">{formatProductPrice(product.compareAtPrice)}</span>
				)}
			</div>
		</ValidatedLink>
	);
}
