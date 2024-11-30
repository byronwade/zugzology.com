"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { ShopifyProduct, ShopifyProductVariant } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

interface VariantSelectorProps {
	product: ShopifyProduct;
	selectedVariant: ShopifyProductVariant | undefined;
	onVariantChange: (variant: ShopifyProductVariant) => void;
}

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

	const findVariantForOptions = (options: SelectedOptions) => {
		return product.variants.edges.find(({ node }) => {
			return node.selectedOptions.every((option) => options[option.name] === option.value);
		})?.node;
	};

	const handleOptionChange = (optionName: string, value: string) => {
		const newOptions = { ...selectedOptions, [optionName]: value };
		setSelectedOptions(newOptions);

		const variant = findVariantForOptions(newOptions);
		if (variant) {
			onVariantChange(variant);
		}
	};

	// Calculate total inventory
	const totalInventory = product.variants.edges.reduce((total, { node }) => {
		return total + (node.quantityAvailable || 0);
	}, 0);

	if (!product.options?.length) return null;

	return (
		<div className="space-y-6">
			<div className="text-xl font-semibold text-gray-900 dark:text-gray-100">Variants</div>

			{product.options.map((option) => (
				<div key={option.id} className="space-y-4">
					<div className="flex justify-between items-center">
						<Label className="text-lg font-medium text-gray-900 dark:text-gray-100">{option.name}</Label>
					</div>

					<div className="space-y-4">
						{product.variants.edges.map(({ node: variant }) => {
							const variantOption = variant.selectedOptions.find((opt) => opt.name === option.name);
							if (!variantOption) return null;

							const isSelected = selectedOptions[option.name] === variantOption.value;
							const available = variant.availableForSale;
							const quantity = variant.quantityAvailable || 0;

							return (
								<div
									key={variant.id}
									className={`
										border rounded-lg p-4 space-y-3
										${isSelected ? "border-primary bg-primary/5" : "border-gray-200"}
										${!available && "opacity-50"}
									`}
								>
									<div className="flex justify-between items-start">
										<div className="space-y-1">
											<div className="flex items-center gap-3">
												<input type="radio" name={option.name} value={variantOption.value} checked={isSelected} onChange={() => handleOptionChange(option.name, variantOption.value)} className="text-primary mt-1" />
												<div>
													<div className="font-medium">{variantOption.value}</div>
													<div className="text-sm text-gray-500">{variant.title}</div>
												</div>
											</div>
										</div>
										<div className="text-right">
											<div className="font-medium">Price</div>
											<div className="text-lg">${formatPrice(variant.price.amount)}</div>
										</div>
									</div>

									<div className="flex justify-between text-sm text-gray-500">
										<div>Quantity: {quantity}</div>
										<div>{available ? "In stock" : "Out of stock"}</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			))}

			<div className="text-sm text-gray-500 mt-4">Total inventory across all locations: {totalInventory} available</div>
		</div>
	);
}
