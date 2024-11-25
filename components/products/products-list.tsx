"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";
import type { Product } from "@/lib/types/shopify";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { useCart } from "@/lib/stores/cart";

interface ProductsListProps {
	products: Product[];
}

export function ProductsList({ products }: ProductsListProps) {
	const { addToCart } = useCart();

	const handleAddToCart = async (product: Product) => {
		const variant = product.variants.edges[0]?.node;
		if (!variant) return;

		await addToCart({
			merchandiseId: variant.id,
			quantity: 1,
		});
	};

	return (
		<div className="flex-1 divide-y">
			{products.map((product) => {
				const firstImage = product.images?.edges?.[0]?.node;
				const firstVariant = product.variants?.edges?.[0]?.node;
				const price = firstVariant?.price || product.priceRange?.minVariantPrice;

				return (
					<div key={product.id} className="flex p-4 bg-background">
						<div className="w-32 h-32 md:w-48 md:h-48 relative flex-shrink-0 bg-gray-100 flex items-center justify-center border-b border-gray-200 rounded-md">
							{firstImage && <Image src={firstImage.url} alt={firstImage.altText || product.title} fill className="object-contain rounded-md" sizes="(min-width: 768px) 192px, 128px" priority quality={65} />}
							<Button variant="ghost" size="icon" className="absolute bottom-0 left-0 bg-background/80 backdrop-blur-sm rounded-tr-md rounded-bl-md">
								<ImageIcon className="h-4 w-4" />
							</Button>
						</div>

						<div className="flex-grow pl-4 flex flex-col">
							<Link prefetch={true} href={`/products/${product.handle}`} className="hover:underline">
								<h2 className="font-medium text-base line-clamp-2">{product.title}</h2>
							</Link>

							<div className="mt-1">
								<span className="text-2xl font-bold">{formatPrice(price.amount, price.currencyCode)}</span>
							</div>

							<div className="mt-1 space-y-0.5 text-sm">
								<p>FREE delivery</p>
								{!firstVariant?.availableForSale && <p className="text-red-600">Out of Stock</p>}
							</div>

							<Button className="w-full mt-2 md:mt-3 md:max-w-[200px]" onClick={() => handleAddToCart(product)} disabled={!firstVariant?.availableForSale}>
								Add to cart
							</Button>

							{product.description && <p className="mt-4 text-sm text-muted-foreground line-clamp-2 md:line-clamp-3">{product.description}</p>}
						</div>
					</div>
				);
			})}
		</div>
	);
}
