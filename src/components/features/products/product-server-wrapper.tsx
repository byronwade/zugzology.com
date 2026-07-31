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
			{/*
			 * No Suspense boundary here. ProductContentClient is a plain client
			 * component rendered from props — it cannot suspend for data, so the
			 * boundary only ever flashed a skeleton whose height differed from the
			 * real gallery and buy box. That swap displaced everything below it and
			 * was the product page's intermittent ~0.6 CLS.
			 */}
			<ProductContentClient product={productWithRecommendations} />
			<ProgressiveSectionsManager product={product} relatedProducts={relatedProducts} />
		</>
	);
}
