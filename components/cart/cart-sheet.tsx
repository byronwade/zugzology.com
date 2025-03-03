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
				// Cart will be opened automatically by the cart provider
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
				else openCart();
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
				className="fixed z-50 gap-4 bg-white p-0 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out inset-y-0 right-0 h-full border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right flex flex-col w-full sm:max-w-lg touch-pan-y"
			>
				<div className="sticky top-0 z-10 bg-white">
					<SheetHeader className="flex flex-col space-y-1 text-left p-4 border-b border-gray-200">
						<div className="flex justify-between items-center">
							<SheetTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
								<ShoppingCart className="h-5 w-5 text-purple-600" />
								Shopping Cart {cartData.itemCount > 0 ? `(${cartData.itemCount})` : ""}
							</SheetTitle>
							<button
								onClick={closeCart}
								className="rounded-full p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
								aria-label="Close"
							>
								<X className="h-5 w-5" />
								<span className="sr-only">Close</span>
							</button>
						</div>
						<SheetDescription className="text-sm text-gray-500">
							View and manage items in your shopping cart
						</SheetDescription>
					</SheetHeader>
				</div>

				{isLoading && (
					<div className="flex-1 flex items-center justify-center py-8">
						<Loader2 className="h-8 w-8 animate-spin text-purple-600" />
					</div>
				)}

				{!isLoading && cartData.items.length === 0 && (
					<div className="flex-1 flex flex-col items-center justify-center py-8 text-center px-4">
						<div className="bg-purple-50 rounded-full p-4 mb-4">
							<ShoppingCart className="h-10 w-10 text-purple-600" />
						</div>
						<p className="text-base font-medium text-gray-900 mb-1">Your cart is empty</p>
						<p className="text-sm text-gray-500 max-w-xs">Add items to your cart to continue shopping</p>
					</div>
				)}

				<div className="flex-1 overflow-y-auto px-4">
					{!isLoading && cartData.items.length > 0 && (
						<div className="py-4 space-y-4">
							{cartData.items.map(({ node }) => (
								<div
									key={node.id}
									className="flex gap-4 relative group p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
								>
									<div className="relative h-20 w-20 rounded-md overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
										{node.merchandise.product.images.edges[0]?.node ? (
											<Image
												src={node.merchandise.product.images.edges[0].node.url}
												alt={node.merchandise.product.images.edges[0].node.altText || node.merchandise.product.title}
												fill
												sizes="80px"
												className="object-cover"
											/>
										) : (
											<div className="absolute inset-0 flex items-center justify-center bg-gray-100">
												<ShoppingCart className="h-6 w-6 text-gray-400" />
											</div>
										)}
									</div>

									<div className="flex-1 min-w-0">
										<div className="flex justify-between gap-2">
											<h3 className="text-sm font-medium text-gray-900 line-clamp-2">
												{node.merchandise.product.title}
											</h3>
											<p className="text-sm font-medium text-gray-900 whitespace-nowrap">
												{formatPrice(parseFloat(node.cost.totalAmount.amount))}
											</p>
										</div>

										{node.merchandise.title !== "Default Title" && (
											<p className="text-xs text-gray-500 mt-0.5">{node.merchandise.title}</p>
										)}

										<div className="flex items-center justify-between mt-2">
											<div className="flex items-center border border-gray-200 rounded-md shadow-sm">
												<button
													onClick={() => handleUpdateQuantity(node.id, Math.max(1, quantities[node.id] - 1))}
													disabled={updatingItems[node.id] || quantities[node.id] <= 1}
													className="h-7 w-7 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent"
													aria-label="Decrease quantity"
												>
													<span className="text-lg font-medium">−</span>
												</button>
												<input
													type="text"
													inputMode="numeric"
													pattern="[0-9]*"
													value={
														pendingUpdates[node.id] !== undefined ? pendingUpdates[node.id] : quantities[node.id] || ""
													}
													onChange={(e) => handleQuantityChange(node.id, e.target.value)}
													onBlur={() => {
														if (pendingUpdates[node.id] !== undefined && pendingUpdates[node.id] !== "") {
															handleUpdateQuantity(node.id, Number(pendingUpdates[node.id]));
														}
													}}
													className="w-12 h-7 text-center text-sm border-x border-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
													aria-label="Quantity"
												/>
												<button
													onClick={() => handleUpdateQuantity(node.id, quantities[node.id] + 1)}
													disabled={updatingItems[node.id]}
													className="h-7 w-7 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent"
													aria-label="Increase quantity"
												>
													<span className="text-lg font-medium">+</span>
												</button>
											</div>

											<div className="flex items-center gap-2">
												<button
													onClick={() => handleMoveToWishlist(node)}
													className="text-gray-400 hover:text-purple-600 transition-colors p-1.5 rounded-full hover:bg-gray-100"
													aria-label="Save for later"
												>
													<Heart className="h-4 w-4" />
												</button>
												<button
													onClick={() => handleRemoveItem(node.id)}
													disabled={updatingItems[node.id]}
													className="text-gray-400 hover:text-red-600 transition-colors p-1.5 rounded-full hover:bg-gray-100"
													aria-label="Remove item"
												>
													<Trash2 className="h-4 w-4" />
												</button>
											</div>
										</div>
									</div>

									{updatingItems[node.id] && (
										<div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
											<Loader2 className="h-5 w-5 animate-spin text-purple-600" />
										</div>
									)}
								</div>
							))}
						</div>
					)}

					{wishlistProducts.length > 0 && (
						<div className="border-t border-gray-200 pt-6 pb-4">
							<h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
								<Heart className="h-4 w-4 mr-2 text-purple-600" />
								Saved for later
							</h3>
							<div className="space-y-4">
								{wishlistProducts.map((product) => (
									<div
										key={product.handle}
										className="flex gap-3 items-center p-2 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
									>
										<div className="relative h-16 w-16 rounded-md overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
											{product.featuredImage?.url ? (
												<Image
													src={product.featuredImage.url}
													alt={product.title}
													fill
													sizes="64px"
													className="object-cover"
												/>
											) : (
												<div className="absolute inset-0 flex items-center justify-center bg-gray-100">
													<ShoppingCart className="h-5 w-5 text-gray-400" />
												</div>
											)}
										</div>

										<div className="flex-1 min-w-0">
											<h4 className="text-sm font-medium text-gray-900 line-clamp-1">{product.title}</h4>
											<p className="text-sm text-gray-500 mt-0.5">
												{product.priceRange?.minVariantPrice?.amount
													? formatPrice(parseFloat(product.priceRange.minVariantPrice.amount))
													: "Price unavailable"}
											</p>
										</div>

										<Button
											onClick={() => handleAddToCart(product.variants.nodes[0].id, product.handle)}
											disabled={loadingStates[product.handle] || !product.variants?.nodes?.[0]?.availableForSale}
											className="h-8 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-xs font-medium"
											size="sm"
										>
											{loadingStates[product.handle] ? (
												<div className="flex items-center gap-1">
													<Loader2 className="h-3 w-3 animate-spin" />
													Adding...
												</div>
											) : !product.variants?.nodes?.[0]?.availableForSale ? (
												"Out of Stock"
											) : (
												<>
													<ShoppingCart className="h-3 w-3 mr-1" />
													Add to Cart
												</>
											)}
										</Button>
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				<div className="border-t border-gray-200 p-4 space-y-4 bg-gray-50">
					<div className="space-y-2">
						<div className="flex justify-between items-baseline">
							<span className="text-base font-medium text-gray-900">Total</span>
							<span className="text-base font-medium text-gray-900">{formatPrice(cartData.cartTotal)}</span>
						</div>
						<div className="flex items-center text-sm text-green-600">
							<Check className="h-4 w-4 mr-1.5" />
							Free shipping on all orders
						</div>
					</div>

					<Button
						className="w-full h-10 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium"
						disabled={!cartData.checkoutUrl || isLoading}
						onClick={() => cartData.checkoutUrl && (window.location.href = cartData.checkoutUrl)}
					>
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
				</div>
			</SheetContent>
		</Sheet>
	);
}
