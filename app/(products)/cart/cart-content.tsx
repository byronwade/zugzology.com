"use client";

import { useCart } from "@/components/providers/cart-provider";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Check } from "lucide-react";
import Image from "next/image";
import { useState, useCallback, useEffect } from "react";
import { Link } from '@/components/ui/link';
import { toast } from "sonner";
import type { ShopifyProduct } from "@/lib/types";
import { UniversalBreadcrumb, BreadcrumbConfigs } from "@/components/navigation/universal-breadcrumb";

// Component for recommended products in empty cart
function RecommendedProducts() {
	const [products, setProducts] = useState<ShopifyProduct[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchPopularProducts() {
			try {
				setLoading(true);
				const response = await fetch('/api/products?limit=3&tag=popular');
				
				if (!response.ok) {
					// Fallback to fetching any products if no popular tag
					const fallbackResponse = await fetch('/api/products?limit=3');
					if (!fallbackResponse.ok) {
						throw new Error('Failed to fetch products');
					}
					const fallbackData = await fallbackResponse.json();
					setProducts(fallbackData.products || []);
					return;
				}
				
				const data = await response.json();
				setProducts(data.products || []);
			} catch (err) {
				setError('Failed to load recommended products');
				console.error('Error fetching recommended products:', err);
			} finally {
				setLoading(false);
			}
		}

		fetchPopularProducts();
	}, []);

	if (loading) {
		return (
			<div className="mt-12 text-left">
				<h2 className="text-lg font-semibold mb-4">Popular Items</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{[1, 2, 3].map((i) => (
						<div key={i} className="p-4 border rounded-lg animate-pulse">
							<div className="h-32 bg-gray-200 rounded mb-3"></div>
							<div className="h-4 bg-gray-200 rounded mb-2"></div>
							<div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
							<div className="h-4 bg-gray-200 rounded w-1/2"></div>
						</div>
					))}
				</div>
			</div>
		);
	}

	if (error || products.length === 0) {
		return (
			<div className="mt-12 text-left">
				<h2 className="text-lg font-semibold mb-4">Popular Items</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{/* Fallback static recommendations */}
					<div className="p-4 border rounded-lg">
						<div className="h-32 bg-gray-100 rounded mb-2 flex items-center justify-center">
							<ShoppingCart className="h-8 w-8 text-gray-400" />
						</div>
						<h3 className="font-medium">Beginner Growing Kit</h3>
						<p className="text-sm text-gray-600">Perfect for first-time growers</p>
					</div>
					<div className="p-4 border rounded-lg">
						<div className="h-32 bg-gray-100 rounded mb-2 flex items-center justify-center">
							<ShoppingCart className="h-8 w-8 text-gray-400" />
						</div>
						<h3 className="font-medium">Premium Substrate</h3>
						<p className="text-sm text-gray-600">High-quality growing medium</p>
					</div>
					<div className="p-4 border rounded-lg">
						<div className="h-32 bg-gray-100 rounded mb-2 flex items-center justify-center">
							<ShoppingCart className="h-8 w-8 text-gray-400" />
						</div>
						<h3 className="font-medium">Oyster Mushroom Spawn</h3>
						<p className="text-sm text-gray-600">Easy to grow variety</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="mt-12 text-left">
			<h2 className="text-lg font-semibold mb-4">Popular Items</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{products.map((product) => {
					const imageUrl = product.images?.nodes?.[0]?.url || product.media?.nodes?.[0]?.previewImage?.url;
					const price = product.priceRange?.minVariantPrice?.amount;
					const compareAtPrice = product.compareAtPriceRange?.minVariantPrice?.amount;
					const isOnSale = compareAtPrice && parseFloat(compareAtPrice) > parseFloat(price || '0');

					return (
						<Link 
							key={product.id} 
							href={`/products/${product.handle}`}
							className="p-4 border rounded-lg hover:shadow-md transition-shadow group"
						>
							<div className="relative h-32 bg-gray-100 rounded mb-3 overflow-hidden">
								{imageUrl ? (
									<Image
										src={imageUrl}
										alt={product.images?.nodes?.[0]?.altText || product.title}
										fill
										sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
										className="object-cover group-hover:scale-105 transition-transform duration-200"
									/>
								) : (
									<div className="absolute inset-0 flex items-center justify-center">
										<ShoppingCart className="h-8 w-8 text-gray-400" />
									</div>
								)}
								{!product.availableForSale && (
									<div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
										<span className="text-white text-xs font-medium">Out of Stock</span>
									</div>
								)}
							</div>
							<h3 className="font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-purple-600 transition-colors">
								{product.title}
							</h3>
							{product.description && (
								<p className="text-sm text-gray-600 mb-2 line-clamp-2">
									{product.description.length > 80 
										? `${product.description.slice(0, 80)}...`
										: product.description
									}
								</p>
							)}
							<div className="flex items-center gap-2">
								{price && (
									<span className="font-medium text-gray-900">
										{formatPrice(price, product.priceRange.minVariantPrice.currencyCode)}
									</span>
								)}
								{isOnSale && compareAtPrice && (
									<span className="text-sm text-gray-500 line-through">
										{formatPrice(compareAtPrice, product.priceRange.minVariantPrice.currencyCode)}
									</span>
								)}
								{!product.availableForSale && (
									<span className="text-xs text-red-600 font-medium">Out of Stock</span>
								)}
							</div>
						</Link>
					);
				})}
			</div>
		</div>
	);
}

export default function CartContent() {
	const { cart, removeItem, updateItemQuantity, isUpdating } = useCart();
	const [updating, setUpdating] = useState<string | null>(null);

	// Track cart analytics
	useEffect(() => {
		if (cart && typeof window !== 'undefined' && window.gtag) {
			const cartItems = cart.lines?.edges || [];
			if (cartItems.length > 0) {
				// Track view_cart event
				window.gtag('event', 'view_cart', {
					currency: cart.cost?.subtotalAmount?.currencyCode || 'USD',
					value: parseFloat(cart.cost?.subtotalAmount?.amount || '0'),
					items: cartItems.map((item, index) => ({
						item_id: item.node.merchandise.product.id,
						item_name: item.node.merchandise.product.title,
						price: parseFloat(item.node.merchandise.price.amount),
						quantity: item.node.quantity,
						index: index,
					})),
				});
			}
		}
	}, [cart]);

	const handleUpdateQuantity = useCallback(
		async (lineId: string, newQuantity: number) => {
			if (newQuantity < 1) return;
			
			setUpdating(lineId);
			try {
				await updateItemQuantity(lineId, newQuantity);
			} catch (error) {
				console.error("Failed to update quantity:", error);
				toast.error("Failed to update quantity");
			} finally {
				setUpdating(null);
			}
		},
		[updateItemQuantity]
	);

	const handleRemoveItem = useCallback(
		async (lineId: string, productData?: any) => {
			setUpdating(lineId);
			try {
				await removeItem(lineId);
				toast.success("Item removed from cart");
				
				// Track remove_from_cart event
				if (productData && typeof window !== 'undefined' && window.gtag) {
					window.gtag('event', 'remove_from_cart', {
						currency: productData.currency || 'USD',
						value: parseFloat(productData.price || '0'),
						items: [{
							item_id: productData.id,
							item_name: productData.title,
							price: parseFloat(productData.price || '0'),
							quantity: productData.quantity,
						}],
					});
				}
			} catch (error) {
				console.error("Failed to remove item:", error);
				toast.error("Failed to remove item");
			} finally {
				setUpdating(null);
			}
		},
		[removeItem]
	);

	const handleCheckout = () => {
		if (!cart?.checkoutUrl) return;
		
		// Track begin_checkout event
		if (typeof window !== 'undefined' && window.gtag) {
			const cartItems = cart.lines?.edges || [];
			window.gtag('event', 'begin_checkout', {
				currency: cart.cost?.subtotalAmount?.currencyCode || 'USD',
				value: parseFloat(cart.cost?.subtotalAmount?.amount || '0'),
				items: cartItems.map((item, index) => ({
					item_id: item.node.merchandise.product.id,
					item_name: item.node.merchandise.product.title,
					price: parseFloat(item.node.merchandise.price.amount),
					quantity: item.node.quantity,
					index: index,
				})),
			});
		}
		
		window.location.href = cart.checkoutUrl;
	};

	if (!cart) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-purple-600" />
			</div>
		);
	}

	const cartItems = cart.lines?.edges || [];
	const isEmpty = cartItems.length === 0;
	const subtotal = cart.cost?.subtotalAmount?.amount ? parseFloat(cart.cost.subtotalAmount.amount) : 0;

	if (isEmpty) {
		return (
			<div className="min-h-screen bg-gray-50">
				<div className="max-w-4xl mx-auto px-4 py-8">
					{/* Breadcrumb */}
					<nav className="mb-8" aria-label="Breadcrumb">
						<ol className="flex items-center space-x-2">
							<li>
								<Link href="/" className="text-gray-500 hover:text-gray-700">
									Home
								</Link>
							</li>
							<li className="text-gray-400">/</li>
							<li className="text-gray-900 font-medium">Cart</li>
						</ol>
					</nav>

					<div className="bg-white rounded-lg shadow-sm p-8 text-center">
						<div className="bg-purple-50 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
							<ShoppingCart className="h-12 w-12 text-purple-600" />
						</div>
						<h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
						<p className="text-gray-600 mb-8">Add some premium mushroom cultivation supplies to get started</p>
						<Link href="/products">
							<Button className="bg-purple-600 hover:bg-purple-700 text-white">
								<ArrowLeft className="h-4 w-4 mr-2" />
								Continue Shopping
							</Button>
						</Link>
						
						{/* Recommended products for empty cart */}
						<RecommendedProducts />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-4xl mx-auto px-4 py-8">
				{/* Breadcrumb */}
				<div className="mb-8">
					<UniversalBreadcrumb items={BreadcrumbConfigs.cart()} />
				</div>

				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
					<p className="text-gray-600">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart</p>
				</div>

				<div className="bg-white rounded-lg shadow-sm">
					<div className="p-6">
						<div className="space-y-6">
							{cartItems.map(({ node }) => {
								const productData = {
									id: node.merchandise.product.id,
									title: node.merchandise.product.title,
									price: node.merchandise.price.amount,
									quantity: node.quantity,
									currency: node.merchandise.price.currencyCode,
								};

								return (
									<div key={node.id} className="flex gap-4 py-6 border-b border-gray-200 last:border-b-0">
										<div className="relative h-24 w-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
											{node.merchandise.product.images.edges[0]?.node ? (
												<Image
													src={node.merchandise.product.images.edges[0].node.url}
													alt={node.merchandise.product.images.edges[0].node.altText || node.merchandise.product.title}
													fill
													sizes="96px"
													className="object-cover"
												/>
											) : (
												<div className="absolute inset-0 flex items-center justify-center bg-gray-100">
													<ShoppingCart className="h-8 w-8 text-gray-400" />
												</div>
											)}
										</div>

										<div className="flex-1 min-w-0">
											<div className="flex justify-between">
												<div>
													<h3 className="text-lg font-medium text-gray-900 mb-1">
														<Link 
															href={`/products/${node.merchandise.product.handle}`}
															className="hover:text-purple-600"
														>
															{node.merchandise.product.title}
														</Link>
													</h3>
													{node.merchandise.title !== "Default Title" && (
														<p className="text-sm text-gray-500 mb-2">{node.merchandise.title}</p>
													)}
												</div>
												<div className="text-right">
													<p className="text-lg font-medium text-gray-900">
														{formatPrice(parseFloat(node.cost.totalAmount.amount))}
													</p>
													<p className="text-sm text-gray-500">
														{formatPrice(parseFloat(node.merchandise.price.amount))} each
													</p>
												</div>
											</div>

											<div className="flex items-center justify-between mt-4">
												<div className="flex items-center border border-gray-300 rounded-lg">
													<button
														onClick={() => handleUpdateQuantity(node.id, node.quantity - 1)}
														disabled={updating === node.id || node.quantity <= 1}
														className="h-10 w-10 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent rounded-l-lg"
														aria-label="Decrease quantity"
													>
														<Minus className="h-4 w-4" />
													</button>
													<div className="h-10 w-16 flex items-center justify-center border-x border-gray-300 text-sm font-medium">
														{updating === node.id ? (
															<Loader2 className="h-4 w-4 animate-spin" />
														) : (
															node.quantity
														)}
													</div>
													<button
														onClick={() => handleUpdateQuantity(node.id, node.quantity + 1)}
														disabled={updating === node.id}
														className="h-10 w-10 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent rounded-r-lg"
														aria-label="Increase quantity"
													>
														<Plus className="h-4 w-4" />
													</button>
												</div>

												<button
													onClick={() => handleRemoveItem(node.id, productData)}
													disabled={updating === node.id}
													className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium"
												>
													<Trash2 className="h-4 w-4" />
													Remove
												</button>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>

					<div className="border-t border-gray-200 bg-gray-50 p-6 rounded-b-lg">
						<div className="flex justify-between items-center mb-4">
							<span className="text-lg font-medium text-gray-900">Subtotal</span>
							<span className="text-lg font-medium text-gray-900">{formatPrice(subtotal)}</span>
						</div>
						
						<div className="flex items-center text-sm text-green-600 mb-6">
							<Check className="h-4 w-4 mr-2" />
							{subtotal >= 75 ? "Free shipping included!" : `Add ${formatPrice(75 - subtotal)} more for free shipping`}
						</div>

						{/* Trust signals */}
						<div className="grid grid-cols-3 gap-4 mb-6 text-xs text-gray-600">
							<div className="text-center">
								<div className="w-8 h-8 mx-auto mb-1 bg-green-100 rounded-full flex items-center justify-center">
									<Check className="h-4 w-4 text-green-600" />
								</div>
								<span>Secure Checkout</span>
							</div>
							<div className="text-center">
								<div className="w-8 h-8 mx-auto mb-1 bg-blue-100 rounded-full flex items-center justify-center">
									<ArrowLeft className="h-4 w-4 text-blue-600" />
								</div>
								<span>30-Day Returns</span>
							</div>
							<div className="text-center">
								<div className="w-8 h-8 mx-auto mb-1 bg-purple-100 rounded-full flex items-center justify-center">
									<ShoppingCart className="h-4 w-4 text-purple-600" />
								</div>
								<span>Expert Support</span>
							</div>
						</div>

						<div className="flex gap-4">
							<Link href="/products" className="flex-1">
								<Button variant="outline" className="w-full">
									<ArrowLeft className="h-4 w-4 mr-2" />
									Continue Shopping
								</Button>
							</Link>
							<Button
								className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
								disabled={!cart.checkoutUrl || isUpdating}
								onClick={handleCheckout}
							>
								{isUpdating ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Loading...
									</>
								) : (
									<>
										<ShoppingCart className="h-4 w-4 mr-2" />
										Proceed to Checkout
									</>
								)}
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

// Global type extension
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}