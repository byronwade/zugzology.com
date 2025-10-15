import type { NextRequest } from "next/server";
import { createCart, getCart } from "@/lib/actions/shopify";

export async function POST(request: NextRequest) {
	const _requestId = Math.random().toString(36).substring(7);

	try {
		const { cartId } = await request.json();

		let cart;
		if (cartId) {
			cart = await getCart(cartId);
		}

		if (!cart) {
			cart = await createCart();
			if (!cart) {
				throw new Error("Failed to create cart");
			}
		}

		return Response.json(cart);
	} catch (_error) {
		return new Response(JSON.stringify({ error: "Failed to process cart operation" }), { status: 500 });
	}
}

export async function GET(request: NextRequest) {
	const _requestId = Math.random().toString(36).substring(7);

	try {
		const cartId = request.nextUrl.searchParams.get("cartId");

		if (!cartId) {
			return new Response(JSON.stringify({ error: "Cart ID is required" }), { status: 400 });
		}

		const cart = await getCart(cartId);

		if (!cart) {
			return new Response(JSON.stringify({ error: "Cart not found" }), { status: 404 });
		}

		return Response.json(cart);
	} catch (_error) {
		return new Response(JSON.stringify({ error: "Failed to fetch cart" }), { status: 500 });
	}
}
