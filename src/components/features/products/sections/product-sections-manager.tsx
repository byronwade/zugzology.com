import { Suspense } from "react";
import { getTop6Sections } from "@/lib/api/shopify/product-sections";
import type { ShopifyProduct } from "@/lib/types";
import { ProductSectionsRenderer } from "./product-sections-renderer";

type ProductSectionsManagerProps = {
	product: ShopifyProduct;
	relatedProducts: ShopifyProduct[];
};

// Loading component for sections
function SectionsLoading() {
	return (
		<div className="space-y-16">
			{[...new Array(6)].map((_, i) => (
				<div className="w-full" key={i}>
					<div className="mb-8 space-y-2">
						<div className="h-8 w-64 animate-pulse rounded bg-muted" />
						<div className="h-4 w-96 animate-pulse rounded bg-muted" />
					</div>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{[...new Array(4)].map((_, j) => (
							<div className="h-96 w-full animate-pulse rounded-lg bg-muted" key={j} />
						))}
					</div>
				</div>
			))}
		</div>
	);
}

// Server component that fetches sections data
async function ProductSectionsContent({ product, relatedProducts }: ProductSectionsManagerProps) {
	const sections = await getTop6Sections(product, relatedProducts);

	return <ProductSectionsRenderer currentProductId={product.id} sections={sections} />;
}

// Main export with Suspense boundary
export function ProductSectionsManager({ product, relatedProducts }: ProductSectionsManagerProps) {
	return (
		<Suspense fallback={<SectionsLoading />}>
			<ProductSectionsContent product={product} relatedProducts={relatedProducts} />
		</Suspense>
	);
}
