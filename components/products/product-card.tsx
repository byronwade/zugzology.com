"use client";

import Image from "next/image";
import Link from "next/link";
import { type Product } from "@/lib/types/shopify";
import { formatPrice, shimmer, toBase64 } from "@/lib/utils";
import { useRef, useEffect } from "react";

interface ProductCardProps {
	product: Product;
	priority?: boolean;
}

export function ProductCard({ product, priority }: ProductCardProps) {
	const firstImage = product.images.edges[0]?.node;
	const price = product.priceRange.minVariantPrice;
	const cardRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					observer.disconnect();
				}
			},
			{ rootMargin: "50px" }
		);

		if (cardRef.current) {
			observer.observe(cardRef.current);
		}

		return () => observer.disconnect();
	}, []);

	return (
		<div ref={cardRef}>
			<Link href={`/products/${product.handle}`} className="group block">
				<div className="border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
					{firstImage && (
						<div className="relative aspect-square">
							<Image
								src={firstImage.transformedSrc || firstImage.url}
								alt={firstImage.altText || product.title}
								width={firstImage.width || 400}
								height={firstImage.height || 400}
								quality={85}
								loading={priority ? "eager" : "lazy"}
								fetchPriority={priority ? "high" : "auto"}
								priority={priority}
								className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
								sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
								placeholder="blur"
								blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(400, 400))}`}
							/>
						</div>
					)}
					<div className="p-4">
						<h3 className="text-lg font-semibold group-hover:text-blue-600 transition-colors">{product.title}</h3>
						<p className="mt-1 text-sm text-gray-600">{formatPrice(price.amount, price.currencyCode)}</p>
						{!product.availableForSale && <p className="mt-2 text-sm text-red-600">Out of Stock</p>}
					</div>
				</div>
			</Link>
		</div>
	);
}
