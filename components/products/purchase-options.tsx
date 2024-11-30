"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShoppingCart, CreditCard } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VariantSelector } from "./variant-selector";
import { ShopifyProduct, ShopifyProductVariant } from "@/lib/types";

interface PurchaseOptionsProps {
	product: ShopifyProduct;
	selectedVariant: ShopifyProductVariant;
	onVariantChange: (variant: ShopifyProductVariant) => void;
}

type PurchaseType = "one-time" | "subscription";
type SubscriptionInterval = "weekly" | "biweekly" | "monthly";

const SUBSCRIPTION_DISCOUNTS = {
	weekly: 20,
	biweekly: 15,
	monthly: 10,
};

export function PurchaseOptions({ product, selectedVariant, onVariantChange }: PurchaseOptionsProps) {
	const [purchaseType, setPurchaseType] = useState<PurchaseType>("one-time");
	const [subscriptionInterval, setSubscriptionInterval] = useState<SubscriptionInterval>("monthly");
	const [quantity, setQuantity] = useState("1");

	const status = {
		isPreOrder: selectedVariant?.quantityAvailable <= 0,
		get buttonText() {
			return this.isPreOrder ? "Pre-Order Now" : "Buy Now";
		},
		get addToCartText() {
			return this.isPreOrder ? "Add Pre-Order" : "Add to Cart";
		},
		get text() {
			return this.isPreOrder ? "Available for Pre-Order" : selectedVariant?.availableForSale ? "In Stock" : "Out of Stock";
		},
		get color() {
			return this.isPreOrder ? "text-blue-600" : selectedVariant?.availableForSale ? "text-green-600" : "text-red-600";
		},
	};

	const variantPrice = selectedVariant?.price?.amount || "0";
	const basePrice = parseFloat(variantPrice);

	return (
		<div className="sticky top-20 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-md bg-white dark:bg-gray-800">
			<div className="space-y-4">
				{/* Price Section */}
				<div className="flex flex-col">
					<span className="text-3xl text-primary font-bold">${formatPrice(basePrice)}</span>
					<span className="text-sm text-gray-500 dark:text-gray-400 line-through">${formatPrice(basePrice * 1.2)}</span>
					<div className="text-sm text-green-700 dark:text-green-500 font-medium">Save ${formatPrice(basePrice * 0.2)} (20% off)</div>
				</div>

				{/* Purchase Type Selection */}
				<div className="space-y-2">
					<label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
						<input type="radio" name="purchase-type" checked={purchaseType === "one-time"} onChange={() => setPurchaseType("one-time")} className="text-primary" />
						<div>
							<div className="font-medium">One-time purchase</div>
							<div className="text-2xl font-bold text-primary">${formatPrice(basePrice)}</div>
						</div>
					</label>

					<div className="border rounded-lg">
						<label className="flex items-start gap-2 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
							<input type="radio" name="purchase-type" checked={purchaseType === "subscription"} onChange={() => setPurchaseType("subscription")} className="mt-1 text-primary" />
							<div>
								<div className="font-medium">Subscribe & Save</div>
								<div className="text-sm text-gray-500">Save up to 20% and never run out</div>
							</div>
						</label>

						{purchaseType === "subscription" && (
							<div className="p-3 border-t space-y-2">
								{Object.entries(SUBSCRIPTION_DISCOUNTS).map(([interval, discount]) => (
									<label key={interval} className="flex items-center justify-between p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
										<div className="flex items-center gap-2">
											<input type="radio" name="subscription-interval" checked={subscriptionInterval === interval} onChange={() => setSubscriptionInterval(interval as SubscriptionInterval)} className="text-primary" />
											<span className="text-sm">Every {interval === "biweekly" ? "2 weeks" : interval.replace("ly", "")}</span>
										</div>
										<div className="text-sm font-medium text-primary">${formatPrice(basePrice * (1 - discount / 100))}</div>
									</label>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Quantity and Purchase Buttons */}
				<div className="space-y-4">
					<div>
						<span className={`text-sm font-medium ${status.color}`}>{status.text}</span>
						{!status.isPreOrder && selectedVariant?.quantityAvailable > 0 && <span className="text-sm text-gray-500 ml-2">({selectedVariant.quantityAvailable} available)</span>}
					</div>

					<div className="flex items-center gap-3">
						<select value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-24 border rounded-md p-2">
							{[1, 2, 3, 4, 5].map((num) => (
								<option key={num} value={num}>
									{num}
								</option>
							))}
						</select>

						<button
							onClick={() => {
								/* Add to cart logic */
							}}
							disabled={!selectedVariant?.availableForSale}
							className="flex-1 bg-primary text-white py-2 px-4 rounded-md font-medium disabled:opacity-50"
						>
							{status.addToCartText}
						</button>
					</div>

					<button
						onClick={() => {
							/* Buy now logic */
						}}
						disabled={!selectedVariant?.availableForSale}
						className="w-full bg-black text-white py-2 px-4 rounded-md font-medium disabled:opacity-50"
					>
						{status.buttonText}
					</button>
				</div>
			</div>
		</div>
	);
}
