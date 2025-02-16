"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/providers/cart-provider";
import { Loader2, ShoppingCart, Trash2, X } from "lucide-react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { useEffect, useCallback, useMemo } from "react";
import { useKeyboardShortcut } from "@/lib/hooks/use-keyboard-shortcut";

export function CartSheet() {
	const { cart, isOpen, openCart, closeCart, isLoading, updateItem, removeItem } = useCart();

	// Register keyboard shortcut
	useKeyboardShortcut("shift+o", () => {
		if (isOpen) {
			closeCart();
		} else {
			openCart();
		}
	});

	// Memoize handlers to prevent unnecessary re-renders
	const handleUpdateQuantity = useCallback(
		async (lineId: string, quantity: number) => {
			try {
				await updateItem(lineId, quantity);
			} catch (error) {
				console.error("Update quantity error:", error);
			}
		},
		[updateItem]
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
			<SheetContent className="fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out inset-y-0 right-0 h-full border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right flex flex-col w-full sm:max-w-lg">
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
										<select value={node.quantity} onChange={(e) => handleUpdateQuantity(node.id, Number(e.target.value))} className="h-8 w-20 rounded-md border" disabled={isLoading}>
											{[...Array(10)].map((_, i) => (
												<option key={i + 1} value={i + 1}>
													{i + 1}
												</option>
											))}
										</select>
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
