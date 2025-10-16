"use client";

import { Check, Heart, Loader2, ShoppingCart, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { useWishlist } from "@/components/providers";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { getProductByHandle as getProduct } from "@/lib/actions/shopify";
import { CONTENT } from "@/lib/config/wadesdesign.config";
import { formatPrice } from "@/lib/utils";

// Debounce helper function
function _debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout;
	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}

export function CartSheet() {
	const { cart, isOpen, openCart, closeCart, isLoading, updateItem, removeItem, addItem } = useCart();
	const { wishlist, removeFromWishlist, addToWishlist } = useWishlist();
	const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
	const [pendingUpdates, setPendingUpdates] = useState<{ [key: string]: number | "" }>({});
	const [updatingItems, setUpdatingItems] = useState<{ [key: string]: boolean }>({});
	const touchStartX = useRef<number>(0);
	const _touchEndX = useRef<number>(0);
	const sheetRef = useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [dragOffset, setDragOffset] = useState(0);
	const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
	const [_isPending, startTransition] = useTransition();
	const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

	// Initialize quantities from cart
	useEffect(() => {
		if (cart?.lines?.edges) {
			const initialQuantities = cart.lines.edges.reduce(
				(acc, { node }) => {
					acc[node.id] = node.quantity;
					return acc;
				},
				{} as { [key: string]: number }
			);
			setQuantities(initialQuantities);
			setPendingUpdates({});
		}
	}, [cart?.lines?.edges]);

	// Touch event handlers
	const handleTouchStart = (e: React.TouchEvent) => {
		touchStartX.current = e.touches[0].clientX;
		setIsDragging(true);
		setDragOffset(0);
	};

	const handleTouchMove = (e: React.TouchEvent) => {
		if (!isDragging) {
			return;
		}
		const currentX = e.touches[0].clientX;
		const diff = currentX - touchStartX.current;
		// Only allow dragging to the right
		if (diff < 0) {
			return;
		}
		setDragOffset(Math.min(diff, window.innerWidth));
	};

	const handleTouchEnd = () => {
		setIsDragging(false);
		// If dragged more than 100px to the right, close the sheet
		if (dragOffset > 100) {
			closeCart();
		}
		setDragOffset(0);
	};

	// Register keyboard shortcut
	useKeyboardShortcut("shift+o", () => {
		if (isOpen) {
			closeCart();
		} else {
			openCart();
		}
	});

	// Handle quantity change
	const handleQuantityChange = useCallback((lineId: string, value: string) => {
		// Allow empty string or numbers
		if (value === "" || !Number.isNaN(Number.parseInt(value, 10))) {
			setPendingUpdates((prev) => ({
				...prev,
				[lineId]: value === "" ? "" : Number.parseInt(value, 10),
			}));
		}
	}, []);

	// Handle update quantity
	const handleUpdateQuantity = useCallback(
		async (lineId: string, quantity: number | "") => {
			// Don't allow updating with empty value or zero
			if (quantity === "" || quantity === 0) {
				setPendingUpdates((prev) => {
					const newUpdates = { ...prev };
					delete newUpdates[lineId];
					return newUpdates;
				});
				return;
			}

			if (quantity === quantities[lineId]) {
				setPendingUpdates((prev) => {
					const newUpdates = { ...prev };
					delete newUpdates[lineId];
					return newUpdates;
				});
				return;
			}

			setUpdatingItems((prev) => ({ ...prev, [lineId]: true }));
			try {
				await updateItem(lineId, quantity);
				setPendingUpdates((prev) => {
					const newUpdates = { ...prev };
					delete newUpdates[lineId];
					return newUpdates;
				});
				setQuantities((prev) => ({
					...prev,
					[lineId]: quantity,
				}));
			} catch (_error) {
				// Reset to previous quantity on error
				setPendingUpdates((prev) => {
					const newUpdates = { ...prev };
					delete newUpdates[lineId];
					return newUpdates;
				});
			} finally {
				setUpdatingItems((prev) => ({ ...prev, [lineId]: false }));
			}
		},
		[updateItem, quantities]
	);

	const handleRemoveItem = useCallback(
		async (lineId: string) => {
			try {
				await removeItem(lineId);
			} catch (_error) {}
		},
		[removeItem]
	);

	// Memoize cart calculations
	const cartData = useMemo(
		() => ({
			itemCount: cart?.totalQuantity ?? 0,
			cartTotal: cart?.cost?.subtotalAmount?.amount ? Number.parseFloat(cart.cost.subtotalAmount.amount) : 0,
			items: cart?.lines?.edges ?? [],
			checkoutUrl: cart?.checkoutUrl,
		}),
		[cart]
	);

	// Fetch wishlist products when the cart opens
	useEffect(() => {
		if (isOpen && wishlist.length > 0) {
			startTransition(async () => {
				try {
					const products = await Promise.all(
						wishlist.map(async (handle) => {
							const product = await getProduct(handle);
							return product;
						})
					);
					setWishlistProducts(products.filter(Boolean));
				} catch (_error) {
					toast.error("Failed to load wishlist items");
				}
			});
		}
	}, [isOpen, wishlist]);

	const handleAddToCart = useCallback(
		async (variantId: string, productHandle: string) => {
			if (!cart?.id) {
				toast.error("Cart not initialized");
				return;
			}

			// Set loading state for this specific button
			setLoadingStates((prev) => ({ ...prev, [productHandle]: true }));

			try {
				await addItem({
					merchandiseId: variantId,
					quantity: 1,
				});

				// Remove from wishlist and update UI
				removeFromWishlist(productHandle);
				setWishlistProducts((prev) => prev.filter((p) => p.handle !== productHandle));
				toast.success("Added to cart");
				// Cart will be opened automatically by the cart provider
			} catch (_error) {
				toast.error("Failed to add to cart");
			} finally {
				// Clear loading state
				setLoadingStates((prev) => ({ ...prev, [productHandle]: false }));
			}
		},
		[cart?.id, removeFromWishlist, addItem]
	);

	const handleMoveToWishlist = useCallback(
		async (node: any) => {
			try {
				// Get the product handle from the merchandise
				const productHandle = node.merchandise.product.handle;

				// Only proceed if we have a valid handle
				if (!productHandle) {
					toast.error("Could not save item for later");
					return;
				}

				// Add to wishlist first
				addToWishlist(productHandle);

				// Then remove from cart
				await removeItem(node.id);

				// Update wishlist products
				setWishlistProducts((prev) => {
					const newProduct = {
						...node.merchandise.product,
						variants: {
							nodes: [node.merchandise],
						},
					};
					return [...prev, newProduct];
				});

				toast.success("Saved for later");
			} catch (_error) {
				toast.error("Failed to save item for later");
			}
		},
		[addToWishlist, removeItem]
	);

	// Early return for closed state to prevent unnecessary renders
	if (!isOpen) {
		return null;
	}

	return (
		<Sheet
			onOpenChange={(open) => {
				if (open) {
					openCart();
				} else {
					closeCart();
				}
			}}
			open={isOpen}
		>
			<SheetContent
				className="data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right fixed inset-y-0 right-0 z-50 flex h-full w-full touch-pan-y flex-col gap-0 border-l bg-background p-0 shadow-2xl transition-all ease-in-out data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:duration-300 data-[state=open]:duration-500 sm:max-w-md"
				onTouchEnd={handleTouchEnd}
				onTouchMove={handleTouchMove}
				onTouchStart={handleTouchStart}
				ref={sheetRef}
				style={{
					transform: `translateX(${dragOffset}px)`,
					transition: isDragging ? "none" : "transform 0.3s ease-out",
				}}
			>
				<div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm">
					<SheetHeader className="flex flex-col space-y-0 p-6 text-left">
						<div className="flex items-start justify-between">
							<div>
								<SheetTitle className="flex items-center gap-2.5 font-semibold text-foreground text-xl">
									<div className="rounded-full bg-primary/10 p-1.5">
										<ShoppingCart className="h-4.5 w-4.5 text-primary" />
									</div>
									Cart
									{cartData.itemCount > 0 && (
										<span className="ml-0.5 rounded-full bg-primary px-2 py-0.5 font-medium text-primary-foreground text-xs">
											{cartData.itemCount}
										</span>
									)}
								</SheetTitle>
								<SheetDescription className="mt-1.5 text-muted-foreground text-xs">
									{cartData.itemCount === 0
										? "Your cart is empty"
										: `${cartData.itemCount} item${cartData.itemCount === 1 ? "" : "s"} ready to checkout`}
								</SheetDescription>
							</div>
							<button
								aria-label="Close cart"
								className="rounded-lg p-2 text-muted-foreground transition-all duration-200 hover:bg-muted/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
								onClick={closeCart}
							>
								<X className="h-5 w-5" />
								<span className="sr-only">Close</span>
							</button>
						</div>
					</SheetHeader>
				</div>

				{isLoading && (
					<div className="flex flex-1 items-center justify-center py-12">
						<div className="flex flex-col items-center gap-3">
							<Loader2 className="h-8 w-8 animate-spin text-primary" />
							<p className="text-muted-foreground text-sm">Loading your cart...</p>
						</div>
					</div>
				)}

				{!isLoading && cartData.items.length === 0 && (
					<div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
						<div className="mb-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 p-8">
							<ShoppingCart className="h-12 w-12 text-primary/60" strokeWidth={1.5} />
						</div>
						<h3 className="mb-2 font-semibold text-foreground text-lg">{CONTENT.cart.empty.title}</h3>
						<p className="max-w-xs text-muted-foreground text-sm leading-relaxed">{CONTENT.cart.empty.message}</p>
					</div>
				)}

				<div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted flex-1 overflow-y-auto">
					<div className="px-6">
						{!isLoading && cartData.items.length > 0 && (
							<div className="space-y-3 py-6">
								{cartData.items.map(({ node }) => (
									<div
										className="group relative flex gap-4 rounded-xl bg-muted/30 p-4 transition-all duration-200 hover:bg-muted/50 hover:shadow-sm"
										key={node.id}
									>
										<div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-background ring-1 ring-border/50">
											{node.merchandise.product.images.edges[0]?.node ? (
												<Image
													alt={node.merchandise.product.images.edges[0].node.altText || node.merchandise.product.title}
													className="object-cover"
													fill
													sizes="96px"
													src={node.merchandise.product.images.edges[0].node.url}
												/>
											) : (
												<div className="absolute inset-0 flex items-center justify-center">
													<ShoppingCart className="h-8 w-8 text-muted-foreground/30" strokeWidth={1.5} />
												</div>
											)}
										</div>

										<div className="min-w-0 flex-1 space-y-3">
											<div>
												<div className="flex items-start justify-between gap-3">
													<h3 className="line-clamp-2 font-medium text-foreground text-sm leading-tight">
														{node.merchandise.product.title}
													</h3>
													<p className="whitespace-nowrap font-semibold text-base text-foreground">
														{formatPrice(Number.parseFloat(node.cost.totalAmount.amount))}
													</p>
												</div>
												{node.merchandise.title !== "Default Title" && (
													<p className="mt-1 text-muted-foreground text-xs">{node.merchandise.title}</p>
												)}
											</div>

											<div className="flex items-center justify-between">
												<div className="flex items-center rounded-lg bg-background ring-1 ring-border/50">
													<button
														aria-label="Decrease quantity"
														className="flex h-8 w-8 items-center justify-center rounded-l-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent"
														disabled={updatingItems[node.id] || quantities[node.id] <= 1}
														onClick={() => handleUpdateQuantity(node.id, Math.max(1, quantities[node.id] - 1))}
													>
														<span className="font-medium text-base">−</span>
													</button>
													<input
														aria-label="Quantity"
														className="h-8 w-12 border-border/50 border-x bg-background text-center font-medium text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
														inputMode="numeric"
														onBlur={() => {
															if (pendingUpdates[node.id] !== undefined && pendingUpdates[node.id] !== "") {
																handleUpdateQuantity(node.id, Number(pendingUpdates[node.id]));
															}
														}}
														onChange={(e) => handleQuantityChange(node.id, e.target.value)}
														pattern="[0-9]*"
														type="text"
														value={
															pendingUpdates[node.id] !== undefined
																? pendingUpdates[node.id]
																: quantities[node.id] || ""
														}
													/>
													<button
														aria-label="Increase quantity"
														className="flex h-8 w-8 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent"
														disabled={updatingItems[node.id]}
														onClick={() => handleUpdateQuantity(node.id, quantities[node.id] + 1)}
													>
														<span className="font-medium text-base">+</span>
													</button>
												</div>

												<div className="flex items-center gap-1">
													<button
														aria-label="Save for later"
														className="rounded-lg p-2 text-muted-foreground transition-all duration-200 hover:bg-background hover:text-primary hover:ring-1 hover:ring-primary/20"
														onClick={() => handleMoveToWishlist(node)}
													>
														<Heart className="h-4 w-4" strokeWidth={2} />
													</button>
													<button
														aria-label="Remove item"
														className="rounded-lg p-2 text-muted-foreground transition-all duration-200 hover:bg-background hover:text-red-500 hover:ring-1 hover:ring-red-500/20 disabled:opacity-40"
														disabled={updatingItems[node.id]}
														onClick={() => handleRemoveItem(node.id)}
													>
														<Trash2 className="h-4 w-4" strokeWidth={2} />
													</button>
												</div>
											</div>
										</div>

										{updatingItems[node.id] && (
											<div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/90 backdrop-blur-sm">
												<Loader2 className="h-6 w-6 animate-spin text-primary" strokeWidth={2.5} />
											</div>
										)}
									</div>
								))}
							</div>
						)}

						{wishlistProducts.length > 0 && (
							<div className={cartData.items.length > 0 ? "border-border/50 border-t pt-6 pb-6" : "py-6"}>
								<div className="mb-4 flex items-center gap-2">
									<div className="rounded-lg bg-primary/10 p-1.5">
										<Heart className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
									</div>
									<h3 className="font-medium text-foreground text-sm">Saved for Later</h3>
									<span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-muted-foreground text-xs">
										{wishlistProducts.length}
									</span>
								</div>
								<div className="space-y-3">
									{wishlistProducts.map((product) => (
										<div
											className="flex items-center gap-3 rounded-xl bg-muted/30 p-3 transition-all duration-200 hover:bg-muted/50"
											key={product.handle}
										>
											<div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-background ring-1 ring-border/50">
												{product.featuredImage?.url ? (
													<Image
														alt={product.title}
														className="object-cover"
														fill
														sizes="56px"
														src={product.featuredImage.url}
													/>
												) : (
													<div className="absolute inset-0 flex items-center justify-center">
														<ShoppingCart className="h-6 w-6 text-muted-foreground/30" strokeWidth={1.5} />
													</div>
												)}
											</div>

											<div className="min-w-0 flex-1">
												<h4 className="line-clamp-1 font-medium text-foreground text-sm leading-tight">
													{product.title}
												</h4>
												<p className="mt-0.5 font-medium text-muted-foreground text-xs">
													{product.priceRange?.minVariantPrice?.amount
														? formatPrice(Number.parseFloat(product.priceRange.minVariantPrice.amount))
														: "Price unavailable"}
												</p>
											</div>

											<Button
												className="h-8 shrink-0 rounded-lg bg-primary px-3 font-medium text-primary-foreground text-xs shadow-sm transition-all hover:bg-primary/90 hover:shadow disabled:opacity-50"
												disabled={loadingStates[product.handle] || !product.variants?.nodes?.[0]?.availableForSale}
												onClick={() => handleAddToCart(product.variants.nodes[0].id, product.handle)}
												size="sm"
											>
												{loadingStates[product.handle] ? (
													<Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.5} />
												) : product.variants?.nodes?.[0]?.availableForSale ? (
													<ShoppingCart className="h-3.5 w-3.5" strokeWidth={2} />
												) : (
													<span>N/A</span>
												)}
											</Button>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>

				<div className="sticky bottom-0 space-y-4 border-t bg-background/95 p-6 backdrop-blur-sm">
					<div className="space-y-3">
						<div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
							<div>
								<p className="text-muted-foreground text-xs uppercase tracking-wide">Subtotal</p>
								<p className="mt-0.5 font-semibold text-2xl text-foreground">{formatPrice(cartData.cartTotal)}</p>
							</div>
							<div className="flex flex-col items-end">
								<div className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-green-600 dark:text-green-500">
									<Check className="h-3.5 w-3.5" strokeWidth={2.5} />
									<span className="font-medium text-xs">Free Shipping</span>
								</div>
								<p className="mt-1 text-muted-foreground text-xs">Tax calculated at checkout</p>
							</div>
						</div>
					</div>

					<Button
						className="h-12 w-full rounded-xl bg-primary font-semibold text-base text-primary-foreground shadow-lg transition-all duration-200 hover:bg-primary/90 hover:shadow-xl disabled:opacity-50"
						disabled={!cartData.checkoutUrl || isLoading || cartData.items.length === 0}
						onClick={() => cartData.checkoutUrl && (window.location.href = cartData.checkoutUrl)}
					>
						{isLoading ? (
							<div className="flex items-center gap-2">
								<Loader2 className="h-5 w-5 animate-spin" strokeWidth={2.5} />
								<span>Processing...</span>
							</div>
						) : (
							<>
								<ShoppingCart className="mr-2 h-5 w-5" strokeWidth={2} />
								<span>{CONTENT.cart.summary.checkoutButton}</span>
							</>
						)}
					</Button>
				</div>
			</SheetContent>
		</Sheet>
	);
}
