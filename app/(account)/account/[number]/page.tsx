import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCustomer } from "@/lib/services/shopify-customer";
import OrderDetails from "./order-details";
import { Metadata } from "next";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/seo-utils";
import { getEnhancedBreadcrumbSchema, getEnhancedOrderSchema } from "@/lib/seo/enhanced-jsonld";
import Script from "next/script";

export const dynamic = 'force-dynamic';

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
      "order status"
    ],
    url: `/account/${nextParams.number}`,
    noindex: true, // Order pages shouldn't be indexed for privacy
    openGraph: {
      type: "website",
    },
  });
}

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

		// Generate breadcrumbs
		const breadcrumbs = [
			{ name: "Home", url: "/" },
			{ name: "My Account", url: "/account" },
			{ name: `Order #${nextParams.number}`, url: `/account/${nextParams.number}` },
		];
		
		const breadcrumbSchema = getEnhancedBreadcrumbSchema(breadcrumbs);
		
		// Generate order schema
		const orderSchema = getEnhancedOrderSchema({
			orderNumber: order.orderNumber.toString(),
			orderDate: order.processedAt,
			orderStatus: order.fulfillmentStatus || 'processing',
			customer: {
				name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Customer',
				email: customer.email,
			},
			totalAmount: order.totalPrice,
			currency: order.currencyCode,
			items: order.lineItems.edges.map(({ node }) => ({
				name: node.title,
				sku: node.variant?.sku || '',
				quantity: node.quantity,
				price: node.originalTotalPrice,
			})),
		});

		return (
			<>
				{/* JSON-LD Structured Data */}
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(breadcrumbSchema),
					}}
				/>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(orderSchema),
					}}
				/>
				
				{/* Google Analytics for Order View */}
				<Script id="order-analytics" strategy="afterInteractive">
					{`
						window.dataLayer = window.dataLayer || [];
						window.dataLayer.push({
							'event': 'page_view',
							'page_type': 'order_details',
							'page_location': window.location.href,
							'order_id': '${order.id}',
							'order_number': '${order.orderNumber}',
							'order_value': ${parseFloat(order.totalPrice.amount)},
							'currency': '${order.currencyCode}'
						});
					`}
				</Script>
				
				<OrderDetails order={order} customer={customer} />
			</>
		);
	} catch (error) {
		console.error("❌ [Order Details] Failed to fetch order:", error);
		
		// Generate error breadcrumbs
		const errorBreadcrumbs = [
			{ name: "Home", url: "/" },
			{ name: "My Account", url: "/account" },
			{ name: `Order #${nextParams.number}`, url: `/account/${nextParams.number}` },
		];
		
		const errorBreadcrumbSchema = getEnhancedBreadcrumbSchema(errorBreadcrumbs);
		
		return (
			<>
				{/* JSON-LD Structured Data for Error State */}
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(errorBreadcrumbSchema),
					}}
				/>
				
				{/* Google Analytics for Order Error */}
				<Script id="order-error-analytics" strategy="afterInteractive">
					{`
						window.dataLayer = window.dataLayer || [];
						window.dataLayer.push({
							'event': 'page_view',
							'page_type': 'order_error',
							'page_location': window.location.href,
							'error_type': 'order_fetch_failed',
							'order_number': '${nextParams.number}'
						});
					`}
				</Script>
				
				<div className="container max-w-6xl py-8">
					{/* Breadcrumb Navigation */}
					<nav className="mb-8" aria-label="Breadcrumb">
						<ol className="flex items-center space-x-2 text-sm text-gray-600">
							<li>
								<a href="/" className="hover:text-gray-900">Home</a>
							</li>
							<li className="text-gray-400">/</li>
							<li>
								<a href="/account" className="hover:text-gray-900">My Account</a>
							</li>
							<li className="text-gray-400">/</li>
							<li className="text-gray-900 font-medium">Order #{nextParams.number}</li>
						</ol>
					</nav>
					
					<div className="rounded-lg border bg-destructive/10 p-6 text-destructive">
						<h1 className="text-xl font-semibold mb-2">Error Loading Order</h1>
						<p>There was a problem loading your order details. Please try again later.</p>
						<div className="mt-4">
							<a href="/account" className="text-sm underline">
								Back to Account
							</a>
						</div>
					</div>
				</div>
			</>
		);
	}
}
