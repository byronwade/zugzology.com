"use client";

import { Suspense } from "react";
import { ProductContentClient } from "@/components/products/product-content-client";
import type { ShopifyProduct } from "@/lib/types";

function LoadingFallback() {
	return (
		<div className="w-full h-screen flex items-center justify-center">
			<div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
		</div>
	);
}

export default function ProductContent({ product }: { product: ShopifyProduct }) {
	return (
		<Suspense fallback={<LoadingFallback />}>
			<ProductContentClient product={product} />
		</Suspense>
	);
}
