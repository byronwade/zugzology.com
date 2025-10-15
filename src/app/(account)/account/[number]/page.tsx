import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Script from "next/script";
import { BreadcrumbConfigs, UniversalBreadcrumb } from "@/components/layout";
import { getEnhancedBreadcrumbSchema, getEnhancedOrderSchema } from "@/lib/seo/enhanced-jsonld";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/seo-utils";
import { requireCustomerSession } from "@/lib/services/customer-session";
import { AccountNavigation } from "../account-navigation";
import OrderDetails from "./order-details";

export async function generateMetadata({ params }: { params: { number: string } }): Promise<Metadata> {
	const nextParams = await params;
	return generateSEOMetadata({
		title: `Order #${nextParams.number} - Order Details`,
		description: `View details for order #${nextParams.number}. Track your mushroom cultivation supplies order, view items, shipping status, and order history.`,
		keywords: [
			"order details",
			"order tracking",
			"order history",
			"shipment tracking",
			"purchase history",
			"order status",
		],
		url: `/account/${nextParams.number}`,
		noindex: true,
		openGraph: {
			type: "website",
		},
	});
}

export default async function OrderPage({ params }: { params: { number: string } }) {
	const nextParams = await params;
	const { customer } = await requireCustomerSession(`/account/${nextParams.number}`);
	const orderEdge = customer.orders?.edges?.find(({ node }) => node.orderNumber.toString() === nextParams.number);
	const order = orderEdge?.node;

	if (!order) {
		redirect("/account/orders");
	}

	const breadcrumbSchema = getEnhancedBreadcrumbSchema([
		{ name: "Home", url: "/" },
		{ name: "My Account", url: "/account" },
		{ name: `Order #${nextParams.number}`, url: `/account/${nextParams.number}` },
	]);

	const orderSchema = getEnhancedOrderSchema({
		orderNumber: order.orderNumber.toString(),
		orderDate: order.processedAt,
		orderStatus: order.fulfillmentStatus || "processing",
		customer: {
			name: `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || "Customer",
			email: customer.email,
		},
		totalAmount: order.totalPrice,
		currency: order.totalPrice.currencyCode,
		items: order.lineItems.edges.map(({ node }) => ({
			name: node.title,
			sku: "", // SKU not available in lineItem type
			quantity: node.quantity,
			price: node.originalTotalPrice,
		})),
	});

	return (
		<>
			<script
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(breadcrumbSchema),
				}}
				type="application/ld+json"
			/>
			<script
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(orderSchema),
				}}
				type="application/ld+json"
			/>

			<Script id="order-analytics" strategy="afterInteractive">
				{`
					window.dataLayer = window.dataLayer || [];
					window.dataLayer.push({
						'event': 'page_view',
						'page_type': 'order_details',
						'page_location': window.location.href,
						'order_id': '${order.id}',
						'order_number': '${order.orderNumber}',
						'order_value': ${Number.parseFloat(order.totalPrice.amount)},
						'currency': '${order.totalPrice.currencyCode}'
					});
				`}
			</Script>

			<div className="min-h-screen bg-muted/50">
				<div className="px-4 pt-4">
					<UniversalBreadcrumb items={BreadcrumbConfigs.accountOrder(nextParams.number)} />
				</div>
				<AccountNavigation active="orders" />
				<div className="container max-w-6xl pb-16">
					<OrderDetails customer={customer} order={order} />
				</div>
			</div>
		</>
	);
}
