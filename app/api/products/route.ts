import { getProducts } from "@/lib/actions/shopify";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
	try {
		const allProducts = await getProducts();

		// Ensure we have products and get 4 random ones
		if (allProducts && Array.isArray(allProducts) && allProducts.length > 0) {
			// Filter products that have variants and are available for sale
			const availableProducts = allProducts.filter((product) => product.availableForSale && product.variants?.nodes?.[0]);

			if (availableProducts.length === 0) {
				return new NextResponse(JSON.stringify([]), {
					status: 200,
					headers: {
						"Content-Type": "application/json",
						"Access-Control-Allow-Origin": "*",
						"Access-Control-Allow-Methods": "GET, OPTIONS",
					},
				});
			}

			const shuffled = [...availableProducts].sort(() => 0.5 - Math.random());
			const fourProducts = shuffled.slice(0, 4).map((product) => ({
				...product,
				selectedVariantId: product.variants.nodes[0].id,
			}));

			return new NextResponse(JSON.stringify(fourProducts), {
				status: 200,
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "GET, OPTIONS",
				},
			});
		}

		return new NextResponse(JSON.stringify([]), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET, OPTIONS",
			},
		});
	} catch (error) {
		console.error("Error fetching products:", error);
		return new NextResponse(JSON.stringify({ error: "Failed to fetch products" }), {
			status: 500,
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET, OPTIONS",
			},
		});
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
