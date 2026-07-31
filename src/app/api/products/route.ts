import { type NextRequest, NextResponse } from "next/server";
import { shopifyFetch } from "@/lib/api/shopify/client";
import type { ShopifyProduct } from "@/lib/types";

// Lightweight fragment for search / listing APIs — not full PDP payload
const SEARCH_PRODUCT_FRAGMENT = `
	fragment SearchProductFragment on Product {
		id
		title
		handle
		vendor
		productType
		tags
		availableForSale
		description
		priceRange {
			minVariantPrice {
				amount
				currencyCode
			}
		}
		images(first: 1) {
			nodes {
				url
				altText
				width
				height
			}
		}
	}
`;

export async function GET(request: NextRequest): Promise<NextResponse> {
	try {
		const searchParams = request.nextUrl.searchParams;
		const tag = searchParams.get("tag");
		const limit = Math.min(Number.parseInt(searchParams.get("limit") || "10", 10), 100);
		const query = tag ? `tag:${tag}` : "";

		const { data } = await shopifyFetch<{ products: { nodes: ShopifyProduct[] } }>({
			query: `
				query getProducts($first: Int!, $query: String) {
					products(first: $first, query: $query, sortKey: BEST_SELLING) {
						nodes {
							...SearchProductFragment
						}
					}
				}
				${SEARCH_PRODUCT_FRAGMENT}
			`,
			variables: {
				first: limit,
				query: query || undefined,
			},
			tags: ["products"],
			next: { revalidate: 300 },
		});

		const products = data?.products?.nodes || [];

		return NextResponse.json(
			{
				products,
				count: products.length,
			},
			{
				headers: {
					"Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
				},
			}
		);
	} catch {
		return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
	}
}

export async function OPTIONS(_request: Request): Promise<NextResponse> {
	return new NextResponse(null, {
		status: 204,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
		},
	});
}
