"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCustomer } from "@/lib/services/shopify-customer";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
	const cookieStore = await cookies();
	const customerAccessToken = cookieStore.get("customerAccessToken")?.value;

	// Immediately redirect if no token is found
	if (!customerAccessToken) {
		cookieStore.delete("customerAccessToken");
		redirect("/login?redirect=/account");
	}

	try {
		// Verify the token by attempting to fetch customer data
		const customer = await getCustomer(customerAccessToken);

		// If no customer data is returned, the token is invalid
		if (!customer) {
			// Clear the invalid token
			cookieStore.delete("customerAccessToken");
			redirect("/login?redirect=/account");
		}

		return (
			<div className="flex min-h-screen flex-col">
				<main className="flex-1 bg-muted/50 w-full mx-auto">{children}</main>
			</div>
		);
	} catch (error) {
		console.error("❌ [Account Layout] Failed to verify authentication:", error);
		// If there's any error verifying the token, redirect to login
		cookieStore.delete("customerAccessToken");
		redirect("/login?redirect=/account");
	}
}
