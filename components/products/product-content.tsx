import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import type { Product, ProductVariant } from "@/lib/types";

interface ProductContentProps {
	product: Product;
}

export function ProductContent({ product }: ProductContentProps) {
	const [quantity, setQuantity] = useState(1);
	const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
	const { addItem } = useCart();

	const handleAddToCart = async () => {
		const productImage = product.images?.edges?.[0]?.node;

		await addItem({
			merchandiseId: selectedVariant?.id || product.variants.edges[0].node.id,
			quantity: quantity,
			attributes: [
				{
					key: "image",
					value: productImage?.url || "",
				},
				{
					key: "title",
					value: product.title,
				},
				{
					key: "handle",
					value: product.handle,
				},
			],
		});
	};

	// ... rest of the component code ...
}
