import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const { email } = await request.json();

		if (!email) {
			return NextResponse.json({ error: "Email is required" }, { status: 400 });
		}

		// Submit to Shopify's Customer Marketing API
		const response = await fetch(
			`https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/customers/marketing_consent.json`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_ACCESS_TOKEN as string,
				},
				body: JSON.stringify({
					customer: {
						email,
						accepts_marketing: true,
						marketing_opt_in_level: "single_opt_in",
						tags: ["newsletter_subscriber"],
					},
				}),
			}
		);

		if (!response.ok) {
			throw new Error("Failed to subscribe to newsletter");
		}

		// Also add to Shopify's Customer List if available
		try {
			await fetch(`https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/customers.json`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_ACCESS_TOKEN as string,
				},
				body: JSON.stringify({
					customer: {
						email,
						accepts_marketing: true,
						tags: "newsletter_subscriber",
						sends_marketing_email: true,
					},
				}),
			});
		} catch (_error) {}

		return NextResponse.json({ message: "Successfully subscribed to newsletter" }, { status: 200 });
	} catch (_error) {
		return NextResponse.json({ error: "Failed to subscribe to newsletter" }, { status: 500 });
	}
}
