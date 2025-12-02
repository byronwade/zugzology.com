"use client";

import { ArrowLeft, Check, Loader2, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { BreadcrumbConfigs, UniversalBreadcrumb } from "@/components/layout";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import type { ShopifyProduct } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

// Component for recommended products in empty cart
function RecommendedProducts() {
	const [products, setProducts] = useState<ShopifyProduct[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchPopularProducts() {
			try {
				setLoading(true);
				const response = await fetch("/api/products?limit=3&tag=popular");

				if (!response.ok) {
					// Fallback to fetching any products if no popular tag
					const fallbackResponse = await fetch("/api/products?limit=3");
					if (!fallbackResponse.ok) {
						throw new Error("Failed to fetch products");
					}
					const fallbackData = await fallbackResponse.json();
					setProducts(fallbackData.products || []);
					return;
				}

				const data = await response.json();
				setProducts(data.products || []);
			} catch (_err) {
				setError("Failed to load recommended products");
			} finally {
				setLoading(false);
			}
		}

		fetchPopularProducts();
	}, []);

	if (loading) {
		return (
			<div className="mt-12 text-left">
				<h2 className="mb-4 font-semibold text-lg">Popular Items</h2>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<div className="rounded-lg border p-4 transition-shadow" key={i}>
							<div className="relative mb-3 h-32 overflow-hidden rounded bg-muted" />
							<div className="mb-1 h-5 w-full rounded bg-muted" />
							<div className="mb-2 h-4 w-full rounded bg-muted" />
							<div className="h-4 w-24 rounded bg-muted" />
						</div>
					))}
				</div>
			</div>
		);
	}

	if (error || products.length === 0) {
		return (
			<div className="mt-12 text-left">
				<h2 className="mb-4 font-semibold text-lg">Popular Items</h2>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{/* Fallback static recommendations */}
					<div className="rounded-lg border p-4">
						<div className="mb-2 flex h-32 items-center justify-center rounded bg-muted">
							<ShoppingCart className="h-8 w-8 text-muted-foreground" />
						</div>
						<h3 className="font-medium">Beginner Growing Kit</h3>
						<p className="text-muted-foreground text-sm">Perfect for first-time growers</p>
					</div>
					<div className="rounded-lg border p-4">
						<div className="mb-2 flex h-32 items-center justify-center rounded bg-muted">
							<ShoppingCart className="h-8 w-8 text-muted-foreground" />
						</div>
						<h3 className="font-medium">Premium Substrate</h3>
						<p className="text-muted-foreground text-sm">High-quality growing medium</p>
					</div>
					<div className="rounded-lg border p-4">
						<div className="mb-2 flex h-32 items-center justify-center rounded bg-muted">
							<ShoppingCart className="h-8 w-8 text-muted-foreground" />
						</div>
						<h3 className="font-medium">Oyster Mushroom Spawn</h3>
						<p className="text-muted-foreground text-sm">Easy to grow variety</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="mt-12 text-left">
			<h2 className="mb-4 font-semibold text-lg">Popular Items</h2>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{products.map((product) => {
					const imageUrl = product.images?.nodes?.[0]?.url || product.media?.nodes?.[0]?.previewImage?.url;
					const price = product.priceRange?.minVariantPrice?.amount;
					const compareAtPrice = product.compareAtPriceRange?.minVariantPrice?.amount;
					const isOnSale = compareAtPrice && Number.parseFloat(compareAtPrice) > Number.parseFloat(price || "0");

					return (
						<Link
							className="group rounded-lg border p-4 transition-shadow hover:shadow-md"
							href={`/products/${product.handle}`}
							key={product.id}
						>
							<div className="relative mb-3 h-32 overflow-hidden rounded bg-muted">
								{imageUrl ? (
									<Image
										alt={product.images?.nodes?.[0]?.altText || product.title}
										className="object-cover transition-transform duration-200 group-hover:scale-105"
										fill
										sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
										src={imageUrl}
									/>
								) : (
									<div className="absolute inset-0 flex items-center justify-center">
										<ShoppingCart className="h-8 w-8 text-muted-foreground" />
									</div>
								)}
								{!product.availableForSale && (
									<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
										<span className="font-medium text-white text-xs">Out of Stock</span>
									</div>
								)}
							</div>
							<h3 className="mb-1 line-clamp-2 font-medium text-foreground transition-colors group-hover:text-primary">
								{product.title}
							</h3>
							{product.description && (
								<p className="mb-2 line-clamp-2 text-muted-foreground text-sm">
									{product.description.length > 80 ? `${product.description.slice(0, 80)}...` : product.description}
								</p>
							)}
							<div className="flex items-center gap-2">
								{price && (
									<span className="font-medium text-foreground">
										{formatPrice(price, product.priceRange.minVariantPrice.currencyCode)}
									</span>
								)}
								{isOnSale && compareAtPrice && (
									<span className="text-muted-foreground text-sm line-through">
										{formatPrice(compareAtPrice, product.priceRange.minVariantPrice.currencyCode)}
									</span>
								)}
								{!product.availableForSale && <span className="font-medium text-red-600 text-xs">Out of Stock</span>}
							</div>
						</Link>
					);
				})}
			</div>
		</div>
	);
}

export default function CartContent() {
	const { cart, removeItem, updateItemQuantity, isUpdating } = useCart();
	const [updating, setUpdating] = useState<string | null>(null);

	// Track cart analytics
	useEffect(() => {
		if (cart && typeof window !== "undefined" && window.gtag) {
			const cartItems = cart.lines?.edges || [];
			if (cartItems.length > 0) {
				// Track view_cart event
				window.gtag("event", "view_cart", {
					currency: cart.cost?.subtotalAmount?.currencyCode || "USD",
					value: Number.parseFloat(cart.cost?.subtotalAmount?.amount || "0"),
					items: cartItems.map((item, index) => ({
						item_id: item.node.merchandise.product.id,
						item_name: item.node.merchandise.product.title,
						price: Number.parseFloat(item.node.merchandise.price.amount),
						quantity: item.node.quantity,
						index,
					})),
				});
			}
		}
	}, [cart]);

	const handleUpdateQuantity = useCallback(
		async (lineId: string, newQuantity: number) => {
			if (newQuantity < 1) {
				return;
			}

			setUpdating(lineId);
			try {
				await updateItemQuantity(lineId, newQuantity);
			} catch (_error) {
				toast.error("Failed to update quantity");
			} finally {
				setUpdating(null);
			}
		},
		[updateItemQuantity]
	);

	const handleRemoveItem = useCallback(
		async (lineId: string, productData?: { id: string; title: string }) => {
			setUpdating(lineId);
			try {
				await removeItem(lineId);
				toast.success("Item removed from cart");

				// Track remove_from_cart event
				if (productData && typeof window !== "undefined" && window.gtag) {
					window.gtag("event", "remove_from_cart", {
						currency: productData.currency || "USD",
						value: Number.parseFloat(productData.price || "0"),
						items: [
							{
								item_id: productData.id,
								item_name: productData.title,
								price: Number.parseFloat(productData.price || "0"),
								quantity: productData.quantity,
							},
						],
					});
				}
			} catch (_error) {
				toast.error("Failed to remove item");
			} finally {
				setUpdating(null);
			}
		},
		[removeItem]
	);

	const handleCheckout = () => {
		if (!cart?.checkoutUrl) {
			return;
		}

		// Track begin_checkout event
		if (typeof window !== "undefined" && window.gtag) {
			const cartItems = cart.lines?.edges || [];
			window.gtag("event", "begin_checkout", {
				currency: cart.cost?.subtotalAmount?.currencyCode || "USD",
				value: Number.parseFloat(cart.cost?.subtotalAmount?.amount || "0"),
				items: cartItems.map((item, index) => ({
					item_id: item.node.merchandise.product.id,
					item_name: item.node.merchandise.product.title,
					price: Number.parseFloat(item.node.merchandise.price.amount),
					quantity: item.node.quantity,
					index,
				})),
			});
		}

		window.location.href = cart.checkoutUrl;
	};

	if (!cart) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	const cartItems = cart.lines?.edges || [];
	const isEmpty = cartItems.length === 0;
	const subtotal = cart.cost?.subtotalAmount?.amount ? Number.parseFloat(cart.cost.subtotalAmount.amount) : 0;

	if (isEmpty) {
		return (
			<div className="min-h-screen bg-muted/50">
				{/* Breadcrumb */}
				<UniversalBreadcrumb items={BreadcrumbConfigs.cart()} />

				<div className="mx-auto max-w-4xl px-3 py-6 sm:px-4 sm:py-8">
					<div className="rounded-lg bg-card p-6 text-center shadow-sm sm:p-8">
						<div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 p-5 sm:mb-6 sm:h-24 sm:w-24 sm:p-6">
							<ShoppingCart className="h-10 w-10 text-primary sm:h-12 sm:w-12" />
						</div>
						<h1 className="mb-2 font-bold text-foreground text-xl sm:text-2xl">Your cart is empty</h1>
						<p className="mb-6 px-4 text-muted-foreground text-sm sm:mb-8 sm:text-base">
							Add some premium mushroom cultivation supplies to get started
						</p>
						<Link href="/products">
							<Button className="h-11 sm:h-auto">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Continue Shopping
							</Button>
						</Link>

						{/* Recommended products for empty cart */}
						<RecommendedProducts />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-muted/50">
			{/* Breadcrumb */}
			<UniversalBreadcrumb items={BreadcrumbConfigs.cart()} />

			<div className="mx-auto max-w-4xl px-3 py-6 sm:px-4 sm:py-8">
				<div className="mb-6 sm:mb-8">
					<h1 className="mb-2 font-bold text-2xl text-foreground sm:text-3xl">Shopping Cart</h1>
					<p className="text-muted-foreground text-sm sm:text-base">
						{cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your cart
					</p>
				</div>

				<div className="rounded-lg bg-card shadow-sm">
					<div className="p-4 sm:p-6">
						<div className="space-y-4 sm:space-y-6">
							{cartItems.map(({ node }) => {
								const productData = {
									id: node.merchandise.product.id,
									title: node.merchandise.product.title,
									price: node.merchandise.price.amount,
									quantity: node.quantity,
									currency: node.merchandise.price.currencyCode,
								};

								return (
									<div
										className="flex gap-3 border-border border-b py-4 last:border-b-0 sm:gap-4 sm:py-6"
										key={node.id}
									>
										<div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-muted/50 sm:h-24 sm:w-24">
											{node.merchandise.product.images.edges[0]?.node ? (
												<Image
													alt={node.merchandise.product.images.edges[0].node.altText || node.merchandise.product.title}
													className="object-cover"
													fill
													sizes="(max-width: 640px) 80px, 96px"
													src={node.merchandise.product.images.edges[0].node.url}
												/>
											) : (
												<div className="absolute inset-0 flex items-center justify-center bg-muted">
													<ShoppingCart className="h-6 w-6 text-muted-foreground sm:h-8 sm:w-8" />
												</div>
											)}
										</div>

										<div className="min-w-0 flex-1">
											<div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
												<div className="flex-1">
													<h3 className="mb-0.5 font-medium text-base text-foreground sm:mb-1 sm:text-lg">
														<Link className="hover:text-primary" href={`/products/${node.merchandise.product.handle}`}>
															{node.merchandise.product.title}
														</Link>
													</h3>
													{node.merchandise.title !== "Default Title" && (
														<p className="mb-1 text-muted-foreground text-xs sm:mb-2 sm:text-sm">
															{node.merchandise.title}
														</p>
													)}
												</div>
												<div className="text-left sm:text-right">
													<p className="font-medium text-base text-foreground sm:text-lg">
														{formatPrice(Number.parseFloat(node.cost.totalAmount.amount))}
													</p>
													<p className="text-muted-foreground text-xs sm:text-sm">
														{formatPrice(Number.parseFloat(node.merchandise.price.amount))} each
													</p>
												</div>
											</div>

											<div className="mt-3 flex items-center justify-between sm:mt-4">
												<div className="flex items-center rounded-lg border border-border">
													<button
														type="button"
														aria-label="Decrease quantity"
														className="flex h-8 w-8 items-center justify-center rounded-l-lg text-muted-foreground hover:bg-muted/50 hover:text-muted-foreground disabled:opacity-50 disabled:hover:bg-transparent sm:h-10 sm:w-10"
														disabled={updating === node.id || node.quantity <= 1}
														onClick={() => handleUpdateQuantity(node.id, node.quantity - 1)}
													>
														<Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
													</button>
													<div className="flex h-8 w-12 items-center justify-center border-border border-x font-medium text-xs sm:h-10 sm:w-16 sm:text-sm">
														{updating === node.id ? (
															<Loader2 className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
														) : (
															node.quantity
														)}
													</div>
													<button
														type="button"
														aria-label="Increase quantity"
														className="flex h-8 w-8 items-center justify-center rounded-r-lg text-muted-foreground hover:bg-muted/50 hover:text-muted-foreground disabled:opacity-50 disabled:hover:bg-transparent sm:h-10 sm:w-10"
														disabled={updating === node.id}
														onClick={() => handleUpdateQuantity(node.id, node.quantity + 1)}
													>
														<Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
													</button>
												</div>

												<button
													type="button"
													className="flex items-center gap-1.5 font-medium text-red-600 text-xs hover:text-red-700 sm:gap-2 sm:text-sm"
													disabled={updating === node.id}
													onClick={() => handleRemoveItem(node.id, productData)}
												>
													<Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
													<span className="hidden sm:inline">Remove</span>
												</button>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>

					<div className="rounded-b-lg border-border border-t bg-muted/50 p-4 sm:p-6">
						<div className="mb-3 flex items-center justify-between sm:mb-4">
							<span className="font-medium text-base text-foreground sm:text-lg">Subtotal</span>
							<span className="font-medium text-base text-foreground sm:text-lg">{formatPrice(subtotal)}</span>
						</div>

						<div className="mb-4 flex items-center text-green-600 text-xs sm:mb-6 sm:text-sm dark:text-green-400">
							<Check className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
							{subtotal >= 75 ? "Free shipping included!" : `Add ${formatPrice(75 - subtotal)} more for free shipping`}
						</div>

						{/* Trust signals */}
						<div className="mb-4 grid grid-cols-3 gap-2 text-[10px] text-muted-foreground sm:mb-6 sm:gap-4 sm:text-xs">
							<div className="text-center">
								<div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-green-500/10 sm:h-8 sm:w-8">
									<Check className="h-3 w-3 text-green-600 sm:h-4 sm:w-4 dark:text-green-400" />
								</div>
								<span>Secure Checkout</span>
							</div>
							<div className="text-center">
								<div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/10 sm:h-8 sm:w-8">
									<ArrowLeft className="h-3 w-3 text-blue-600 sm:h-4 sm:w-4 dark:text-blue-400" />
								</div>
								<span>30-Day Returns</span>
							</div>
							<div className="text-center">
								<div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 sm:h-8 sm:w-8">
									<ShoppingCart className="h-3 w-3 text-primary sm:h-4 sm:w-4" />
								</div>
								<span>Expert Support</span>
							</div>
						</div>

						<div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
							<Link className="order-2 sm:order-1 sm:flex-1" href="/products">
								<Button className="h-11 w-full sm:h-auto" variant="outline">
									<ArrowLeft className="mr-2 h-4 w-4" />
									<span className="hidden sm:inline">Continue Shopping</span>
									<span className="sm:hidden">Continue</span>
								</Button>
							</Link>
							<Button
								className="order-1 h-11 sm:order-2 sm:h-auto sm:flex-1"
								disabled={!cart.checkoutUrl || isUpdating}
								onClick={handleCheckout}
							>
								{isUpdating ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Loading...
									</>
								) : (
									<>
										<ShoppingCart className="mr-2 h-4 w-4" />
										<span className="hidden sm:inline">Proceed to Checkout</span>
										<span className="sm:hidden">Checkout</span>
									</>
								)}
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
