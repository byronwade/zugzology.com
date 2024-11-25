"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/lib/stores/cart";
import { CartItem } from "@/components/cart/cart-item";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useState } from "react";

export function CartSheet() {
	const { cart, isOpen, closeCart } = useCart();
	const isMobile = useMediaQuery("(max-width: 768px)");
	const hasItems = cart?.lines.edges && cart.lines.edges.length > 0;
	const [dragStartY, setDragStartY] = useState(0);

	const handleDragStart = (e: React.TouchEvent) => {
		setDragStartY(e.touches[0].pageY);
	};

	const handleDragMove = (e: React.TouchEvent) => {
		if (dragStartY === 0) return;

		const currentY = e.touches[0].pageY;
		const distance = currentY - dragStartY;

		if (distance > 100) {
			setDragStartY(0);
			closeCart();
		}
	};

	const handleDragEnd = () => {
		setDragStartY(0);
	};

	return (
		<Sheet open={isOpen} onOpenChange={closeCart}>
			<SheetContent side={isMobile ? "bottom" : "right"} className={`flex flex-col ${isMobile ? "h-[85vh] rounded-t-xl" : "h-full"}`} onTouchStart={isMobile ? handleDragStart : undefined} onTouchMove={isMobile ? handleDragMove : undefined} onTouchEnd={handleDragEnd}>
				{/* Drag handle for mobile */}
				{isMobile && (
					<div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-6 flex items-center justify-center touch-none" role="button" aria-label="Drag to close">
						<div className="w-8 h-1 rounded-full bg-muted-foreground/20" />
					</div>
				)}

				<SheetHeader className={`space-y-2.5 pb-6 border-b ${isMobile ? "mt-6" : ""}`}>
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
