import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/lib/stores/cart";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

export function CartSheet() {
	const cart = useCart();
	const cartItems = cart.items || [];
	const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

	if (!cart.isOpen) return null;

	return (
		<Sheet open={cart.isOpen} onOpenChange={cart.toggleCart}>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Cart {cartCount > 0 ? `(${cartCount})` : ""}</SheetTitle>
				</SheetHeader>

				{cartCount > 0 ? (
					<>
						<ScrollArea className="h-[calc(100vh-200px)] py-4">
							<div className="space-y-4">
								{cartItems.map((item) => (
									<div key={item.id} className="flex items-center space-x-4">
										<div className="relative h-16 w-16">{item.merchandise.image && <Image src={item.merchandise.image.url} alt={item.merchandise.image.altText || item.merchandise.product.title} fill className="object-cover" />}</div>
										<div className="flex-1">
											<Link href={`/products/${item.merchandise.product.handle}`} className="text-sm font-medium" onClick={() => cart.toggleCart()}>
												{item.merchandise.product.title}
											</Link>
											<div className="text-sm text-gray-500">Quantity: {item.quantity}</div>
											<div className="text-sm font-medium">{formatPrice(item.cost.totalAmount.amount, item.cost.totalAmount.currencyCode)}</div>
										</div>
										<Button variant="ghost" size="icon" onClick={() => cart.removeItem(item.id)}>
											Remove
										</Button>
									</div>
								))}
							</div>
						</ScrollArea>
						<div className="border-t pt-4">
							<div className="flex justify-between text-sm">
								<span>Subtotal</span>
								<span className="font-medium">{formatPrice(cart.cost?.subtotalAmount.amount || 0, cart.cost?.subtotalAmount.currencyCode || "USD")}</span>
							</div>
							<Button asChild className="w-full mt-4">
								<Link href="/cart" onClick={() => cart.toggleCart()}>
									Continue to Checkout
								</Link>
							</Button>
						</div>
					</>
				) : (
					<div className="flex h-full flex-col items-center justify-center space-y-2">
						<p className="text-lg font-medium">Your cart is empty</p>
						<Button variant="outline" size="sm" onClick={() => cart.toggleCart()}>
							Continue Shopping
						</Button>
					</div>
				)}
			</SheetContent>
		</Sheet>
	);
}
