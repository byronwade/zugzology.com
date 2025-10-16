import { type NextRequest, NextResponse } from "next/server";
import { shopifyFetch } from "@/lib/api/shopify/client";
import { PRODUCTS_FRAGMENT } from "@/lib/api/shopify/fragments";
import type { ShopifyProduct } from "@/lib/types";

// Dynamic rendering and revalidation handled by dynamicIO

export async function GET(request: NextRequest) {
	try {
		// Get query parameters
		const searchParams = request.nextUrl.searchParams;
		const tag = searchParams.get("tag");
		const limit = Math.min(Number.parseInt(searchParams.get("limit") || "10", 10), 100); // Cap at 100

		// Build query based on filters
		let query = "";
		if (tag) {
			query = `tag:${tag}`;
		}

		// Fetch only the products we need directly from Shopify
		const { data } = await shopifyFetch<{ products: { nodes: ShopifyProduct[] } }>({
			query: `
				query getProducts($first: Int!, $query: String) {
					products(first: $first, query: $query, sortKey: BEST_SELLING) {
						nodes {
							...ProductFragment
						}
					}
				}
				${PRODUCTS_FRAGMENT}
			`,
			variables: {
				first: limit,
				query: query || undefined,
			},
			tags: ["products"],
			next: { revalidate: 300 }, // Cache for 5 minutes
		});

		const products = data?.products?.nodes || [];

		// Return the products
		return NextResponse.json({
			products,
			count: products.length,
		});
	} catch (_error) {
		return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
	}
}

// Handle OPTIONS request for CORS
export async function OPTIONS(_request: Request) {
	return new NextResponse(null, {
		status: 204,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
		},
	});
}
