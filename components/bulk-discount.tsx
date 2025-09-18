"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingCart, Truck, Clock, Percent } from "lucide-react";
import { useState } from "react";

export function BulkDiscount() {
	const [quantity, setQuantity] = useState(5);

	// In a real app, this data would come from an API or CMS
	const bulkProduct = {
		id: "bulk-1",
		name: "Premium Mushroom Substrate Bags",
		description:
			"Pre-sterilized, ready-to-use substrate bags optimized for maximum yields. Perfect for commercial growers and serious hobbyists.",
		basePrice: 12.99,
		image: "/placeholder.svg",
		discountTiers: [
			{ minQuantity: 5, discount: 0 },
			{ minQuantity: 10, discount: 10 },
			{ minQuantity: 25, discount: 15 },
			{ minQuantity: 50, discount: 20 },
		],
		minOrder: 5,
		maxOrder: 100,
	};

	const getCurrentDiscount = () => {
		const applicableTier = [...bulkProduct.discountTiers].reverse().find((tier) => quantity >= tier.minQuantity);

		return applicableTier?.discount || 0;
	};

	const getNextDiscountTier = () => {
		const nextTier = bulkProduct.discountTiers.find((tier) => tier.minQuantity > quantity);

		return nextTier;
	};

	const discount = getCurrentDiscount();
	const nextTier = getNextDiscountTier();
	const pricePerUnit = bulkProduct.basePrice * (1 - discount / 100);
	const totalPrice = pricePerUnit * quantity;

	const decreaseQuantity = () => {
		if (quantity > bulkProduct.minOrder) {
			setQuantity(quantity - 1);
		}
	};

	const increaseQuantity = () => {
		if (quantity < bulkProduct.maxOrder) {
			setQuantity(quantity + 1);
		}
	};

	return (
		<section className="py-16 bg-gray-50">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<div className="relative aspect-square lg:aspect-auto lg:h-full bg-gray-100 rounded-xl overflow-hidden">
						<Image src={bulkProduct.image || "/placeholder.svg"} alt={bulkProduct.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
						{discount > 0 && (
							<div className="absolute top-4 left-4 bg-red-500 text-white font-bold rounded-full h-16 w-16 flex items-center justify-center text-xl">
								{discount}% OFF
							</div>
						)}
					</div>
					<div className="p-4 lg:p-6">
						<h2 className="text-2xl font-bold text-gray-900 sm:text-3xl mb-4">Bulk Discount: {bulkProduct.name}</h2>
						<p className="text-gray-600 mb-6">{bulkProduct.description}</p>

						<div className="space-y-6 mb-8">
							<div className="flex items-center text-sm text-gray-700">
								<Truck className="h-5 w-5 text-gray-400 mr-2" />
								<span>Free shipping on bulk orders over $100</span>
							</div>
							<div className="flex items-center text-sm text-gray-700">
								<Clock className="h-5 w-5 text-gray-400 mr-2" />
								<span>Ships within 2 business days</span>
							</div>
							<div className="flex items-center text-sm text-gray-700">
								<Percent className="h-5 w-5 text-gray-400 mr-2" />
								<span>Volume discounts automatically applied</span>
							</div>
						</div>

						<div className="bg-white p-4 rounded-lg mb-6">
							<div className="flex justify-between mb-2">
								<span className="text-gray-700">Base price:</span>
								<span className="font-medium">${bulkProduct.basePrice.toFixed(2)} each</span>
							</div>
							{discount > 0 && (
								<div className="flex justify-between mb-2">
									<span className="text-gray-700">Volume discount:</span>
									<span className="font-medium text-red-600">{discount}% off</span>
								</div>
							)}
							<div className="flex justify-between mb-2">
								<span className="text-gray-700">Your price:</span>
								<span className="font-bold">${pricePerUnit.toFixed(2)} each</span>
							</div>
							<div className="border-t border-gray-200 my-2 pt-2">
								<div className="flex justify-between">
									<span className="text-gray-700">Total ({quantity} items):</span>
									<span className="font-bold text-lg">${totalPrice.toFixed(2)}</span>
								</div>
							</div>
						</div>

						{nextTier && (
							<div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
								<p className="text-blue-800 text-sm">
									Add {nextTier.minQuantity - quantity} more to get {nextTier.discount}% off!
								</p>
							</div>
						)}

						<div className="flex items-center mb-6">
							<Button
								variant="outline"
								size="icon"
								onClick={decreaseQuantity}
								disabled={quantity <= bulkProduct.minOrder}
							>
								<Minus className="h-4 w-4" />
							</Button>
							<div className="w-16 mx-2">
								<input
									type="number"
									value={quantity}
									onChange={(e) => {
										const value = Number.parseInt(e.target.value);
										if (!isNaN(value) && value >= bulkProduct.minOrder && value <= bulkProduct.maxOrder) {
											setQuantity(value);
										}
									}}
									className="w-full text-center border border-gray-300 rounded-md py-2"
									min={bulkProduct.minOrder}
									max={bulkProduct.maxOrder}
								/>
							</div>
							<Button
								variant="outline"
								size="icon"
								onClick={increaseQuantity}
								disabled={quantity >= bulkProduct.maxOrder}
							>
								<Plus className="h-4 w-4" />
							</Button>
						</div>

						<Button className="w-full" size="lg">
							<ShoppingCart className="mr-2 h-5 w-5" />
							Add to Cart
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
