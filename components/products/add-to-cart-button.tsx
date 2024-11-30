"use client";

import { useState } from "react";

interface AddToCartButtonProps {
	productId: string;
	variantId?: string;
	available: boolean;
	checkoutUrl?: string;
}

export function AddToCartButton({ productId, variantId, available, checkoutUrl }: AddToCartButtonProps) {
	const [quantity, setQuantity] = useState(1);

	const handleBuyNow = () => {
		if (checkoutUrl) {
			window.location.href = checkoutUrl;
		}
	};

	return (
		<div className="space-y-2">
			<div className="flex items-center gap-2">
				<select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="border rounded px-2 py-1">
					{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
						<option key={num} value={num}>
							{num}
						</option>
					))}
				</select>
				<button onClick={() => console.log("Add to cart:", { productId, variantId, quantity })} disabled={!available} className="w-full bg-yellow-400 hover:bg-yellow-500 py-2 px-4 rounded-full text-sm font-medium disabled:opacity-50">
					Add to Cart
				</button>
			</div>
			<button onClick={handleBuyNow} disabled={!available || !checkoutUrl} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-full text-sm font-medium disabled:opacity-50">
				Buy Now on Shopify
			</button>
		</div>
	);
}
