import { createCart, getCart } from "@/lib/actions/shopify";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
	const requestId = Math.random().toString(36).substring(7);
	console.log(`[Cart API ${requestId}] POST Request started`);

	try {
		const { cartId } = await request.json();
		console.log(`[Cart API ${requestId}] Received cartId:`, cartId || "none");

		let cart;
		if (cartId) {
			console.log(`[Cart API ${requestId}] Attempting to fetch existing cart:`, cartId);
			cart = await getCart(cartId);
			console.log(`[Cart API ${requestId}] Existing cart fetch result:`, cart ? "found" : "not found");
		}

		if (!cart) {
			console.log(`[Cart API ${requestId}] Creating new cart`);
			cart = await createCart();
			console.log(`[Cart API ${requestId}] New cart created:`, cart.id);
		}

		console.log(`[Cart API ${requestId}] Returning cart:`, {
			id: cart.id,
			lines: cart.lines?.edges?.length || 0,
			cost: cart.cost?.totalAmount?.amount,
		});

		return Response.json(cart);
	} catch (error) {
		console.error(`[Cart API ${requestId}] Error:`, error);
		return new Response(JSON.stringify({ error: "Failed to process cart operation" }), { status: 500 });
	}
}

export async function GET(request: NextRequest) {
	const requestId = Math.random().toString(36).substring(7);
	console.log(`[Cart API ${requestId}] GET Request started`);

	try {
		const cartId = request.nextUrl.searchParams.get("cartId");
		console.log(`[Cart API ${requestId}] Fetching cart:`, cartId);

		if (!cartId) {
			console.log(`[Cart API ${requestId}] No cartId provided`);
			return new Response(JSON.stringify({ error: "Cart ID is required" }), { status: 400 });
		}

		const cart = await getCart(cartId);
		console.log(`[Cart API ${requestId}] Cart fetch result:`, cart ? "found" : "not found");

		if (!cart) {
			console.log(`[Cart API ${requestId}] Cart not found:`, cartId);
			return new Response(JSON.stringify({ error: "Cart not found" }), { status: 404 });
		}

		console.log(`[Cart API ${requestId}] Returning cart:`, {
			id: cart.id,
			lines: cart.lines?.edges?.length || 0,
			cost: cart.cost?.totalAmount?.amount,
		});

		return Response.json(cart);
	} catch (error) {
		console.error(`[Cart API ${requestId}] Error:`, error);
		return new Response(JSON.stringify({ error: "Failed to fetch cart" }), { status: 500 });
	}
}
