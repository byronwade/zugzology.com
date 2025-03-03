"use server";

import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/actions/shopify";
import { debugLog } from "@/lib/utils";
import { ShopifyProduct } from "@/lib/types";

// Cache for random products to avoid fetching all products on every request
let cachedProducts: ShopifyProduct[] = [];
let lastCacheTime = 0;
const CACHE_DURATION = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
const MAX_PRODUCTS_TO_FETCH = 50; // Reduce number of products to fetch for better performance
const SERVER_TIMEOUT = 5000; // 5 second server-side timeout

// Simplified version of product type with only the fields we need
type SimplifiedProduct = Pick<
	ShopifyProduct,
	"id" | "title" | "handle" | "availableForSale" | "priceRange" | "images"
> & {
	variants: { nodes: Array<{ id: string; price: { amount: string } }> };
};

// API endpoint to get a random selection of products
export async function GET(request: NextRequest) {
	try {
		// Get query parameters
		const { searchParams } = new URL(request.url);
		const excludeId = searchParams.get("exclude");
		const limit = parseInt(searchParams.get("limit") || "12", 10);
		const cacheBust = searchParams.get("_cacheBust"); // Used only to bypass client caching

		debugLog("RandomProductsAPI", "Fetching random products", { excludeId, limit });

		// Check if we have a valid cache
		const now = Date.now();
		if (cachedProducts.length === 0 || now - lastCacheTime > CACHE_DURATION) {
			debugLog("RandomProductsAPI", "Cache expired, fetching fresh products");

			// Server-side timeout promise
			const timeoutPromise = new Promise<null>((_, reject) => {
				setTimeout(() => reject(new Error("Server timeout while fetching products")), SERVER_TIMEOUT);
			});

			try {
				// Fetch products with reduced fields and a server-side timeout
				const productsPromise = fetchReducedProductsFromShopify();
				const products = await Promise.race([productsPromise, timeoutPromise]);

				if (products) {
					// Filter products to ensure they have valid data
					cachedProducts = filterValidProducts(products as ShopifyProduct[]);
					lastCacheTime = now;
					debugLog("RandomProductsAPI", "Updated cache with products", cachedProducts.length);
				}
			} catch (error) {
				console.error("Error fetching products:", error instanceof Error ? error.message : error);

				// If we have a timeout or graphQL error, try the faster fallback if cache is empty
				if (cachedProducts.length === 0) {
					debugLog("RandomProductsAPI", "Using simplified fallback for empty cache");
					await useFallbackProducts();
				} else {
					// Otherwise, just use the existing cache but don't update the timestamp
					debugLog("RandomProductsAPI", "Error occurred, using existing cache", cachedProducts.length);
				}
			}
		} else {
			debugLog("RandomProductsAPI", "Using cached products", cachedProducts.length);
		}

		// Filter out the excluded product
		const filteredProducts = cachedProducts.filter((product) => product.id !== excludeId);

		// Ensure we have at least some products to return
		if (filteredProducts.length === 0) {
			debugLog("RandomProductsAPI", "No products found after filtering, using fallback");

			// Try one more time with a simplified approach
			await useFallbackProducts();

			// After fallback, check again
			const fallbackFiltered = cachedProducts.filter((product) => product.id !== excludeId);

			if (fallbackFiltered.length === 0) {
				// If we still have no products, return a specific message
				return NextResponse.json(
					{ products: [] },
					{
						status: 200,
						headers: {
							"Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
						},
					}
				);
			}
		}

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
		console.error("Unexpected error in random-products API:", error instanceof Error ? error.message : error);
		return NextResponse.json({ error: "Could not fetch random products" }, { status: 500 });
	}
}

// Simplified fallback method to get products
async function useFallbackProducts() {
	try {
		// Get just enough products without variants and other complex data
		const products = await getProducts();
		cachedProducts = products
			.filter((product) => product.availableForSale && product.variants?.nodes?.length > 0)
			.slice(0, MAX_PRODUCTS_TO_FETCH);

		lastCacheTime = Date.now();
		debugLog("RandomProductsAPI", "Fallback successful, got products:", cachedProducts.length);
	} catch (error) {
		console.error("Even fallback failed:", error);
		// If all else fails, at least try not to break
		cachedProducts = cachedProducts.length ? cachedProducts : [];
	}
}

// Fetch products with a more optimized query that only gets what we need
async function fetchReducedProductsFromShopify(): Promise<ShopifyProduct[]> {
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
							availableForSale
							priceRange {
								minVariantPrice {
									amount
									currencyCode
								}
							}
							variants(first: 1) {
								nodes {
									id
									availableForSale
									price {
										amount
										currencyCode
									}
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

	if (!response.ok) {
		throw new Error(`Shopify GraphQL returned status ${response.status}`);
	}

	const data = await response.json();
	return data?.data?.products?.nodes || [];
}

// Filter products to ensure they have valid data
function filterValidProducts(products: ShopifyProduct[]): ShopifyProduct[] {
	return products.filter((product) => {
		// Must be available for sale
		if (!product.availableForSale) return false;

		// Must have at least one variant
		const hasVariants = product.variants?.nodes && product.variants.nodes.length > 0;
		if (!hasVariants) return false;

		// Must have a valid price
		const hasValidPrice =
			product.priceRange?.minVariantPrice?.amount && parseFloat(product.priceRange.minVariantPrice.amount) > 0;
		if (!hasValidPrice) return false;

		return true;
	});
}
