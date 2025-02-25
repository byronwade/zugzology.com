import { NextResponse } from "next/server";
import { getProducts, getCollection } from "@/lib/actions/shopify";
import { ShopifyProduct, ShopifyImage } from "@/lib/types";
import { unstable_cache } from "next/cache";

export const dynamic = "force-static";
export const revalidate = 3600; // Cache for 1 hour

// Constants
const CACHE_DURATION = 3600 * 1000; // 1 hour in milliseconds
const COALESCE_WINDOW = 50; // 50ms window to coalesce requests

// Caches
const cache = new Map<string, { data: any; timestamp: number }>();
const pendingRequests = new Map<string, Promise<any>>();
const coalescingRequests = new Map<
	string,
	{
		promise: Promise<any>;
		timestamp: number;
	}
>();

// Helper to extract image URLs with deduplication
function extractImageUrls(products: ShopifyProduct[]): string[] {
	const uniqueUrls = new Set<string>();

	products.forEach((product) => {
		// Add all product images
		product.images?.nodes?.forEach((image) => {
			if (image?.url) uniqueUrls.add(image.url);
		});

		// Add media images
		product.media?.nodes?.forEach((media) => {
			if (media.mediaContentType === "IMAGE" && media.image?.url) {
				uniqueUrls.add(media.image.url);
			} else if (media.previewImage?.url) {
				uniqueUrls.add(media.previewImage.url);
			}
		});
	});

	return Array.from(uniqueUrls);
}

// Cache the image URLs extraction
const getCachedImageUrls = unstable_cache(
	async (type: string, handle: string) => {
		let products: ShopifyProduct[] = [];

		if (type === "products") {
			products = await getProducts();
		} else if (type === "collections" && handle) {
			const collection = await getCollection(handle);
			products = collection?.products?.edges?.map((edge) => edge.node) || [];
		}

		return extractImageUrls(products);
	},
	["image-urls"],
	{
		revalidate: 3600, // 1 hour
		tags: ["images"],
	}
);

export async function GET(request: Request, { params }: { params: { rest: string[] } }) {
	try {
		const nextParams = await params;
		const [type, handle] = nextParams.rest;
		const cacheKey = `prefetch:${type}:${handle || "all"}`;
		const now = Date.now();

		// Check memory cache first
		const cached = cache.get(cacheKey);
		if (cached && now - cached.timestamp < CACHE_DURATION) {
			return NextResponse.json(cached.data);
		}

		// Check for coalescing window
		const coalescing = coalescingRequests.get(cacheKey);
		if (coalescing && now - coalescing.timestamp < COALESCE_WINDOW) {
			return NextResponse.json(await coalescing.promise);
		}

		// Check for pending requests
		if (pendingRequests.has(cacheKey)) {
			return NextResponse.json(await pendingRequests.get(cacheKey));
		}

		// Create new request promise
		const requestPromise = (async () => {
			try {
				// Use the cached function to get image URLs
				const imageUrls = await getCachedImageUrls(type, handle);
				const result = { images: imageUrls };

				// Cache successful results
				cache.set(cacheKey, { data: result, timestamp: now });
				return result;
			} catch (error) {
				console.error(`Error fetching ${type}/${handle}:`, error);
				// Return cached data if available, even if expired
				return cached?.data || { images: [] };
			}
		})();

		// Set up coalescing
		coalescingRequests.set(cacheKey, {
			promise: requestPromise,
			timestamp: now,
		});

		// Store pending request
		pendingRequests.set(cacheKey, requestPromise);

		// Cleanup
		requestPromise.finally(() => {
			pendingRequests.delete(cacheKey);
			setTimeout(() => {
				coalescingRequests.delete(cacheKey);
			}, COALESCE_WINDOW);
		});

		return NextResponse.json(await requestPromise);
	} catch (error) {
		console.error("Error in prefetch-images:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// Cache revalidation endpoint
export async function POST(request: Request) {
	try {
		const { type, handle } = await request.json();
		const cacheKey = `prefetch:${type}:${handle || "all"}`;

		// Clear all related caches
		cache.delete(cacheKey);
		pendingRequests.delete(cacheKey);
		coalescingRequests.delete(cacheKey);

		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json({ error: "Invalid request" }, { status: 400 });
	}
}
