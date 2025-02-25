"use server";

import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/actions/shopify";
import { debugLog } from "@/lib/utils";
import { ShopifyProduct } from "@/lib/types";

// Cache for random products to avoid fetching all products on every request
let cachedProducts: ShopifyProduct[] = [];
let lastCacheTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_PRODUCTS_TO_FETCH = 100; // Limit the number of products to fetch

// API endpoint to get a random selection of products
// This avoids loading all products on the client side
export async function GET(request: NextRequest) {
	try {
		// Get query parameters
		const { searchParams } = new URL(request.url);
		const excludeId = searchParams.get("exclude");
		const limit = parseInt(searchParams.get("limit") || "20", 10);

		debugLog("RandomProductsAPI", "Fetching random products", { excludeId, limit });

		// Check if we have a valid cache
		const now = Date.now();
		if (cachedProducts.length === 0 || now - lastCacheTime > CACHE_DURATION) {
			debugLog("RandomProductsAPI", "Cache expired, fetching fresh products");

			try {
				// Instead of fetching all products, use a more targeted approach
				// This uses the first 100 products which is enough for random recommendations
				const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "";
				const storeDomain = shopifyDomain.startsWith("https://") ? shopifyDomain : `https://${shopifyDomain}`;

				const response = await fetch(`${storeDomain}/api/2023-10/graphql.json`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"X-Shopify-Storefront-Access-Token": process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || "",
					},
					body: JSON.stringify({
						query: `
							query getRandomProducts {
								products(first: ${MAX_PRODUCTS_TO_FETCH}, sortKey: BEST_SELLING) {
									nodes {
										id
										title
										handle
										description
										productType
										vendor
										availableForSale
										priceRange {
											minVariantPrice {
												amount
												currencyCode
											}
											maxVariantPrice {
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
								}
							}
						`,
					}),
					cache: "no-store",
				});

				const data = await response.json();

				// Only cache products that are available for sale and have a price
				cachedProducts = (data?.data?.products?.nodes || []).filter((product: ShopifyProduct) => product.availableForSale && product.priceRange?.minVariantPrice?.amount);

				debugLog("RandomProductsAPI", "Fetched products via GraphQL", cachedProducts.length);
			} catch (graphqlError) {
				// If GraphQL query fails, fall back to getProducts
				console.error("GraphQL query failed, falling back to getProducts:", graphqlError);

				// Get products using the existing API (limited to avoid performance issues)
				const allProducts = await getProducts();

				// Take a subset of products to avoid performance issues
				cachedProducts = allProducts.filter((product) => product.availableForSale && product.priceRange?.minVariantPrice?.amount).slice(0, MAX_PRODUCTS_TO_FETCH);

				debugLog("RandomProductsAPI", "Fetched products via fallback", cachedProducts.length);
			}

			lastCacheTime = now;
			debugLog("RandomProductsAPI", "Updated cache with products", cachedProducts.length);
		} else {
			debugLog("RandomProductsAPI", "Using cached products", cachedProducts.length);
		}

		// Filter out the excluded product
		const filteredProducts = cachedProducts.filter((product) => product.id !== excludeId);

		// Shuffle and limit the products
		const shuffled = [...filteredProducts].sort(() => 0.5 - Math.random()).slice(0, limit);

		debugLog("RandomProductsAPI", "Returning random products", { count: shuffled.length });

		// Set cache headers in the response
		return NextResponse.json(shuffled, {
			headers: {
				"Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
			},
		});
	} catch (error) {
		console.error("Error fetching random products:", error);
		return NextResponse.json({ error: "Failed to fetch random products" }, { status: 500 });
	}
}
