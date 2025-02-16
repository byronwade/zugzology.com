"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCustomer } from "@/lib/services/shopify-customer";
import OrderDetails from "./order-details";

export default async function OrderPage({ params }: { params: { number: string } }) {
	const nextParams = await params;
	const cookieStore = await cookies();
	const customerAccessToken = cookieStore.get("customerAccessToken")?.value;

	if (!customerAccessToken) {
		redirect("/login");
	}

	try {
		console.log("🔍 [Order Details] Fetching customer data...");
		const customer = await getCustomer(customerAccessToken);
		console.log("✅ [Order Details] Customer data fetched:", customer.email);

		// Find the specific order by order number
		const order = customer.orders.edges.find(({ node }) => node.orderNumber.toString() === nextParams.number)?.node;

		if (!order) {
			console.log("❌ [Order Details] Order not found:", nextParams.number);
			redirect("/account/orders");
		}

		return <OrderDetails order={order} customer={customer} />;
	} catch (error) {
		console.error("❌ [Order Details] Failed to fetch order:", error);
		return (
			<div className="container max-w-6xl py-8">
				<div className="rounded-lg border bg-destructive/10 p-6 text-destructive">
					<h1 className="text-xl font-semibold mb-2">Error Loading Order</h1>
					<p>There was a problem loading your order details. Please try again later.</p>
					<div className="mt-4">
						<a href="/account/orders" className="text-sm underline">
							Back to Orders
						</a>
					</div>
				</div>
			</div>
		);
	}
}
