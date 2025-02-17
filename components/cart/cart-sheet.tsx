"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/providers/cart-provider";
import { Loader2, ShoppingCart, Trash2, X, Check } from "lucide-react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { useEffect, useCallback, useMemo, useState, useRef } from "react";
import { useKeyboardShortcut } from "@/lib/hooks/use-keyboard-shortcut";

// Debounce helper function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout;
	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}

export function CartSheet() {
	const { cart, isOpen, openCart, closeCart, isLoading, updateItem, removeItem } = useCart();
	const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
	const [pendingUpdates, setPendingUpdates] = useState<{ [key: string]: number | "" }>({});
	const [updatingItems, setUpdatingItems] = useState<{ [key: string]: boolean }>({});
	const touchStartX = useRef<number>(0);
	const touchEndX = useRef<number>(0);
	const sheetRef = useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [dragOffset, setDragOffset] = useState(0);

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
				<SheetHeader className="flex flex-col space-y-2 text-center sm:text-left">
					<SheetTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
						<ShoppingCart className="h-5 w-5" />
						Shopping Cart {cartData.itemCount > 0 ? `(${cartData.itemCount})` : ""}
					</SheetTitle>
					<SheetDescription>View and manage items in your shopping cart</SheetDescription>
				</SheetHeader>

				{isLoading && (
					<div className="flex items-center justify-center py-8">
						<Loader2 className="h-8 w-8 animate-spin" />
					</div>
				)}

				{!isLoading && cartData.items.length === 0 && (
					<div className="flex flex-col items-center justify-center py-8 text-center">
						<ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
						<p className="text-muted-foreground">Your cart is empty</p>
					</div>
				)}

				<div className="flex-1 overflow-y-auto py-4">
					{cartData.items.map(({ node }) => {
						const productImage = node.merchandise.product.images.edges[0]?.node;
						const isPendingUpdate = pendingUpdates[node.id] !== undefined;
						const isUpdating = updatingItems[node.id];
						const currentQuantity = pendingUpdates[node.id] ?? quantities[node.id] ?? node.quantity;

						return (
							<div key={node.id} className="flex gap-4 py-4 border-b">
								{productImage ? (
									<div className="relative w-20 h-20">
										<Image src={productImage.url} alt={productImage.altText || node.merchandise.product.title} fill className="object-cover rounded-md" sizes="80px" priority />
									</div>
								) : (
									<div className="w-20 h-20 bg-neutral-100 rounded-md flex items-center justify-center">
										<ShoppingCart className="h-8 w-8 text-neutral-400" />
									</div>
								)}
								<div className="flex-1">
									<h3 className="font-medium">{node.merchandise.product.title}</h3>
									<p className="text-sm text-muted-foreground">{node.merchandise.title !== "Default Title" && node.merchandise.title}</p>
									<div className="flex items-center gap-2 mt-2">
										<div className="flex items-center gap-2">
											<input type="number" inputMode="numeric" pattern="[0-9]*" min="1" autoFocus={false} tabIndex={-1} value={currentQuantity === "" ? "" : currentQuantity} onChange={(e) => handleQuantityChange(node.id, e.target.value)} className="w-16 h-8 rounded-md border px-2 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" disabled={isLoading || isUpdating} />
											{isPendingUpdate && (
												<Button size="sm" variant="outline" onClick={() => handleUpdateQuantity(node.id, pendingUpdates[node.id])} disabled={isUpdating || pendingUpdates[node.id] === "" || pendingUpdates[node.id] === 0} className="h-8 px-2">
													{isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
												</Button>
											)}
										</div>
										<Button variant="ghost" size="icon" onClick={() => handleRemoveItem(node.id)} disabled={isLoading} className="hover:bg-accent hover:text-accent-foreground h-9 w-9">
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
									<p className="mt-2 font-medium">{formatPrice(parseFloat(node.cost.totalAmount.amount))}</p>
								</div>
							</div>
						);
					})}
				</div>

				<div className="border-t pt-4">
					<div className="flex justify-between mb-4">
						<span className="font-medium">Subtotal</span>
						<span className="font-medium">{formatPrice(cartData.cartTotal)}</span>
					</div>
					<Button
						className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 rounded-md px-8 w-full"
						disabled={!cartData.checkoutUrl || isLoading}
						onClick={() => cartData.checkoutUrl && (window.location.href = cartData.checkoutUrl)}
					>
						{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Proceed to Checkout"}
					</Button>
					<p className="text-sm text-center text-muted-foreground mt-4">Shipping and taxes calculated at checkout</p>
				</div>

				<SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
					<X className="h-4 w-4" />
					<span className="sr-only">Close</span>
				</SheetClose>
			</SheetContent>
		</Sheet>
	);
}
