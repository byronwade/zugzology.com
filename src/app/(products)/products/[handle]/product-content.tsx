"use client";

import { ProductContentClient } from "@/components/features/products/product-content-client";
import type { ShopifyProduct } from "@/lib/types";

export default function ProductContent({ product }: { product: ShopifyProduct }) {
	return <ProductContentClient product={product} />;
}
