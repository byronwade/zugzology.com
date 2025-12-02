import type { Metadata } from "next";
import Script from "next/script";
import { BreadcrumbConfigs, UniversalBreadcrumb } from "@/components/layout";
import { getEnhancedBreadcrumbSchema } from "@/lib/seo/enhanced-jsonld";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/seo-utils";
import { requireCustomerSession } from "@/lib/services/customer-session";
import { AccountNavigation } from "../account-navigation";
import OrderHistory from "../order-history";

export const metadata: Metadata = generateSEOMetadata({
	title: "Order History - Account",
	description:
		"Review your previous orders, track fulfillment status, and reorder your favorite cultivation supplies without leaving your account dashboard.",
	keywords: [
		"order history",
		"account orders",
		"purchase history",
		"order tracking",
		"customer account",
		"order management",
	],
	url: "/account/orders",
	noindex: true,
	openGraph: {
		type: "website",
	},
});

export default async function AccountOrdersPage() {
	const { customer } = await requireCustomerSession("/account/orders");
	const orders = customer.orders?.edges?.map(({ node }) => node) ?? [];
	const breadcrumbSchema = getEnhancedBreadcrumbSchema([
		{ name: "Home", url: "/" },
		{ name: "My Account", url: "/account" },
		{ name: "Orders", url: "/account/orders" },
	]);

	return (
		<>
			<script
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data is safe with JSON.stringify
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(breadcrumbSchema),
				}}
				type="application/ld+json"
			/>

			<Script id="account-orders-analytics" strategy="afterInteractive">
				{`
					window.dataLayer = window.dataLayer || [];
					window.dataLayer.push({
						'event': 'page_view',
						'page_type': 'account_orders',
						'page_location': window.location.href,
						'order_count': ${orders.length}
					});
				`}
			</Script>

			<div className="min-h-screen bg-muted/50">
				<div className="px-4 pt-4">
					<UniversalBreadcrumb items={BreadcrumbConfigs.accountOrders()} />
				</div>
				<AccountNavigation active="orders" />
				<div className="p-4 pb-16">
					<OrderHistory orders={orders} />
				</div>
			</div>
		</>
	);
}
