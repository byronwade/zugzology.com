"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCustomer } from "@/lib/services/shopify-customer";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import AccountInfo from "./account-info";
import OrderHistory from "./order-history";

export default async function AccountPage() {
	const cookieStore = await cookies();
	const customerAccessToken = cookieStore.get("customerAccessToken")?.value;

	// Immediately redirect if no token is found
	if (!customerAccessToken) {
		cookieStore.delete("customerAccessToken");
		redirect("/login?redirect=/account");
	}

	try {
		console.log("🔍 [Account] Fetching customer data...");
		const customer = await getCustomer(customerAccessToken);

		// If no customer data is returned, redirect to login
		if (!customer) {
			cookieStore.delete("customerAccessToken");
			redirect("/login?redirect=/account");
		}

		console.log("✅ [Account] Customer data fetched:", customer.email);

		return (
			<div className="min-h-screen bg-muted/50">
				<div className="flex flex-col lg:flex-row w-full gap-8 p-4 pb-16">
					{/* Account Info Sidebar */}
					<div className="w-full lg:w-1/3">
						<AccountInfo customer={customer} />
					</div>

					{/* Order History */}
					<div className="w-full lg:w-2/3">
						<OrderHistory orders={customer.orders.edges.map(({ node }) => node)} />
					</div>
				</div>
			</div>
		);
	} catch (error) {
		console.error("❌ [Account] Failed to fetch account data:", error);
		// Redirect to login on any error
		cookieStore.delete("customerAccessToken");
		redirect("/login?redirect=/account");
	}
}
