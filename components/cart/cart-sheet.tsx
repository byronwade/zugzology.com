"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/lib/stores/cart";
import { CartItem } from "@/components/cart/cart-item";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

export function CartSheet() {
	const { cart, isOpen, closeCart } = useCart();
	const hasItems = cart?.lines.edges && cart.lines.edges.length > 0;

	// Debug logging
	console.log("Cart state:", {
		hasItems,
		checkoutUrl: cart?.checkoutUrl,
		totalQuantity: cart?.totalQuantity,
		cost: cart?.cost,
	});

	return (
		<Sheet open={isOpen} onOpenChange={closeCart}>
			<SheetContent className="flex flex-col h-full">
				<SheetHeader className="space-y-2.5">
					<SheetTitle className="flex items-center gap-2">
						<ShoppingCart className="w-5 h-5" />
						Cart ({cart?.totalQuantity || 0})
					</SheetTitle>
				</SheetHeader>

				{!hasItems ? (
					<div className="flex-1 flex items-center justify-center">
						<p className="text-muted-foreground">Your cart is empty</p>
					</div>
				) : (
					<>
						<div className="flex-1 overflow-y-auto py-6">
							{cart?.lines.edges.map(({ node }) => (
								<CartItem key={node.id} item={node} />
							))}
						</div>

						<div className="border-t pt-6 space-y-4">
							<dl className="space-y-3">
								<div className="flex justify-between">
									<dt className="text-muted-foreground">Subtotal</dt>
									<dd>{cart?.cost?.subtotalAmount && formatPrice(cart.cost.subtotalAmount.amount, cart.cost.subtotalAmount.currencyCode)}</dd>
								</div>
								<div className="flex justify-between">
									<dt className="text-muted-foreground">Tax</dt>
									<dd>{cart?.cost?.totalTaxAmount && formatPrice(cart.cost.totalTaxAmount.amount, cart.cost.totalTaxAmount.currencyCode)}</dd>
								</div>
								<div className="flex justify-between font-medium">
									<dt>Total</dt>
									<dd>{cart?.cost?.totalAmount && formatPrice(cart.cost.totalAmount.amount, cart.cost.totalAmount.currencyCode)}</dd>
								</div>
							</dl>

							<Button className="w-full" size="lg" asChild>
								<a href={cart?.checkoutUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
									Checkout with Shopify
									<ShoppingCart className="w-4 h-4" />
								</a>
							</Button>
						</div>
					</>
				)}
			</SheetContent>
		</Sheet>
	);
}
