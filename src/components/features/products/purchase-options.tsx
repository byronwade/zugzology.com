"use client";

import { Clock } from "lucide-react";
import { useState } from "react";
import type { ShopifyProduct, ShopifyProductVariant } from "@/lib/types";
import { AddToCartButton } from "./add-to-cart-button";
import { VariantSelector } from "./variant-selector";

type PurchaseOptionsProps = {
	product: ShopifyProduct;
	selectedVariant: ShopifyProductVariant | undefined;
	onVariantChange: (variant: ShopifyProductVariant) => void;
};

export function PurchaseOptions({ product, selectedVariant, onVariantChange }: PurchaseOptionsProps) {
	const [quantity, setQuantity] = useState(1);

	if (!selectedVariant) {
		return <div>No variant selected</div>;
	}

	return (
		<div className="space-y-6">
			{/* Variant Selector */}
			<VariantSelector onVariantChange={onVariantChange} product={product} selectedVariant={selectedVariant} />

			{/* Quantity Selector */}
			<div className="space-y-2">
				<label className="block font-medium text-sm" htmlFor="quantity">
					Quantity
				</label>
				<select
					className="w-full rounded-lg border border-neutral-200 bg-white p-2 dark:border-neutral-700 dark:bg-neutral-800"
					id="quantity"
					onChange={(e) => setQuantity(Number(e.target.value))}
					value={quantity}
				>
					{[...new Array(10)].map((_, i) => (
						<option key={i + 1} value={i + 1}>
							{i + 1}
						</option>
					))}
				</select>
			</div>

			{/* Shipping Info */}
			<div className="space-y-2">
				<h3 className="font-medium text-sm">Shipping</h3>
				{selectedVariant.availableForSale ? (
					<p className="text-green-600 dark:text-green-500">In stock - Ships in 1-2 business days</p>
				) : (
					<p className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-500">
						<Clock className="h-4 w-4" />
						Ships in 2-3 weeks (Pre-order)
					</p>
				)}
			</div>

			{/* Add to Cart Button */}
			<AddToCartButton
				availableForSale={selectedVariant.availableForSale}
				className="w-full"
				quantity={quantity}
				variantId={selectedVariant.id}
			/>
		</div>
	);
}
