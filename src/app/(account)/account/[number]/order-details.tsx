"use client";

import { ArrowLeft, Check, Circle, Download, Gift, Loader2, Mail, Package, Printer } from "lucide-react";
import Image from "next/image";
import { Link } from "@/components/ui/link";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { addToCart, createCart } from "@/lib/actions/shopify";
import type { ShopifyCustomer } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

type OrderDetailsProps = {
	order: ShopifyCustomer["orders"]["edges"][0]["node"];
	customer: ShopifyCustomer;
};

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
		} catch (_error) {
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
		} catch (_error) {
			toast.error("Failed to add items to cart");
		} finally {
			setIsAddingToCart(false);
		}
	};

	const handlePrint = () => {
		window.print();
	};

	const handleDownload = () => {};

	const handleEmail = () => {};

	// Calculate order totals
	const subtotal = order.lineItems.edges.reduce(
		(total, { node: item }) => total + Number.parseFloat(item.originalTotalPrice.amount),
		0
	);

	const shipping = 0; // Free shipping
	const total = subtotal + shipping;

	// Format the fulfillment status
	const _formatStatus = (status: string) =>
		status
			.toLowerCase()
			.split("_")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");

	// Get status color
	const _getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case "fulfilled":
				return "text-green-600";
			case "in_progress":
			case "partially_fulfilled":
				return "text-yellow-600";
			case "unfulfilled":
				return "text-red-600";
			default:
				return "text-muted-foreground";
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
				status: isFullyFulfilled
					? ("completed" as const)
					: isPartiallyFulfilled
						? ("partial" as const)
						: ("pending" as const),
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

			<div className="min-h-screen bg-muted pb-16 print:bg-white print:pb-0">
				<main className="mx-auto w-full p-4 print:p-0">
					{/* Back button - hide on print */}
					<div className="no-print mb-6">
						<Link className="flex items-center text-blue-600 hover:text-blue-800" href="/account">
							<ArrowLeft className="mr-2 h-5 w-5" />
							Back to Order History
						</Link>
					</div>

					<div className="card mb-6 rounded-lg bg-white p-6 shadow">
						<div className="mb-8 flex items-center justify-between">
							<div>
								<h1 className="mb-2 font-bold text-2xl">Order #{order.orderNumber}</h1>
								<p className="text-muted-foreground">Placed on {new Date(order.processedAt).toLocaleDateString()}</p>
							</div>
							{/* Action buttons - hide on print */}
							<div className="action-buttons flex space-x-2">
								<Button disabled={isBuyingNow} onClick={handleBuyAllAgain} size="sm" variant="default">
									{isBuyingNow ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Processing...
										</>
									) : (
										"Buy All Again"
									)}
								</Button>
								<Button disabled={isAddingToCart} onClick={handleAddAllToCart} size="sm" variant="outline">
									{isAddingToCart ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Adding...
										</>
									) : (
										"Add All to Cart"
									)}
								</Button>
								<Button onClick={handlePrint} size="sm" variant="outline">
									<Printer className="mr-2 h-4 w-4" />
									Print
								</Button>
								<Button onClick={handleDownload} size="sm" variant="outline">
									<Download className="mr-2 h-4 w-4" />
									Download
								</Button>
								<Button onClick={handleEmail} size="sm" variant="outline">
									<Mail className="mr-2 h-4 w-4" />
									Email
								</Button>
							</div>
						</div>

						{/* Centered Horizontal Timeline */}
						<div className="timeline-container flex justify-center">
							<div className="w-full max-w-4xl overflow-auto">
								<div className="flex min-w-max gap-4 pb-4">
									{getTimelineSteps().map((step, index) => (
										<div className="relative flex w-40 flex-col items-center text-center" key={step.title}>
											{/* Horizontal line connector */}
											{index < getTimelineSteps().length - 1 && (
												<div
													aria-hidden="true"
													className={`absolute top-[15px] left-[calc(50%_+_32px)] h-[2px] w-[calc(100%_-_32px)] bg-muted ${step.status === "completed" ? "bg-green-500" : ""}`}
												/>
											)}

											{/* Status indicator */}
											<div className="relative z-10 mb-3">
												{step.status === "completed" ? (
													<div className="rounded-full bg-green-500 p-1">
														<Check className="h-5 w-5 text-white" />
													</div>
												) : step.status === "partial" ? (
													<div className="relative overflow-hidden rounded-full border-2 border-yellow-500 p-1">
														<Circle className="h-5 w-5 text-yellow-500" />
														<div className="absolute inset-0 bg-yellow-500" style={{ clipPath: "inset(0 50% 0 0)" }} />
													</div>
												) : step.status === "current" ? (
													<div className="rounded-full border-2 border-blue-500 p-1">
														<Circle className="h-5 w-5 animate-pulse fill-blue-500 text-blue-500" />
													</div>
												) : (
													<div className="rounded-full border border-2 p-1">
														<Circle className="h-5 w-5 text-gray-200" />
													</div>
												)}
											</div>

											{/* Step content */}
											<div className="flex-1">
												<h3
													className={`font-medium text-sm ${step.status === "pending" ? "text-muted-foreground" : step.status === "partial" ? "text-yellow-600" : "text-foreground"}`}
												>
													{step.title}
												</h3>
												<p className="mt-1 text-muted-foreground text-xs">{step.description}</p>
												{step.date && <p className="mt-1 text-muted-foreground text-xs">{step.date}</p>}
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-6 md:grid-cols-3 print:block">
						<div className="md:col-span-1">
							<div className="card mb-6 rounded-lg bg-white p-6 shadow">
								<h2 className="mb-4 font-semibold text-xl">Order Summary</h2>

								{/* Order Summary Details */}
								<div className="space-y-3">
									<div className="flex justify-between border-b py-2">
										<span>Subtotal</span>
										<span>{formatPrice(subtotal)}</span>
									</div>
									<div className="flex justify-between border-b py-2">
										<span>Shipping</span>
										<span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
									</div>
									<div className="flex justify-between py-2 font-semibold">
										<span>Total</span>
										<span>{formatPrice(total)}</span>
									</div>
								</div>
							</div>

							<div className="card rounded-lg bg-white p-6 shadow">
								<h2 className="mb-4 font-semibold text-xl">Customer Information</h2>
								<div className="mb-4">
									<h3 className="font-medium text-foreground">Contact Information</h3>
									<p>
										{customer.firstName} {customer.lastName}
									</p>
									<p>{customer.email}</p>
								</div>
								<div>
									<h3 className="font-medium text-foreground">Shipping Address</h3>
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
								<div className="card mb-6 rounded-lg bg-white p-6 shadow">
									<div className="mb-4 flex items-center">
										<Gift className="mr-2 h-5 w-5 text-purple-600" />
										<h2 className="font-semibold text-xl">Gift Cards</h2>
									</div>
									<div className="space-y-4">
										{giftCards.map(({ node: item }, index) => (
											<div className="flex items-center border-b py-4 last:border-b-0" key={`${order.id}-gc-${index}`}>
												<div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-foreground/15 bg-muted">
													<Image
														alt={item.title}
														className="h-full w-full object-cover"
														height={80}
														src={item.variant?.image?.url || "/placeholder.svg"}
														width={80}
													/>
												</div>
												<div className="ml-4 flex-grow">
													<h3 className="font-medium text-foreground text-lg">{item.title}</h3>
													<p className="mt-1 text-muted-foreground text-sm">
														Value: {formatPrice(Number.parseFloat(item.variant.price.amount))}
													</p>
												</div>
												<div className="ml-4">
													<p className="font-medium text-foreground text-sm">
														{formatPrice(Number.parseFloat(item.originalTotalPrice.amount))}
													</p>
												</div>
											</div>
										))}
									</div>
									<div className="mt-4 rounded-lg bg-purple-50 p-4">
										<p className="text-purple-700 text-sm">
											Gift cards have been sent to the recipient&apos;s email address.
										</p>
									</div>
								</div>
							)}

							{/* Physical Items Section */}
							{physicalItems.length > 0 && (
								<div className="card rounded-lg bg-white p-6 shadow">
									<div className="mb-4 flex items-center">
										<Package className="mr-2 h-5 w-5 text-blue-600" />
										<h2 className="font-semibold text-xl">Physical Items</h2>
									</div>

									{/* Physical Items List */}
									<div className="space-y-4">
										{physicalItems.map(({ node: item }, index) => (
											<div className="flex flex-col border-b py-4 last:border-b-0" key={`${order.id}-${index}`}>
												<div className="flex items-center">
													<Link
														className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-foreground/15 bg-muted transition-opacity hover:opacity-75"
														href={`/products/${item.variant?.product?.handle}`}
													>
														<Image
															alt={item.title}
															className="h-full w-full object-cover"
															height={80}
															src={
																item.variant?.image?.url ||
																item.variant?.product?.images?.edges[0]?.node?.url ||
																"/placeholder.svg"
															}
															width={80}
														/>
													</Link>
													<div className="ml-4 flex-grow">
														<h3 className="font-medium text-foreground text-lg">
															<Link
																className="hover:text-blue-600 hover:underline"
																href={`/products/${item.variant?.product?.handle}`}
															>
																{item.title}
															</Link>
														</h3>
														<p className="mt-1 text-muted-foreground text-sm">
															{item.variant.title !== "Default Title" && (
																<span className="mr-2">{item.variant.title}</span>
															)}
															Quantity: {item.quantity}
														</p>
													</div>
													<div className="ml-4">
														<p className="font-medium text-foreground text-sm">
															{formatPrice(Number.parseFloat(item.originalTotalPrice.amount))}
														</p>
													</div>
												</div>
												{/* Item Actions - hide on print */}
												<div className="no-print mt-4 flex justify-end gap-2">
													<Button
														disabled={isBuyingNow}
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
															} catch (_error) {
																toast.error("Failed to proceed to checkout");
															} finally {
																setIsBuyingNow(false);
															}
														}}
														size="sm"
														variant="default"
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
														disabled={isAddingToCart}
														onClick={async () => {
															setIsAddingToCart(true);
															try {
																await addItem({
																	merchandiseId: item.variant.id,
																	quantity: item.quantity,
																});
																toast.success("Added to cart");
															} catch (_error) {
																toast.error("Failed to add to cart");
															} finally {
																setIsAddingToCart(false);
															}
														}}
														size="sm"
														variant="outline"
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
													<Button asChild size="sm" variant="outline">
														<Link href={`/help?subject=Return or Refund - Order #${order.orderNumber}`}>
															Request Return/Refund
														</Link>
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
