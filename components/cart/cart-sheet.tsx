"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/lib/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

export function CartSheet() {
	const { cart, isOpen, closeCart, isLoading, updateItem, removeItem } = useCart();

	const handleUpdateQuantity = async (lineId: string, quantity: number) => {
		try {
			await updateItem(lineId, quantity);
		} catch (error) {
			console.error("Update quantity error:", error);
		}
	};

	const handleRemoveItem = async (lineId: string) => {
		try {
			await removeItem(lineId);
		} catch (error) {
			console.error("Remove item error:", error);
		}
	};

	return (
		<Sheet open={isOpen} onOpenChange={closeCart}>
			<SheetContent className="flex flex-col w-full sm:max-w-lg">
				<SheetHeader>
					<SheetTitle className="flex items-center gap-2">
						<ShoppingCart className="h-5 w-5" />
						Shopping Cart {cart?.totalQuantity ? `(${cart.totalQuantity})` : ""}
					</SheetTitle>
				</SheetHeader>

				{isLoading && (
					<div className="flex items-center justify-center py-8">
						<Loader2 className="h-8 w-8 animate-spin" />
					</div>
				)}

				{!isLoading && cart?.lines.edges.length === 0 && (
					<div className="flex flex-col items-center justify-center py-8 text-center">
						<ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
						<p className="text-muted-foreground">Your cart is empty</p>
					</div>
				)}

				<div className="flex-1 overflow-y-auto py-4">
					{cart?.lines.edges.map(({ node }) => (
						<div key={node.id} className="flex gap-4 py-4 border-b">
							{node.merchandise.image && (
								<div className="relative w-20 h-20">
									<Image src={node.merchandise.image.url} alt={node.merchandise.image.altText || ""} fill className="object-cover rounded-md" />
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
									<Button variant="ghost" size="icon" onClick={() => handleRemoveItem(node.id)} disabled={isLoading}>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
								<p className="mt-2 font-medium">{formatPrice(node.cost.totalAmount.amount)}</p>
							</div>
						</div>
					))}
				</div>

				<div className="border-t pt-4">
					<div className="flex justify-between mb-4">
						<span className="font-medium">Subtotal</span>
						<span className="font-medium">{formatPrice(cart?.cost.subtotalAmount.amount || "0")}</span>
					</div>
					<Button className="w-full" size="lg" disabled={!cart?.checkoutUrl || isLoading} onClick={() => (window.location.href = cart!.checkoutUrl)}>
						{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Proceed to Checkout"}
					</Button>
					<p className="text-sm text-center text-muted-foreground mt-4">Shipping and taxes calculated at checkout</p>
				</div>
			</SheetContent>
		</Sheet>
	);
}
