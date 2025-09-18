import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/api/shopify/actions";

// Dynamic rendering and revalidation handled by dynamicIO

export async function GET(request: NextRequest) {
	try {
		// Get query parameters
		const searchParams = request.nextUrl.searchParams;
		const tag = searchParams.get("tag");
		const limit = parseInt(searchParams.get("limit") || "10", 10);

		// Fetch all products
		const products = await getProducts();

		// Filter products if tag is provided
		let filteredProducts = products;
		if (tag) {
			filteredProducts = products.filter((product) => product.tags.includes(tag));
		}

		// Limit the number of products
		const limitedProducts = filteredProducts.slice(0, limit);

		// Return the products
		return NextResponse.json({
			products: limitedProducts,
			count: limitedProducts.length,
		});
	} catch (error) {
		console.error("Error fetching products:", error);
		return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
	}
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: Request) {
	return new NextResponse(null, {
		status: 204,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
		},
	});
}
