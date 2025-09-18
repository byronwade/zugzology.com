"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { X, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/providers/cart-provider";
import { toast } from "sonner";
import { createCart, addToCart } from "@/lib/actions/shopify";

function classNames(...classes: string[]) {
	return classes.filter(Boolean).join(" ");
}

interface OrderItem {
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
}

interface Order {
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
}

interface OrderHistoryProps {
	orders: Order[];
}

export default function OrderHistory({ orders: initialOrders }: OrderHistoryProps) {
	const [orders] = useState(initialOrders);
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const { addItem } = useCart();
	const [isBuyingNow, setIsBuyingNow] = useState<{ [key: string]: boolean }>({});
	const [isAddingToCart, setIsAddingToCart] = useState<{ [key: string]: boolean }>({});

	const viewOrderDetails = (order: Order) => {
		setSelectedOrder(order);
		setIsDetailsOpen(true);
	};

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

	const formatStatus = (status: string) => {
		return status
			.toLowerCase()
			.split("_")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	};

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
		} catch (error) {
			console.error("Error in handleBuyAgain:", error);
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
		} catch (error) {
			console.error("Error adding items to cart:", error);
			toast.error("Failed to add items to cart");
		} finally {
			setIsAddingToCart((prev) => ({ ...prev, [order.id]: false }));
		}
	};

	return (
		<div>
			<div className="mb-6">
				<h2 className="text-2xl font-bold">Order History</h2>
				<p className="text-muted-foreground">View and manage your orders</p>
			</div>

			<div className="space-y-6">
				{orders.map((order) => (
					<Card key={order.id} className="p-6">
						<div className="space-y-6">
							<div className="flex justify-between items-start">
								<div>
									<h3 className="text-lg font-medium mb-1">
										Order #{order.orderNumber} • <time dateTime={order.processedAt}>{new Date(order.processedAt).toLocaleDateString()}</time>
									</h3>
									<p className="text-sm">
										<span className={classNames(getStatusColor(order.fulfillmentStatus))}>{formatStatus(order.fulfillmentStatus)}</span>
									</p>
								</div>
								<div className="text-right">
									<p className="font-medium">{formatPrice(parseFloat(order.totalPrice.amount), order.totalPrice.currencyCode)}</p>
									<div className="flex gap-2 mt-2 justify-end">
										<Button variant="default" size="sm" onClick={() => handleBuyAgain(order)} disabled={isBuyingNow[order.id]}>
											{isBuyingNow[order.id] ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													Processing...
												</>
											) : (
												"Buy Again"
											)}
										</Button>
										<Button variant="outline" size="sm" onClick={() => handleAddToCart(order)} disabled={isAddingToCart[order.id]}>
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
											<Button variant="outline" size="sm">
												View Details
											</Button>
										</Link>
									</div>
								</div>
							</div>

							<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
								{order.lineItems.edges.slice(0, 4).map(({ node: item }, index) => (
									<div key={`${order.id}-item-${index}`} className="group relative">
										<div className="aspect-h-1 aspect-w-1 overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75">
											<Image src={item.variant.image?.url || "/placeholder.svg"} alt={item.variant.image?.altText || item.title} width={500} height={500} className="h-full w-full object-cover object-center" />
										</div>
										<div className="mt-2 space-y-1">
											<h4 className="text-sm text-muted-foreground line-clamp-1">{item.title}</h4>
											<p className="text-sm font-medium">{formatPrice(parseFloat(item.variant.price.amount), item.variant.price.currencyCode)}</p>
											<p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
										</div>
									</div>
								))}
								{order.lineItems.edges.length > 4 && (
									<div key={`${order.id}-more-items`} className="aspect-h-1 aspect-w-1 relative flex items-center justify-center bg-muted rounded-lg">
										<p className="text-sm font-medium text-muted-foreground">+{order.lineItems.edges.length - 4} more items</p>
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

			<Dialog open={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} className="relative z-50">
				<div className="fixed inset-0 bg-black/30" aria-hidden="true" />

				<div className="fixed inset-0 overflow-y-auto">
					<div className="flex min-h-full items-center justify-center p-4">
						<Dialog.Panel className="mx-auto max-w-lg rounded-lg bg-background p-6">
							<div className="absolute right-4 top-4">
								<Button variant="ghost" size="icon" onClick={() => setIsDetailsOpen(false)}>
									<X className="h-4 w-4" />
								</Button>
							</div>

							<div className="mt-2">
								<Dialog.Title className="text-lg font-semibold">Order Details</Dialog.Title>

								{selectedOrder && (
									<div className="mt-4">
										<div className="space-y-2">
											<p className="text-sm">
												<span className="font-medium">Order Number:</span> #{selectedOrder.orderNumber}
											</p>
											<p className="text-sm">
												<span className="font-medium">Date:</span> {new Date(selectedOrder.processedAt).toLocaleDateString()}
											</p>
											<p className="text-sm">
												<span className="font-medium">Status:</span> <span className={classNames(getStatusColor(selectedOrder.fulfillmentStatus))}>{formatStatus(selectedOrder.fulfillmentStatus)}</span>
											</p>
											<p className="text-sm">
												<span className="font-medium">Total:</span> {formatPrice(parseFloat(selectedOrder.totalPrice.amount), selectedOrder.totalPrice.currencyCode)}
											</p>
										</div>

										<div className="mt-6">
											<h4 className="text-base font-medium mb-4">Items</h4>
											<Card>
												<div className="divide-y">
													{selectedOrder.lineItems.edges.map(({ node: item }, index) => (
														<div key={`${selectedOrder.id}-detail-${index}`} className="flex items-center gap-4 p-4">
															<div className="relative h-16 w-16 overflow-hidden rounded-lg">
																<Image src={item.variant.image?.url || "/placeholder.svg"} alt={item.variant.image?.altText || item.title} fill className="object-cover" />
															</div>
															<div className="flex-1 min-w-0">
																<p className="text-sm font-medium">{item.title}</p>
																<p className="text-sm text-muted-foreground">
																	{item.variant.title} • Qty: {item.quantity}
																</p>
																<p className="text-sm font-medium">{formatPrice(parseFloat(item.variant.price.amount), item.variant.price.currencyCode)}</p>
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
								<Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
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
