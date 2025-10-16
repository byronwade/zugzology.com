"use server";

import { getProductsByHandles } from "@/lib/api/shopify/actions";
import type { ShopifyProduct } from "@/lib/types";

/**
 * Batch fetch wishlist products
 * Optimized server action for fetching multiple products at once
 */
export async function fetchWishlistProducts(handles: string[]): Promise<ShopifyProduct[]> {
	if (!handles || handles.length === 0) {
		return [];
	}

	// Filter out invalid handles
	const validHandles = handles.filter((handle) => handle && typeof handle === "string");

	if (validHandles.length === 0) {
		return [];
	}

	try {
		const products = await getProductsByHandles(validHandles);
		return products;
	} catch (_error) {
		return [];
	}
}
