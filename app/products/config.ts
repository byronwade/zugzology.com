export const runtime = "edge";
export const preferredRegion = "auto";
export const dynamic = "force-dynamic";
export const revalidate = 3600;

// Add fetchCache for better caching
export const fetchCache = "force-cache";

// Add generateStaticParams for static generation
export async function generateStaticParams() {
	// Generate static params for most popular products/categories
	return [
		{ handle: "popular-product-1" },
		{ handle: "popular-product-2" },
		// ... more popular products
	];
}
