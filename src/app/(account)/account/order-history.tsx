"use client";

import { Dialog } from "@headlessui/react";
import { Loader2, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "@/components/ui/link";
import { addToCart, createCart } from "@/lib/actions/shopify";
import { formatPrice } from "@/lib/utils";

function classNames(...classes: string[]) {
	return classes.filter(Boolean).join(" ");
}

type OrderItem = {
	title: string;
	quantity: number;
	originalTotalPrice: {
		amount: string;
		currencyCode: string;
	};
	variant: {
		id: string;
		title: string;
		price: {
			amount: string;
			currencyCode: string;
		};
		image?: {
			url: string;
			altText: string | null;
			width?: number;
			height?: number;
		};
		product?: {
			id: string;
			title: string;
			handle: string;
			images: {
				edges: Array<{
					node: {
						url: string;
						altText: string | null;
						width?: number;
						height?: number;
					};
				}>;
			};
		};
	};
};

type Order = {
	id: string;
	orderNumber: number;
	processedAt: string;
	fulfillmentStatus: string;
	totalPrice: {
		amount: string;
		currencyCode: string;
	};
	lineItems: {
		edges: Array<{
			node: OrderItem;
		}>;
	};
};

type OrderHistoryProps = {
	orders: Order[];
};

export default function OrderHistory({ orders: initialOrders }: OrderHistoryProps) {
	const [orders] = useState(initialOrders);
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const { addItem } = useCart();
	const [isBuyingNow, setIsBuyingNow] = useState<{ [key: string]: boolean }>({});
	const [isAddingToCart, setIsAddingToCart] = useState<{ [key: string]: boolean }>({});

	const _viewOrderDetails = (order: Order) => {
		setSelectedOrder(order);
		setIsDetailsOpen(true);
	};

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case "fulfilled":
				return "text-green-600 dark:text-green-400";
			case "in_progress":
			case "partially_fulfilled":
				return "text-yellow-600 dark:text-yellow-400";
			case "unfulfilled":
				return "text-red-600 dark:text-red-400";
			default:
				return "text-muted-foreground";
		}
	};

	const formatStatus = (status: string) =>
		status
			.toLowerCase()
			.split("_")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");

	const handleBuyAgain = async (order: Order) => {
		setIsBuyingNow((prev) => ({ ...prev, [order.id]: true }));
		try {
			const items = order.lineItems.edges.map(({ node }) => ({
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
			setIsBuyingNow((prev) => ({ ...prev, [order.id]: false }));
		}
	};

	const handleAddToCart = async (order: Order) => {
		setIsAddingToCart((prev) => ({ ...prev, [order.id]: true }));
		try {
			const items = order.lineItems.edges.map(({ node }) => ({
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
			setIsAddingToCart((prev) => ({ ...prev, [order.id]: false }));
		}
	};

	return (
		<div>
			<div className="mb-6">
				<h2 className="font-bold text-2xl">Order History</h2>
				<p className="text-muted-foreground">View and manage your orders</p>
			</div>

			<div className="space-y-6">
				{orders.map((order) => (
					<Card className="p-6" key={order.id}>
						<div className="space-y-6">
							<div className="flex items-start justify-between">
								<div>
									<h3 className="mb-1 font-medium text-lg">
										Order #{order.orderNumber} •{" "}
										<time dateTime={order.processedAt}>{new Date(order.processedAt).toLocaleDateString()}</time>
									</h3>
									<p className="text-sm">
										<span className={classNames(getStatusColor(order.fulfillmentStatus))}>
											{formatStatus(order.fulfillmentStatus)}
										</span>
									</p>
								</div>
								<div className="text-right">
									<p className="font-medium">
										{formatPrice(Number.parseFloat(order.totalPrice.amount), order.totalPrice.currencyCode)}
									</p>
									<div className="mt-2 flex justify-end gap-2">
										<Button
											disabled={isBuyingNow[order.id]}
											onClick={() => handleBuyAgain(order)}
											size="sm"
											variant="default"
										>
											{isBuyingNow[order.id] ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													Processing...
												</>
											) : (
												"Buy Again"
											)}
										</Button>
										<Button
											disabled={isAddingToCart[order.id]}
											onClick={() => handleAddToCart(order)}
											size="sm"
											variant="outline"
										>
											{isAddingToCart[order.id] ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													Adding...
												</>
											) : (
												"Add All to Cart"
											)}
										</Button>
										<Link href={`/account/${order.orderNumber}`}>
											<Button size="sm" variant="outline">
												View Details
											</Button>
										</Link>
									</div>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
								{order.lineItems.edges.slice(0, 4).map(({ node: item }, index) => (
									<div className="group relative" key={`${order.id}-item-${index}`}>
										<div className="aspect-h-1 aspect-w-1 overflow-hidden rounded-lg bg-muted group-hover:opacity-75">
											<Image
												alt={item.variant.image?.altText || item.title}
												className="h-full w-full object-cover object-center"
												height={500}
												src={item.variant.image?.url || "/placeholder.svg"}
												width={500}
											/>
										</div>
										<div className="mt-2 space-y-1">
											<h4 className="line-clamp-1 text-muted-foreground text-sm">{item.title}</h4>
											<p className="font-medium text-sm">
												{formatPrice(Number.parseFloat(item.variant.price.amount), item.variant.price.currencyCode)}
											</p>
											<p className="text-muted-foreground text-xs">Qty: {item.quantity}</p>
										</div>
									</div>
								))}
								{order.lineItems.edges.length > 4 && (
									<div
										className="relative flex aspect-h-1 aspect-w-1 items-center justify-center rounded-lg bg-muted"
										key={`${order.id}-more-items`}
									>
										<p className="font-medium text-muted-foreground text-sm">
											+{order.lineItems.edges.length - 4} more items
										</p>
									</div>
								)}
							</div>
						</div>
					</Card>
				))}

				{orders.length === 0 && (
					<Card className="p-6 text-center">
						<p className="text-muted-foreground">No orders yet</p>
					</Card>
				)}
			</div>

			<Dialog className="relative z-50" onClose={() => setIsDetailsOpen(false)} open={isDetailsOpen}>
				<div aria-hidden="true" className="fixed inset-0 bg-black/30" />

				<div className="fixed inset-0 overflow-y-auto">
					<div className="flex min-h-full items-center justify-center p-4">
						<Dialog.Panel className="mx-auto max-w-lg rounded-lg bg-background p-6">
							<div className="absolute top-4 right-4">
								<Button onClick={() => setIsDetailsOpen(false)} size="icon" variant="ghost">
									<X className="h-4 w-4" />
								</Button>
							</div>

							<div className="mt-2">
								<Dialog.Title className="font-semibold text-lg">Order Details</Dialog.Title>

								{selectedOrder && (
									<div className="mt-4">
										<div className="space-y-2">
											<p className="text-sm">
												<span className="font-medium">Order Number:</span> #{selectedOrder.orderNumber}
											</p>
											<p className="text-sm">
												<span className="font-medium">Date:</span>{" "}
												{new Date(selectedOrder.processedAt).toLocaleDateString()}
											</p>
											<p className="text-sm">
												<span className="font-medium">Status:</span>{" "}
												<span className={classNames(getStatusColor(selectedOrder.fulfillmentStatus))}>
													{formatStatus(selectedOrder.fulfillmentStatus)}
												</span>
											</p>
											<p className="text-sm">
												<span className="font-medium">Total:</span>{" "}
												{formatPrice(
													Number.parseFloat(selectedOrder.totalPrice.amount),
													selectedOrder.totalPrice.currencyCode
												)}
											</p>
										</div>

										<div className="mt-6">
											<h4 className="mb-4 font-medium text-base">Items</h4>
											<Card>
												<div className="divide-y">
													{selectedOrder.lineItems.edges.map(({ node: item }, index) => (
														<div className="flex items-center gap-4 p-4" key={`${selectedOrder.id}-detail-${index}`}>
															<div className="relative h-16 w-16 overflow-hidden rounded-lg">
																<Image
																	alt={item.variant.image?.altText || item.title}
																	className="object-cover"
																	fill
																	sizes="64px"
																	src={item.variant.image?.url || "/placeholder.svg"}
																/>
															</div>
															<div className="min-w-0 flex-1">
																<p className="font-medium text-sm">{item.title}</p>
																<p className="text-muted-foreground text-sm">
																	{item.variant.title} • Qty: {item.quantity}
																</p>
																<p className="font-medium text-sm">
																	{formatPrice(
																		Number.parseFloat(item.variant.price.amount),
																		item.variant.price.currencyCode
																	)}
																</p>
															</div>
														</div>
													))}
												</div>
											</Card>
										</div>
									</div>
								)}
							</div>

							<div className="mt-6 flex justify-end">
								<Button onClick={() => setIsDetailsOpen(false)} variant="outline">
									Close
								</Button>
							</div>
						</Dialog.Panel>
					</div>
				</div>
			</Dialog>
		</div>
	);
}
