import { Suspense } from "react";
import { ProductSectionsManager } from "@/components/features/products/sections/product-sections-manager";
import type { ShopifyProduct } from "@/lib/types";

type WishlistSectionsProps = {
	product: ShopifyProduct | null;
};

export function WishlistSections({ product }: WishlistSectionsProps) {
	if (!product) {
		// Empty wishlist - show general recommendations
		return (
			<Suspense fallback={<div className="py-12 text-center text-muted-foreground">Loading recommendations...</div>}>
				<ProductSectionsManager
					product={
						{
							id: "wishlist-empty",
							handle: "wishlist-empty",
							title: "Wishlist",
							productType: "",
							tags: [],
							variants: { nodes: [] },
							images: { nodes: [] },
							priceRange: {
								minVariantPrice: { amount: "0", currencyCode: "USD" },
								maxVariantPrice: { amount: "0", currencyCode: "USD" },
							},
						} as unknown as ShopifyProduct
					}
					relatedProducts={[]}
				/>
			</Suspense>
		);
	}

	// Has wishlist items - show personalized recommendations
	return (
		<Suspense fallback={<div className="py-12 text-center text-muted-foreground">Loading recommendations...</div>}>
			<ProductSectionsManager product={product} relatedProducts={[]} />
		</Suspense>
	);
}
