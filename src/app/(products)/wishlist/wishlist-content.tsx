"use client";

import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { useWishlist } from "@/components/providers";
import { fetchWishlistProducts } from "@/lib/actions/wishlist-actions";
import type { ShopifyProduct } from "@/lib/types";
import WishlistWithFilters from "./wishlist-with-filters";

export default function WishlistContent() {
	const { wishlist, removeFromWishlist } = useWishlist();
	const [wishlistProducts, setWishlistProducts] = useState<ShopifyProduct[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// Load wishlist products when wishlist changes
	// Uses optimized batch fetching for better performance
	useEffect(() => {
		const loadWishlistProducts = async () => {
			try {
				// Batch fetch all products in a single request
				const products = await fetchWishlistProducts(wishlist);
				setWishlistProducts(products);
			} catch (_error) {
				toast.error("Failed to load wishlist products");
			} finally {
				setIsLoading(false);
			}
		};

		loadWishlistProducts();
	}, [wishlist]);

	// Track wishlist analytics
	useEffect(() => {
		if (typeof window !== "undefined" && window.gtag) {
			window.gtag("event", "view_item_list", {
				item_list_id: "wishlist",
				item_list_name: "Wishlist",
				items: wishlistProducts.slice(0, 10).map((product, index) => ({
					item_id: product.id,
					item_name: product.title,
					price: Number.parseFloat(product.variants?.nodes?.[0]?.price?.amount || "0"),
					index,
				})),
			});
		}
	}, [wishlistProducts]);

	if (isLoading) {
		return (
			<main className="container mx-auto px-3 py-8 sm:px-4 sm:py-12">
				<div className="mb-6 space-y-4 sm:mb-8">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex items-center gap-2 sm:gap-3">
							<div className="h-10 w-10 animate-pulse rounded-lg bg-muted sm:h-12 sm:w-12" />
							<div>
								<div className="mb-2 h-6 w-32 animate-pulse rounded bg-muted sm:h-7 sm:w-40" />
								<div className="h-3 w-20 animate-pulse rounded bg-muted/60 sm:h-4 sm:w-24" />
							</div>
						</div>
						<div className="flex gap-2">
							<div className="h-9 w-9 animate-pulse rounded-lg bg-muted sm:hidden" />
							<div className="h-9 w-9 animate-pulse rounded-lg bg-muted sm:hidden" />
							<div className="h-9 flex-1 animate-pulse rounded-lg bg-primary/10 sm:hidden sm:w-28 sm:flex-none" />
							<div className="hidden h-9 w-24 animate-pulse rounded-lg bg-muted sm:block" />
							<div className="hidden h-9 w-32 animate-pulse rounded-lg bg-muted sm:block" />
							<div className="hidden h-9 w-28 animate-pulse rounded-lg bg-primary/10 sm:block" />
						</div>
					</div>
				</div>
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-6 md:grid-cols-4 lg:grid-cols-5">
					{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
						<div className="space-y-2 sm:space-y-3" key={i}>
							<div className="aspect-square animate-pulse rounded-lg bg-muted sm:rounded-xl" />
							<div className="h-3 w-3/4 animate-pulse rounded bg-muted sm:h-4" />
							<div className="h-3 w-1/2 animate-pulse rounded bg-muted sm:h-4" />
						</div>
					))}
				</div>
			</main>
		);
	}

	return (
		<Suspense fallback={<div className="container py-10">Loading wishlist...</div>}>
			<WishlistWithFilters
				removeFromWishlist={removeFromWishlist}
				wishlist={wishlist}
				wishlistProducts={wishlistProducts}
			/>
		</Suspense>
	);
}
