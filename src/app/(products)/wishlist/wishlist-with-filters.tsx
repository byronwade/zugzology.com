"use client";

import { Heart, Loader2, ShoppingCart, Trash2 } from "lucide-react";
import { memo, useMemo, useState } from "react";
import { toast } from "sonner";
import { ProductCard } from "@/components/features/products/product-card";
import { ProductFilters } from "@/components/features/filters";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { useProductFiltering } from "@/hooks/use-product-filtering";
import { addToCart, createCart } from "@/lib/actions/shopify";
import type { CartItem, ShopifyProduct } from "@/lib/types";

type WishlistWithFiltersProps = {
	wishlistProducts: ShopifyProduct[];
	wishlist: string[];
	removeFromWishlist: (handle: string) => void;
};

// Memoized product item for wishlist - prevents re-renders when filtering
const WishlistProductItem = memo(function WishlistProductItem({
	product,
	view,
	onRemoveFromWishlist
}: {
	product: ShopifyProduct;
	view: "grid" | "list";
	onRemoveFromWishlist: (handle: string) => void;
}) {
	// Memoize variant data extraction
	const variantData = useMemo(() => {
		const variant = product.variants?.nodes?.[0];
		if (!variant) return null;

		return {
			id: variant.id,
			quantity: variant.quantityAvailable || 0,
		};
	}, [product.variants]);

	if (!variantData) return null;

	return (
		<ProductCard
			onRemoveFromWishlist={onRemoveFromWishlist}
			product={product}
			quantity={variantData.quantity}
			variantId={variantData.id}
			view={view}
		/>
	);
});

export default function WishlistWithFilters({ wishlistProducts, wishlist, removeFromWishlist }: WishlistWithFiltersProps) {
	const [isBuying, setIsBuying] = useState(false);

	// Use filtering hook
	const { filteredProducts } = useProductFiltering(wishlistProducts);

	// Use filtered products
	const displayProducts = useMemo(() => filteredProducts, [filteredProducts]);

	const handleRemoveFromWishlist = (handle: string) => {
		if (typeof window !== "undefined" && window.gtag) {
			const product = wishlistProducts.find((p) => p.handle === handle);
			if (product) {
				window.gtag("event", "remove_from_wishlist", {
					currency: "USD",
					value: Number.parseFloat(product.variants?.nodes?.[0]?.price?.amount || "0"),
					items: [
						{
							item_id: product.id,
							item_name: product.title,
							price: Number.parseFloat(product.variants?.nodes?.[0]?.price?.amount || "0"),
						},
					],
				});
			}
		}

		removeFromWishlist(handle);
	};

	const clearWishlist = () => {
		if (typeof window !== "undefined" && window.gtag) {
			window.gtag("event", "clear_wishlist", {
				items_count: wishlistProducts.length,
			});
		}

		wishlist.forEach((handle: string) => {
			removeFromWishlist(handle);
		});
		toast.success("Wishlist cleared");
	};

	const addAllToCart = async () => {
		if (displayProducts.length === 0) {
			toast.error("Your wishlist is empty");
			return;
		}

		setIsBuying(true);
		try {
			const cartId = localStorage.getItem("cartId");
			let cart;

			if (cartId) {
				cart = { id: cartId };
			} else {
				cart = await createCart();
				if (!cart?.id) {
					throw new Error("Failed to create cart");
				}
			}

			const items: CartItem[] = displayProducts.map((product) => {
				const variant = product.variants?.nodes?.[0];
				if (!variant?.id) {
					throw new Error(`No variant found for product: ${product.title}`);
				}

				const formattedVariantId = variant.id.includes("gid://shopify/ProductVariant/")
					? variant.id
					: `gid://shopify/ProductVariant/${variant.id}`;

				return {
					merchandiseId: formattedVariantId,
					quantity: 1,
				};
			});

			await addToCart(cart.id, items);

			if (typeof window !== "undefined" && window.gtag) {
				window.gtag("event", "add_to_cart", {
					currency: "USD",
					value: displayProducts.reduce(
						(total, product) => total + Number.parseFloat(product.variants?.nodes?.[0]?.price?.amount || "0"),
						0
					),
					items: displayProducts.map((product) => ({
						item_id: product.id,
						item_name: product.title,
						price: Number.parseFloat(product.variants?.nodes?.[0]?.price?.amount || "0"),
						quantity: 1,
					})),
				});
			}

			wishlist.forEach((handle: string) => {
				removeFromWishlist(handle);
			});
			toast.success("All items added to cart!");
		} catch (_error) {
			toast.error("Failed to add items to cart");
		} finally {
			setIsBuying(false);
		}
	};

	const buyAllItems = async () => {
		if (displayProducts.length === 0) {
			toast.error("Your wishlist is empty");
			return;
		}

		setIsBuying(true);
		try {
			const cart = await createCart();
			if (!cart?.id) {
				throw new Error("Failed to create cart");
			}

			const items: CartItem[] = displayProducts.map((product) => {
				const variant = product.variants?.nodes?.[0];
				if (!variant?.id) {
					throw new Error(`No variant found for product: ${product.title}`);
				}

				const formattedVariantId = variant.id.includes("gid://shopify/ProductVariant/")
					? variant.id
					: `gid://shopify/ProductVariant/${variant.id}`;

				return {
					merchandiseId: formattedVariantId,
					quantity: 1,
				};
			});

			const updatedCart = await addToCart(cart.id, items);

			if (updatedCart && "checkoutUrl" in updatedCart) {
				if (typeof window !== "undefined" && window.gtag) {
					window.gtag("event", "begin_checkout", {
						currency: "USD",
						value: displayProducts.reduce(
							(total, product) => total + Number.parseFloat(product.variants?.nodes?.[0]?.price?.amount || "0"),
							0
						),
						items: displayProducts.map((product) => ({
							item_id: product.id,
							item_name: product.title,
							price: Number.parseFloat(product.variants?.nodes?.[0]?.price?.amount || "0"),
							quantity: 1,
						})),
					});
				}

				wishlist.forEach((handle: string) => {
					removeFromWishlist(handle);
				});
				toast.success("All items added to cart!");
				window.location.href = updatedCart.checkoutUrl;
			} else {
				throw new Error("Failed to get checkout URL");
			}
		} catch (_error) {
			toast.error("Failed to proceed to checkout");
		} finally {
			setIsBuying(false);
		}
	};

	if (wishlistProducts.length === 0) {
		return (
			<main className="container mx-auto px-4 py-12">
				{/* Modern Empty State */}
				<div className="mx-auto flex max-w-lg flex-col items-center justify-center py-16 text-center">
					<div className="mb-8 rounded-3xl bg-gradient-to-br from-primary/5 to-primary/10 p-12">
						<Heart className="h-16 w-16 text-primary/60" strokeWidth={1.5} />
					</div>
					<h2 className="mb-3 font-semibold text-foreground text-3xl">Your Wishlist is Empty</h2>
					<p className="mb-8 max-w-md text-muted-foreground leading-relaxed">
						Save products you&apos;re interested in and come back to them later. Start exploring our collection to find
						items you love.
					</p>
					<Button asChild className="h-12 rounded-xl px-8 font-semibold shadow-lg hover:shadow-xl" size="lg">
						<Link href="/products">Explore Products</Link>
					</Button>
				</div>
			</main>
		);
	}

	return (
		<>
			{/* Modern Sticky Header */}
			<div className="sticky top-[56px] z-40 border-b bg-background/95 backdrop-blur-sm">
				<div className="container mx-auto px-4 py-5">
					<div className="flex items-center justify-between">
						<div>
							<div className="flex items-center gap-3">
								<div className="rounded-lg bg-primary/10 p-2">
									<Heart className="h-5 w-5 text-primary" strokeWidth={2} />
								</div>
								<div>
									<h1 className="font-semibold text-foreground text-2xl">My Wishlist</h1>
									<p className="mt-0.5 text-muted-foreground text-sm">
										{displayProducts.length} {displayProducts.length === 1 ? "item" : "items"} saved
									</p>
								</div>
							</div>
						</div>
						<div className="flex gap-2">
							<Button
								className="h-9 rounded-lg px-4 font-medium text-sm transition-all hover:bg-destructive/10 hover:text-destructive"
								disabled={isBuying}
								onClick={clearWishlist}
								variant="outline"
							>
								<Trash2 className="mr-2 h-4 w-4" strokeWidth={2} />
								Clear All
							</Button>
							<Button
								className="h-9 rounded-lg px-4 font-medium text-sm transition-all"
								disabled={isBuying}
								onClick={addAllToCart}
								variant="outline"
							>
								{isBuying ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" strokeWidth={2.5} />
								) : (
									<ShoppingCart className="mr-2 h-4 w-4" strokeWidth={2} />
								)}
								Add to Cart
							</Button>
							<Button className="h-9 rounded-lg px-4 font-semibold text-sm shadow-md transition-all hover:shadow-lg" disabled={isBuying} onClick={buyAllItems}>
								{isBuying ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" strokeWidth={2.5} />
										Processing...
									</>
								) : (
									<>
										<ShoppingCart className="mr-2 h-4 w-4" strokeWidth={2} />
										Buy All ({displayProducts.length})
									</>
								)}
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Product Filters */}
			<ProductFilters products={wishlistProducts} showCollections={true} />

			<main className="container mx-auto px-4 py-12">
				{/* Empty state after filtering */}
				{displayProducts.length === 0 ? (
					<div className="mx-auto flex max-w-lg flex-col items-center justify-center py-16 text-center">
						<div className="mb-8 rounded-3xl bg-gradient-to-br from-primary/5 to-primary/10 p-12">
							<Heart className="h-16 w-16 text-primary/60" strokeWidth={1.5} />
						</div>
						<h2 className="mb-3 font-semibold text-foreground text-2xl">No Products Match Your Filters</h2>
						<p className="mb-8 max-w-md text-muted-foreground leading-relaxed">
							Try adjusting your filters to see more products from your wishlist.
						</p>
					</div>
				) : (
					<>
						{/* Mobile List View */}
						<div className="space-y-3 sm:hidden">
							{displayProducts.map((product) => (
								<WishlistProductItem
									key={`${product.id}-mobile`}
									onRemoveFromWishlist={handleRemoveFromWishlist}
									product={product}
									view="list"
								/>
							))}
						</div>

						{/* Desktop Grid View */}
						<div className="hidden grid-cols-2 gap-6 sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
							{displayProducts.map((product) => (
								<WishlistProductItem
									key={product.id}
									onRemoveFromWishlist={handleRemoveFromWishlist}
									product={product}
									view="grid"
								/>
							))}
						</div>
					</>
				)}
			</main>
		</>
	);
}
