"use client";

import { ArrowLeft, Printer, Download, Mail, Check, Circle, Gift, Package, Clock, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import type { ShopifyCustomer } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/providers/cart-provider";
import { toast } from "sonner";
import { useState } from "react";
import { createCart, addToCart } from "@/lib/actions/shopify";

interface OrderDetailsProps {
	order: ShopifyCustomer["orders"]["edges"][0]["node"];
	customer: ShopifyCustomer;
}

export default function OrderDetails({ order, customer }: OrderDetailsProps) {
	const { addItem } = useCart();
	const [isBuyingNow, setIsBuyingNow] = useState(false);
	const [isAddingToCart, setIsAddingToCart] = useState(false);

	const handleBuyAllAgain = async () => {
		setIsBuyingNow(true);
		try {
			const items = [...giftCards, ...physicalItems].map(({ node }) => ({
				merchandiseId: node.variant.id,
				quantity: node.quantity,
			}));

			// Create a new cart
			const cart = await createCart();
			if (!cart?.id) {
				throw new Error("Failed to create cart");
			}

			// Add all items to the cart
			const updatedCart = await addToCart(cart.id, items);

			if (!updatedCart?.checkoutUrl) {
				throw new Error("Failed to get checkout URL");
			}

			// Redirect to checkout
			window.location.href = updatedCart.checkoutUrl;
		} catch (error) {
			console.error("Error in handleBuyAllAgain:", error);
			toast.error("Failed to proceed to checkout");
		} finally {
			setIsBuyingNow(false);
		}
	};

	const handleAddAllToCart = async () => {
		setIsAddingToCart(true);
		try {
			const items = [...giftCards, ...physicalItems].map(({ node }) => ({
				merchandiseId: node.variant.id,
				quantity: node.quantity,
			}));

			// Add items one by one using addItem
			for (const item of items) {
				await addItem(item);
			}

			toast.success("All items added to cart");
		} catch (error) {
			console.error("Error adding all items to cart:", error);
			toast.error("Failed to add items to cart");
		} finally {
			setIsAddingToCart(false);
		}
	};

	const handlePrint = () => {
		window.print();
	};

	const handleDownload = () => {
		// TODO: Implement PDF download
		console.log("Download functionality coming soon");
	};

	const handleEmail = () => {
		// TODO: Implement email functionality
		console.log("Email functionality coming soon");
	};

	// Calculate order totals
	const subtotal = order.lineItems.edges.reduce((total, { node: item }) => {
		return total + parseFloat(item.originalTotalPrice.amount);
	}, 0);

	const shipping = 0; // Free shipping
	const total = subtotal + shipping;

	// Format the fulfillment status
	const formatStatus = (status: string) => {
		return status
			.toLowerCase()
			.split("_")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	};

	// Get status color
	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case "fulfilled":
				return "text-green-600";
			case "in_progress":
			case "partially_fulfilled":
				return "text-yellow-600";
			case "unfulfilled":
				return "text-red-600";
			default:
				return "text-gray-600";
		}
	};

	// Separate items into gift cards and physical items
	const giftCards = order.lineItems.edges.filter(({ node }) => node.title.toLowerCase().includes("gift card"));
	const physicalItems = order.lineItems.edges.filter(({ node }) => !node.title.toLowerCase().includes("gift card"));

	// Get timeline steps based on status
	const getTimelineSteps = () => {
		const isPartiallyFulfilled = order.fulfillmentStatus === "PARTIALLY_FULFILLED";
		const isFullyFulfilled = order.fulfillmentStatus === "FULFILLED";

		return [
			{
				title: "Order Confirmed",
				description: "We've received your order",
				date: new Date(order.processedAt).toLocaleString(),
				status: "completed" as const,
			},
			{
				title: "Processing",
				description: "Your order is being prepared",
				status: isPartiallyFulfilled || isFullyFulfilled ? ("completed" as const) : ("current" as const),
			},
			{
				title: "Order Fulfilled",
				description: isPartiallyFulfilled ? "Some items have been prepared" : "Items have been prepared for shipping",
				status: isFullyFulfilled ? ("completed" as const) : isPartiallyFulfilled ? ("partial" as const) : ("pending" as const),
			},
			{
				title: "Shipped",
				description: "Your order is on its way",
				status: isFullyFulfilled ? ("completed" as const) : ("pending" as const),
			},
			{
				title: "Delivered",
				description: "Package has been delivered",
				status: "pending" as const,
			},
		];
	};

	// Add this style block at the top of the component, after the imports
	const printStyles = `
		@media print {
			/* Hide navigation and action buttons */
			header, 
			.no-print,
			.action-buttons {
				display: none !important;
			}

			/* Reset background colors and shadows for better printing */
			body {
				background: white !important;
			}

			main {
				padding: 0 !important;
			}

			/* Ensure all cards are white with no shadows */
			.card {
				background: white !important;
				box-shadow: none !important;
				border: 1px solid #eee !important;
				break-inside: avoid;
			}

			/* Ensure text is black for better printing */
			* {
				color: black !important;
				text-align: left;
			}

			/* Add page breaks where needed */
			.page-break {
				page-break-before: always;
			}

			/* Ensure images print well */
			img {
				max-width: 100% !important;
				height: auto !important;
			}

			/* Show full URLs for links */
			a[href]:after {
				content: " (" attr(href) ")";
				font-size: 0.8em;
			}

			/* Adjust timeline for printing */
			.timeline-container {
				overflow: visible !important;
				max-width: none !important;
			}

			/* Ensure grid layout prints properly */
			.grid {
				display: block !important;
			}

			.grid > div {
				margin-bottom: 2em;
			}
		}
	`;

	return (
		<>
			{/* Add print styles */}
			<style dangerouslySetInnerHTML={{ __html: printStyles }} />

			<div className="min-h-screen bg-gray-100 pb-16 print:bg-white print:pb-0">
				<main className="w-full mx-auto p-4 print:p-0">
					{/* Back button - hide on print */}
					<div className="mb-6 no-print">
						<Link href="/account" className="flex items-center text-blue-600 hover:text-blue-800">
							<ArrowLeft className="mr-2 h-5 w-5" />
							Back to Order History
						</Link>
					</div>

					<div className="bg-white shadow rounded-lg p-6 mb-6 card">
						<div className="flex justify-between items-center mb-8">
							<div>
								<h1 className="text-2xl font-bold mb-2">Order #{order.orderNumber}</h1>
								<p className="text-gray-600">Placed on {new Date(order.processedAt).toLocaleDateString()}</p>
							</div>
							{/* Action buttons - hide on print */}
							<div className="flex space-x-2 action-buttons">
								<Button onClick={handleBuyAllAgain} variant="default" size="sm" disabled={isBuyingNow}>
									{isBuyingNow ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Processing...
										</>
									) : (
										"Buy All Again"
									)}
								</Button>
								<Button onClick={handleAddAllToCart} variant="outline" size="sm" disabled={isAddingToCart}>
									{isAddingToCart ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Adding...
										</>
									) : (
										"Add All to Cart"
									)}
								</Button>
								<Button onClick={handlePrint} variant="outline" size="sm">
									<Printer className="mr-2 h-4 w-4" />
									Print
								</Button>
								<Button onClick={handleDownload} variant="outline" size="sm">
									<Download className="mr-2 h-4 w-4" />
									Download
								</Button>
								<Button onClick={handleEmail} variant="outline" size="sm">
									<Mail className="mr-2 h-4 w-4" />
									Email
								</Button>
							</div>
						</div>

						{/* Centered Horizontal Timeline */}
						<div className="flex justify-center timeline-container">
							<div className="overflow-auto max-w-4xl w-full">
								<div className="flex min-w-max gap-4 pb-4">
									{getTimelineSteps().map((step, index) => (
										<div key={step.title} className="relative flex flex-col items-center text-center w-40">
											{/* Horizontal line connector */}
											{index < getTimelineSteps().length - 1 && <div className={`absolute top-[15px] left-[calc(50%_+_32px)] w-[calc(100%_-_32px)] h-[2px] bg-gray-200 ${step.status === "completed" ? "bg-green-500" : ""}`} aria-hidden="true" />}

											{/* Status indicator */}
											<div className="relative z-10 mb-3">
												{step.status === "completed" ? (
													<div className="rounded-full bg-green-500 p-1">
														<Check className="w-5 h-5 text-white" />
													</div>
												) : step.status === "partial" ? (
													<div className="rounded-full border-2 border-yellow-500 p-1 relative overflow-hidden">
														<Circle className="w-5 h-5 text-yellow-500" />
														<div className="absolute inset-0 bg-yellow-500" style={{ clipPath: "inset(0 50% 0 0)" }} />
													</div>
												) : step.status === "current" ? (
													<div className="rounded-full border-2 border-blue-500 p-1">
														<Circle className="w-5 h-5 fill-blue-500 text-blue-500 animate-pulse" />
													</div>
												) : (
													<div className="rounded-full border-2 border-gray-200 p-1">
														<Circle className="w-5 h-5 text-gray-200" />
													</div>
												)}
											</div>

											{/* Step content */}
											<div className="flex-1">
												<h3 className={`font-medium text-sm ${step.status === "pending" ? "text-gray-500" : step.status === "partial" ? "text-yellow-700" : "text-gray-900"}`}>{step.title}</h3>
												<p className="text-xs text-gray-500 mt-1">{step.description}</p>
												{step.date && <p className="text-xs text-gray-500 mt-1">{step.date}</p>}
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:block">
						<div className="md:col-span-1">
							<div className="bg-white shadow rounded-lg p-6 mb-6 card">
								<h2 className="text-xl font-semibold mb-4">Order Summary</h2>

								{/* Order Summary Details */}
								<div className="space-y-3">
									<div className="flex justify-between py-2 border-b">
										<span>Subtotal</span>
										<span>{formatPrice(subtotal)}</span>
									</div>
									<div className="flex justify-between py-2 border-b">
										<span>Shipping</span>
										<span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
									</div>
									<div className="flex justify-between py-2 font-semibold">
										<span>Total</span>
										<span>{formatPrice(total)}</span>
									</div>
								</div>
							</div>

							<div className="bg-white shadow rounded-lg p-6 card">
								<h2 className="text-xl font-semibold mb-4">Customer Information</h2>
								<div className="mb-4">
									<h3 className="font-medium text-gray-900">Contact Information</h3>
									<p>
										{customer.firstName} {customer.lastName}
									</p>
									<p>{customer.email}</p>
								</div>
								<div>
									<h3 className="font-medium text-gray-900">Shipping Address</h3>
									{customer.defaultAddress ? (
										<>
											<p>{customer.defaultAddress.address1}</p>
											{customer.defaultAddress.address2 && <p>{customer.defaultAddress.address2}</p>}
											<p>
												{customer.defaultAddress.city}, {customer.defaultAddress.province} {customer.defaultAddress.zip}
											</p>
											<p>{customer.defaultAddress.country}</p>
										</>
									) : (
										<p className="text-muted-foreground">Not available</p>
									)}
								</div>
							</div>
						</div>

						<div className="md:col-span-2">
							{/* Gift Cards Section */}
							{giftCards.length > 0 && (
								<div className="bg-white shadow rounded-lg p-6 mb-6 card">
									<div className="flex items-center mb-4">
										<Gift className="h-5 w-5 text-purple-600 mr-2" />
										<h2 className="text-xl font-semibold">Gift Cards</h2>
									</div>
									<div className="space-y-4">
										{giftCards.map(({ node: item }, index) => (
											<div key={`${order.id}-gc-${index}`} className="flex items-center py-4 border-b last:border-b-0">
												<div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg overflow-hidden border border-foreground/15">
													<Image src={item.variant?.image?.url || "/placeholder.svg"} alt={item.title} width={80} height={80} className="w-full h-full object-cover" />
												</div>
												<div className="ml-4 flex-grow">
													<h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
													<p className="mt-1 text-sm text-gray-500">Value: {formatPrice(parseFloat(item.variant.price.amount))}</p>
												</div>
												<div className="ml-4">
													<p className="text-sm font-medium text-gray-900">{formatPrice(parseFloat(item.originalTotalPrice.amount))}</p>
												</div>
											</div>
										))}
									</div>
									<div className="mt-4 p-4 bg-purple-50 rounded-lg">
										<p className="text-sm text-purple-700">Gift cards have been sent to the recipient's email address.</p>
									</div>
								</div>
							)}

							{/* Physical Items Section */}
							{physicalItems.length > 0 && (
								<div className="bg-white shadow rounded-lg p-6 card">
									<div className="flex items-center mb-4">
										<Package className="h-5 w-5 text-blue-600 mr-2" />
										<h2 className="text-xl font-semibold">Physical Items</h2>
									</div>

									{/* Physical Items List */}
									<div className="space-y-4">
										{physicalItems.map(({ node: item }, index) => (
											<div key={`${order.id}-${index}`} className="flex flex-col py-4 border-b last:border-b-0">
												<div className="flex items-center">
													<Link href={`/products/${item.variant?.product?.handle}`} className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg overflow-hidden border border-foreground/15 hover:opacity-75 transition-opacity">
														<Image src={item.variant?.image?.url || item.variant?.product?.images?.edges[0]?.node?.url || "/placeholder.svg"} alt={item.title} width={80} height={80} className="w-full h-full object-cover" />
													</Link>
													<div className="ml-4 flex-grow">
														<h3 className="text-lg font-medium text-gray-900">
															<Link href={`/products/${item.variant?.product?.handle}`} className="hover:text-blue-600 hover:underline">
																{item.title}
															</Link>
														</h3>
														<p className="mt-1 text-sm text-gray-500">
															{item.variant.title !== "Default Title" && <span className="mr-2">{item.variant.title}</span>}
															Quantity: {item.quantity}
														</p>
													</div>
													<div className="ml-4">
														<p className="text-sm font-medium text-gray-900">{formatPrice(parseFloat(item.originalTotalPrice.amount))}</p>
													</div>
												</div>
												{/* Item Actions - hide on print */}
												<div className="mt-4 flex gap-2 justify-end no-print">
													<Button
														variant="default"
														size="sm"
														onClick={async () => {
															setIsBuyingNow(true);
															try {
																const cart = await createCart();
																if (!cart?.id) {
																	throw new Error("Failed to create cart");
																}

																const updatedCart = await addToCart(cart.id, [
																	{
																		merchandiseId: item.variant.id,
																		quantity: item.quantity,
																	},
																]);

																if (!updatedCart?.checkoutUrl) {
																	throw new Error("Failed to get checkout URL");
																}

																window.location.href = updatedCart.checkoutUrl;
															} catch (error) {
																console.error("Error in buy again:", error);
																toast.error("Failed to proceed to checkout");
															} finally {
																setIsBuyingNow(false);
															}
														}}
														disabled={isBuyingNow}
													>
														{isBuyingNow ? (
															<>
																<Loader2 className="mr-2 h-4 w-4 animate-spin" />
																Processing...
															</>
														) : (
															"Buy Again"
														)}
													</Button>
													<Button
														variant="outline"
														size="sm"
														onClick={async () => {
															setIsAddingToCart(true);
															try {
																await addItem({
																	merchandiseId: item.variant.id,
																	quantity: item.quantity,
																});
																toast.success("Added to cart");
															} catch (error) {
																console.error("Error adding to cart:", error);
																toast.error("Failed to add to cart");
															} finally {
																setIsAddingToCart(false);
															}
														}}
														disabled={isAddingToCart}
													>
														{isAddingToCart ? (
															<>
																<Loader2 className="mr-2 h-4 w-4 animate-spin" />
																Adding...
															</>
														) : (
															"Add to Cart"
														)}
													</Button>
													<Button variant="outline" size="sm" asChild>
														<Link href={`/contact?subject=Return or Refund - Order #${order.orderNumber}`}>Request Return/Refund</Link>
													</Button>
												</div>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				</main>
			</div>
		</>
	);
}
