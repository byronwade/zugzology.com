"use client";

import { Clock } from "lucide-react";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import type { ShopifyProduct, ShopifyProductVariant } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

type VariantSelectorProps = {
	product: ShopifyProduct;
	selectedVariant: ShopifyProductVariant | undefined;
	onVariantChange: (variant: ShopifyProductVariant) => void;
};

type SelectedOptions = Record<string, string>;

export function VariantSelector({ product, selectedVariant, onVariantChange }: VariantSelectorProps) {
	const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>(
		selectedVariant?.selectedOptions?.reduce(
			(acc, option) => ({
				...acc,
				[option.name]: option.value,
			}),
			{} as SelectedOptions
		) || {}
	);

	const findVariantForOptions = (options: SelectedOptions) =>
		product.variants.nodes.find((variant) =>
			variant.selectedOptions.every((option) => options[option.name] === option.value)
		);

	const handleOptionChange = (optionName: string, value: string) => {
		const newOptions = { ...selectedOptions, [optionName]: value };
		setSelectedOptions(newOptions);

		const variant = findVariantForOptions(newOptions);
		if (variant) {
			onVariantChange(variant);
		}
	};

	// Calculate total inventory
	const totalInventory = product.variants.nodes.reduce((total, variant) => total + (variant.quantityAvailable || 0), 0);

	if (!product.options?.length) {
		return null;
	}

	return (
		<div className="space-y-4">
			<div className="font-semibold text-neutral-900 text-lg dark:text-neutral-100">Variants</div>

			{product.options.map((option) => (
				<div className="space-y-3" key={option.id}>
					<div className="flex items-center justify-between">
						<Label className="font-medium text-neutral-900 dark:text-neutral-100">{option.name}</Label>
					</div>

					<div className="space-y-2">
						{product.variants.nodes.map((variant) => {
							const variantOption = variant.selectedOptions.find((opt) => opt.name === option.name);
							if (!variantOption) {
								return null;
							}

							const isSelected = selectedOptions[option.name] === variantOption.value;
							const available = variant.availableForSale;
							const quantity = variant.quantityAvailable || 0;

							return (
								<div
									className={`rounded-md border p-2.5 space-y-2${isSelected ? "border-primary bg-primary/5" : "border-neutral-200"}
										${!available && "border-amber-500"}
									`}
									key={variant.id}
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2 flex-1 min-w-0">
											<input
												checked={isSelected}
												className="text-primary flex-shrink-0"
												name={option.name}
												onChange={() => handleOptionChange(option.name, variantOption.value)}
												type="radio"
												value={variantOption.value}
											/>
											<div className="flex-1 min-w-0">
												<div className="font-medium text-sm truncate">{variantOption.value}</div>
												<div className="text-neutral-500 text-xs truncate">{variant.title}</div>
											</div>
										</div>
										<div className="text-right flex-shrink-0 ml-3">
											<div className="text-neutral-600 text-xs">Price</div>
											<div className="font-medium text-sm">{formatPrice(Number.parseFloat(variant.price.amount))}</div>
										</div>
									</div>

									<div className="flex justify-between text-xs">
										<div className="text-neutral-500">Qty: {quantity}</div>
										{available ? (
											<div className="text-green-600">In stock</div>
										) : (
											<div className="flex items-center gap-1 text-amber-600">
												<Clock className="h-3.5 w-3.5" />
												<span>Pre-order</span>
											</div>
										)}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			))}

			<div className="mt-3 text-neutral-500 text-xs">
				Total inventory: {totalInventory} available
			</div>
		</div>
	);
}
