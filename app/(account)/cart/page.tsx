import { unstable_cache } from "next/cache";
import { Suspense } from "react";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";

interface CartItem {
	id: string;
	productId: string;
	title: string;
	price: number;
	quantity: number;
	image: string;
}

interface Cart {
	items: CartItem[];
	subtotal: number;
	tax: number;
	total: number;
}

// Mock cart data
const mockCart: Cart = {
	items: [
		{
			id: "cart_1",
			productId: "1",
			title: "Vintage Leather Backpack",
			price: 129.99,
			quantity: 1,
			image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80",
		},
		{
			id: "cart_2",
			productId: "4",
			title: "Wireless Noise-Canceling Headphones",
			price: 299.99,
			quantity: 2,
			image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
		},
	],
	subtotal: 729.97,
	tax: 58.4,
	total: 788.37,
};

const getCart = unstable_cache(
	async () => {
		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 1000));
		return mockCart;
	},
	["cart"],
	{
		revalidate: 0, // Don't cache cart data
		tags: ["cart"],
	}
);

function CartLoading() {
	return <div className="animate-pulse">Loading cart...</div>;
}

function CartItem({ item }: { item: CartItem }) {
	return (
		<div className="flex items-center py-4 border-b">
			<img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded" />
			<div className="ml-4 flex-grow">
				<h3 className="font-semibold">{item.title}</h3>
				<p className="text-neutral-600">Quantity: {item.quantity}</p>
				<p className="font-bold">${item.price.toFixed(2)}</p>
			</div>
			<button className="text-red-600 hover:text-red-800">Remove</button>
		</div>
	);
}

function CartSummary({ cart }: { cart: Cart }) {
	return (
		<div className="bg-neutral-50 p-6 rounded-lg">
			<h3 className="text-lg font-semibold mb-4">Order Summary</h3>
			<div className="space-y-2">
				<div className="flex justify-between">
					<span>Subtotal</span>
					<span>${cart.subtotal.toFixed(2)}</span>
				</div>
				<div className="flex justify-between">
					<span>Tax</span>
					<span>${cart.tax.toFixed(2)}</span>
				</div>
				<div className="flex justify-between font-bold text-lg border-t pt-2">
					<span>Total</span>
					<span>${cart.total.toFixed(2)}</span>
				</div>
			</div>
			<button className="w-full bg-blue-600 text-white py-3 rounded-lg mt-6 hover:bg-blue-700">Proceed to Checkout</button>
		</div>
	);
}

async function CartContent() {
	const cart = await getCart();

	if (!cart || cart.items.length === 0) {
		return (
			<div className="text-center py-12">
				<h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
				<a href="/products" className="text-blue-600 hover:text-blue-800 font-medium">
					Continue Shopping →
				</a>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<div className="lg:col-span-2">
				<div className="space-y-4">
					{cart.items.map((item) => (
						<CartItem key={item.id} item={item} />
					))}
				</div>
			</div>
			<div>
				<CartSummary cart={cart} />
			</div>
		</div>
	);
}

export default function CartPage() {
	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
			<Suspense fallback={<CartLoading />}>
				<CartContent />
			</Suspense>
		</div>
	);
}
