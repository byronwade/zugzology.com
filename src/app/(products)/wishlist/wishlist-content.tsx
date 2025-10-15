"use client";

import { Heart } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { useWishlist } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
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
			<main className="container mx-auto px-4 py-12">
				<div className="mb-8 space-y-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="h-12 w-12 animate-pulse rounded-lg bg-muted" />
							<div>
								<div className="mb-2 h-7 w-40 animate-pulse rounded bg-muted" />
								<div className="h-4 w-24 animate-pulse rounded bg-muted/60" />
							</div>
						</div>
						<div className="flex gap-2">
							<div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
							<div className="h-9 w-32 animate-pulse rounded-lg bg-muted" />
							<div className="h-9 w-28 animate-pulse rounded-lg bg-primary/10" />
						</div>
					</div>
				</div>
				<div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
					{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
						<div className="space-y-3" key={i}>
							<div className="aspect-square animate-pulse rounded-xl bg-muted" />
							<div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
							<div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
						</div>
					))}
				</div>
			</main>
		);
	}

	return (
		<Suspense fallback={<div className="container py-10">Loading wishlist...</div>}>
			<WishlistWithFilters
				wishlistProducts={wishlistProducts}
				wishlist={wishlist}
				removeFromWishlist={removeFromWishlist}
			/>
		</Suspense>
	);
}
