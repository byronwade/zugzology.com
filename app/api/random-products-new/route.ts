"use server";

import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/actions/shopify";
import { debugLog } from "@/lib/utils";
import { ShopifyProduct } from "@/lib/types";

const MAX_PRODUCTS_TO_FETCH = 50;

// API endpoint to get a random selection of products
export async function GET(request: NextRequest) {
	try {
		// Get query parameters
		const { searchParams } = new URL(request.url);
		const excludeId = searchParams.get("exclude");
		const limit = parseInt(searchParams.get("limit") || "12", 10);

		debugLog("RandomProductsAPI", "Fetching random products", { excludeId, limit });

		// Fetch fresh products every time
		const products = await getProducts();
		
		// Filter valid products
		const validProducts = products
			.filter((product) => product.availableForSale && product.variants?.nodes?.length > 0)
			.slice(0, MAX_PRODUCTS_TO_FETCH);

		// Filter out the excluded product
		const filteredProducts = validProducts.filter((product) => product.id !== excludeId);

		// Shuffle and limit the products
		const shuffled = [...filteredProducts].sort(() => 0.5 - Math.random()).slice(0, limit);

		debugLog("RandomProductsAPI", "Returning random products", { count: shuffled.length });

		// No caching headers
		return NextResponse.json(shuffled, {
			headers: {
				"Cache-Control": "no-store",
			},
		});
	} catch (error) {
		console.error("Error in random-products API:", error instanceof Error ? error.message : error);
		return NextResponse.json({ error: "Could not fetch random products" }, { status: 500 });
	}
}