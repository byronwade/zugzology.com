"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/providers/cart-provider";
import { Loader2, ShoppingCart, Trash2, X, Check, Heart } from "lucide-react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { useEffect, useCallback, useMemo, useState, useRef, useTransition } from "react";
import { useKeyboardShortcut } from "@/lib/hooks/use-keyboard-shortcut";
import { useWishlist } from "@/lib/providers/wishlist-provider";
import { getProduct, addToCart } from "@/lib/actions/shopify";
import { toast } from "sonner";

// Debounce helper function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
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
	const touchEndX = useRef<number>(0);
	const sheetRef = useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [dragOffset, setDragOffset] = useState(0);
	const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
	const [isPending, startTransition] = useTransition();
	const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

	// Initialize quantities from cart
	useEffect(() => {
		if (cart?.lines?.edges) {
			const initialQuantities = cart.lines.edges.reduce((acc, { node }) => {
				acc[node.id] = node.quantity;
				return acc;
			}, {} as { [key: string]: number });
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
		if (!isDragging) return;
		const currentX = e.touches[0].clientX;
		const diff = currentX - touchStartX.current;
		// Only allow dragging to the right
		if (diff < 0) return;
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
		if (value === "" || !isNaN(parseInt(value))) {
			setPendingUpdates((prev) => ({
				...prev,
				[lineId]: value === "" ? "" : parseInt(value),
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
			} catch (error) {
				console.error("Update quantity error:", error);
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
			} catch (error) {
				console.error("Remove item error:", error);
			}
		},
		[removeItem]
	);

	// Memoize cart calculations
	const cartData = useMemo(() => {
		return {
			itemCount: cart?.totalQuantity ?? 0,
			cartTotal: cart?.cost?.subtotalAmount?.amount ? parseFloat(cart.cost.subtotalAmount.amount) : 0,
			items: cart?.lines?.edges ?? [],
			checkoutUrl: cart?.checkoutUrl,
		};
	}, [cart]);

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
				} catch (error) {
					console.error("Error fetching wishlist products:", error);
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
			} catch (error) {
				console.error("Error adding to cart:", error);
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
			} catch (error) {
				console.error("Error moving item to wishlist:", error);
				toast.error("Failed to save item for later");
			}
		},
		[addToWishlist, removeItem]
	);

	// Early return for closed state to prevent unnecessary renders
	if (!isOpen) return null;

	return (
		<Sheet
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) closeCart();
			}}
		>
			<SheetContent
				ref={sheetRef}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
				style={{
					transform: `translateX(${dragOffset}px)`,
					transition: isDragging ? "none" : "transform 0.3s ease-out",
				}}
				className="fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out inset-y-0 right-0 h-full border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right flex flex-col w-full sm:max-w-lg touch-pan-y"
			>
				<SheetHeader className="flex flex-col space-y-2.5 text-center sm:text-left pb-6 border-b">
					<SheetTitle className="text-lg font-semibold text-foreground flex items-center gap-2.5">
						<ShoppingCart className="h-5 w-5" />
						Shopping Cart {cartData.itemCount > 0 ? `(${cartData.itemCount})` : ""}
					</SheetTitle>
					<SheetDescription className="text-sm text-muted-foreground">View and manage items in your shopping cart</SheetDescription>
				</SheetHeader>

				{isLoading && (
					<div className="flex-1 flex items-center justify-center py-8">
						<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					</div>
				)}

				{!isLoading && cartData.items.length === 0 && (
					<div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
						<ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
						<p className="text-base text-muted-foreground mb-2">Your cart is empty</p>
						<p className="text-sm text-muted-foreground/60">Add items to your cart to continue shopping</p>
					</div>
				)}

				<div className="flex-1 overflow-y-auto -mx-6 px-6">
					{cartData.items.map(({ node }) => (
						<div key={node.id} className="flex gap-4 py-4 border-b last:border-b-0 group">
							<div className="relative w-20 h-20 flex-shrink-0 bg-accent/50 rounded-md overflow-hidden">
								{node.merchandise.product.images.edges[0]?.node ? (
									<Image src={node.merchandise.product.images.edges[0].node.url} alt={node.merchandise.product.images.edges[0].node.altText || node.merchandise.product.title} fill className="object-cover rounded-md transition-transform group-hover:scale-105" sizes="80px" priority />
								) : (
									<div className="w-full h-full bg-accent/50 rounded-md flex items-center justify-center">
										<ShoppingCart className="h-8 w-8 text-muted-foreground" />
									</div>
								)}
							</div>

							<div className="flex-1 min-w-0">
								<div className="flex items-start justify-between gap-2">
									<div>
										<h3 className="font-medium group-hover:text-primary transition-colors">{node.merchandise.product.title}</h3>
										{node.merchandise.title !== "Default Title" && <p className="text-sm text-muted-foreground mt-0.5">{node.merchandise.title}</p>}
										<p className="mt-1.5 font-medium">{formatPrice(parseFloat(node.cost.totalAmount.amount))}</p>
									</div>
									<Button variant="ghost" size="icon" onClick={() => handleRemoveItem(node.id)} disabled={isLoading} className="hover:bg-destructive/10 hover:text-destructive h-8 w-8 -mt-1 -mr-1">
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>

								<div className="flex items-center gap-4 mt-3">
									<div className="flex items-center gap-2">
										<input
											type="number"
											inputMode="numeric"
											pattern="[0-9]*"
											min="1"
											autoFocus={false}
											tabIndex={-1}
											value={pendingUpdates[node.id] ?? quantities[node.id] ?? node.quantity}
											onChange={(e) => handleQuantityChange(node.id, e.target.value)}
											className="w-16 h-8 rounded-md border bg-background px-2 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
											disabled={isLoading || updatingItems[node.id]}
										/>
										{pendingUpdates[node.id] !== undefined && (
											<Button size="sm" variant="outline" onClick={() => handleUpdateQuantity(node.id, pendingUpdates[node.id])} disabled={updatingItems[node.id] || pendingUpdates[node.id] === "" || pendingUpdates[node.id] === 0} className="h-8 px-2 bg-background">
												{updatingItems[node.id] ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
											</Button>
										)}
									</div>
									<button onClick={() => handleMoveToWishlist(node)} disabled={isLoading} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
										<Heart className="h-3.5 w-3.5" />
										Save for later
									</button>
								</div>
							</div>
						</div>
					))}

					{!isLoading && cartData.items.length > 0 && wishlistProducts.length > 0 && (
						<div className="mt-8 pt-6 border-t">
							<div className="bg-accent/50 rounded-lg p-4 mb-6">
								<h3 className="font-medium text-base flex items-center gap-2">
									<Heart className="w-4 h-4" />
									From Your Wishlist
								</h3>
								<p className="text-sm text-muted-foreground mt-1">Add these items from your wishlist to complete your purchase</p>
							</div>

							<div className="space-y-4">
								{wishlistProducts.map((product) => (
									<div key={product.id} className="flex gap-4 py-4 border-b last:border-b-0 group">
										<div className="relative w-20 h-20 flex-shrink-0 bg-accent/50 rounded-md overflow-hidden">
											{product.images?.nodes?.[0] ? (
												<Image src={product.images.nodes[0].url} alt={product.images.nodes[0].altText || product.title} fill className="object-cover rounded-md transition-transform group-hover:scale-105" sizes="80px" />
											) : (
												<div className="w-full h-full bg-accent/50 rounded-md flex items-center justify-center">
													<ShoppingCart className="h-8 w-8 text-muted-foreground" />
												</div>
											)}
										</div>
										<div className="flex-1 min-w-0">
											<div className="flex items-start justify-between gap-2">
												<div>
													<h3 className="font-medium group-hover:text-primary transition-colors">{product.title}</h3>
													{product.variants?.nodes?.[0]?.title !== "Default Title" && <p className="text-sm text-muted-foreground mt-0.5">{product.variants.nodes[0].title}</p>}
													<p className="mt-1.5 font-medium">{formatPrice(parseFloat(product.variants?.nodes?.[0]?.price?.amount || product.priceRange?.minVariantPrice?.amount))}</p>
												</div>
											</div>
											<Button
												variant="outline"
												size="sm"
												className="mt-3 bg-background"
												onClick={() => {
													const variant = product.variants?.nodes?.[0];
													if (!variant?.id) {
														toast.error("Could not add to cart: product variant not available");
														return;
													}
													handleAddToCart(variant.id, product.handle);
												}}
												disabled={!product.variants?.nodes?.[0]?.availableForSale || loadingStates[product.handle]}
											>
												{loadingStates[product.handle] ? (
													<div className="flex items-center gap-2">
														<Loader2 className="h-4 w-4 animate-spin" />
														Adding...
													</div>
												) : !product.variants?.nodes?.[0]?.availableForSale ? (
													"Out of Stock"
												) : (
													<>
														<ShoppingCart className="h-4 w-4 mr-2" />
														Add to Cart
													</>
												)}
											</Button>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				<div className="border-t pt-6 space-y-4">
					<div className="flex justify-between items-baseline">
						<span className="text-base font-medium">Subtotal</span>
						<span className="text-lg font-semibold">{formatPrice(cartData.cartTotal)}</span>
					</div>
					<Button className="w-full h-11 text-base font-medium" disabled={!cartData.checkoutUrl || isLoading} onClick={() => cartData.checkoutUrl && (window.location.href = cartData.checkoutUrl)}>
						{isLoading ? (
							<div className="flex items-center gap-2">
								<Loader2 className="h-4 w-4 animate-spin" />
								Loading...
							</div>
						) : (
							<>
								<ShoppingCart className="h-4 w-4 mr-2" />
								Proceed to Checkout
							</>
						)}
					</Button>
					<p className="text-sm text-center text-muted-foreground">Shipping and taxes calculated at checkout</p>
				</div>

				<SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
					<X className="h-4 w-4" />
					<span className="sr-only">Close</span>
				</SheetClose>
			</SheetContent>
		</Sheet>
	);
}
