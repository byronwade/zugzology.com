import { Suspense } from "react";
import type { ShopifyProduct } from "@/lib/types";
import { ProductContentClient } from "./product-content-client";
import { ProgressiveSectionsManager } from "./sections/progressive-sections-manager";

interface ProductWithRecommendations extends ShopifyProduct {
	recommendations?: {
		nodes: ShopifyProduct[];
	};
}

type ProductServerWrapperProps = {
	product: ProductWithRecommendations;
	relatedProducts: ShopifyProduct[];
};

function ProductLoading(): React.ReactElement {
	return (
		<div className="w-full animate-pulse space-y-8">
			<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
				<div className="aspect-square rounded-lg bg-muted" />
				<div className="space-y-4">
					<div className="h-8 w-3/4 rounded bg-muted" />
					<div className="h-4 w-1/2 rounded bg-muted" />
					<div className="h-24 w-full rounded bg-muted" />
				</div>
			</div>
		</div>
	);
}

export async function ProductServerWrapper({
	product,
	relatedProducts,
}: ProductServerWrapperProps): Promise<React.ReactElement> {
	const productWithRecommendations = {
		...product,
		recommendations: {
			nodes: relatedProducts || [],
		},
	};

	return (
		<>
			<Suspense fallback={<ProductLoading />}>
				<ProductContentClient product={productWithRecommendations} />
			</Suspense>
			<ProgressiveSectionsManager product={product} relatedProducts={relatedProducts} />
		</>
	);
}
