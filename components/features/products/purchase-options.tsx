"use client";

import { useState } from "react";
import { ShopifyProduct, ShopifyProductVariant } from "@/lib/types";
import { VariantSelector } from "./variant-selector";
import { AddToCartButton } from "./add-to-cart-button";
import { Clock } from "lucide-react";

interface PurchaseOptionsProps {
	product: ShopifyProduct;
	selectedVariant: ShopifyProductVariant | undefined;
	onVariantChange: (variant: ShopifyProductVariant) => void;
}

export function PurchaseOptions({ product, selectedVariant, onVariantChange }: PurchaseOptionsProps) {
	const [quantity, setQuantity] = useState(1);

	if (!selectedVariant) {
		return <div>No variant selected</div>;
	}

	return (
		<div className="space-y-6">
			{/* Variant Selector */}
			<VariantSelector product={product} selectedVariant={selectedVariant} onVariantChange={onVariantChange} />

			{/* Quantity Selector */}
			<div className="space-y-2">
				<label htmlFor="quantity" className="block text-sm font-medium">
					Quantity
				</label>
				<select id="quantity" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full p-2 border rounded-lg bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
					{[...Array(10)].map((_, i) => (
						<option key={i + 1} value={i + 1}>
							{i + 1}
						</option>
					))}
				</select>
			</div>

			{/* Shipping Info */}
			<div className="space-y-2">
				<h3 className="text-sm font-medium">Shipping</h3>
				{!selectedVariant.availableForSale ? (
					<p className="text-amber-600 dark:text-amber-500 font-medium flex items-center gap-1">
						<Clock className="h-4 w-4" />
						Ships in 2-3 weeks (Pre-order)
					</p>
				) : (
					<p className="text-green-600 dark:text-green-500">In stock - Ships in 1-2 business days</p>
				)}
			</div>

			{/* Add to Cart Button */}
			<AddToCartButton variantId={selectedVariant.id} availableForSale={selectedVariant.availableForSale} quantity={quantity} className="w-full" />
		</div>
	);
}
