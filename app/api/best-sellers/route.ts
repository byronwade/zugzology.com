import { getProducts } from "@/lib/api/shopify/actions";
import { NextResponse } from "next/server";

// Helper function to optimize product data for client consumption
function optimizeProduct(product: any) {
	// Create blur data URL for image placeholder
	const blurDataURL =
		"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEDQIHXG8H/QAAAABJRU5ErkJggg==";

	// Get the first variant's price
	const firstVariant = product.variants.nodes[0];
	const price = firstVariant ? firstVariant.price.amount : "0";
	const compareAtPrice = firstVariant && firstVariant.compareAtPrice ? firstVariant.compareAtPrice.amount : null;

	// Check if product is on sale
	const isOnSale = compareAtPrice ? parseFloat(price) < parseFloat(compareAtPrice) : false;

	// Get the featured image
	const featuredImage = product.images.nodes[0]
		? {
				url: product.images.nodes[0].url,
				altText: product.images.nodes[0].altText,
				blurDataURL,
		  }
		: undefined;

	return {
		...product,
		price,
		compareAtPrice,
		isOnSale,
		featuredImage,
	};
}

export async function GET() {
	try {
		// Get all products
		const allProducts = await getProducts();

		// Filter for best sellers
		const bestSellers = allProducts
			.filter((product) => product.tags.includes("best-seller"))
			.slice(0, 4)
			.map(optimizeProduct);

		// Return the best sellers
		return NextResponse.json({ products: bestSellers });
	} catch (error) {
		console.error("Error fetching best sellers:", error);
		return NextResponse.json({ error: "Failed to fetch best sellers" }, { status: 500 });
	}
}
