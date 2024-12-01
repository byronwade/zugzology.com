"use client";

import { Suspense } from "react";
import type { ShopifyProduct } from "@/lib/types";
import dynamic from "next/dynamic";

interface ProductContentProps {
	product: ShopifyProduct;
}

function LoadingFallback() {
	return (
		<div className="w-full h-screen flex items-center justify-center">
			<div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
		</div>
	);
}

const DynamicProductContentClient = dynamic<ProductContentProps>(() => import("./product-content-client"), {
	ssr: false,
	loading: LoadingFallback,
});

export function ProductContent({ product }: ProductContentProps) {
	return (
		<Suspense fallback={<LoadingFallback />}>
			<DynamicProductContentClient product={product} />
		</Suspense>
	);
}
