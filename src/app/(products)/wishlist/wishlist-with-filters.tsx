"use client";

import { Heart, Loader2, ShoppingCart, Trash2, X } from "lucide-react";
import { memo, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ProductFilters } from "@/components/features/filters";
import { ProductCard } from "@/components/features/products/product-card";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { useProductFiltering } from "@/hooks/use-product-filtering";
import { addToCart, createCart } from "@/lib/actions/shopify";
import type { CartItem, ShopifyProduct } from "@/lib/types";
import { cn } from "@/lib/utils";

type WishlistWithFiltersProps = {
	wishlistProducts: ShopifyProduct[];
	wishlist: string[];
	removeFromWishlist: (handle: string) => void;
};

// Memoized product item for wishlist - prevents re-renders when filtering
const WishlistProductItem = memo(function WishlistProductItem({
	product,
	view,
	onRemoveFromWishlist,
}: {
	product: ShopifyProduct;
	view: "grid" | "list";
	onRemoveFromWishlist: (handle: string) => void;
}) {
	// Memoize variant data extraction
	const variantData = useMemo(() => {
		const variant = product.variants?.nodes?.[0];
		if (!variant) {
			return null;
		}

		return {
			id: variant.id,
			quantity: variant.quantityAvailable || 0,
		};
	}, [product.variants]);

	if (!variantData) {
		return null;
	}

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

export default function WishlistWithFilters({
	wishlistProducts,
	wishlist,
	removeFromWishlist,
}: WishlistWithFiltersProps) {
	const [isBuying, setIsBuying] = useState(false);
	const [showFloating, setShowFloating] = useState(false);
	const [isDismissed, setIsDismissed] = useState(false);

	// Scroll detection for floating wishlist header - shows on any scroll
	useEffect(() => {
		const handleScroll = () => {
			const scrollY = window.scrollY;
			const threshold = 50; // Show after scrolling 50px down

			// Show if user has scrolled past threshold and hasn't dismissed
			if (scrollY > threshold && !isDismissed) {
				setShowFloating(true);
			} else if (scrollY <= threshold) {
				// Reset dismiss state when scrolling back to top
				setShowFloating(false);
				setIsDismissed(false);
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, [isDismissed]);

	const handleDismissFloating = () => {
		setShowFloating(false);
		setIsDismissed(true);
	};

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
			<section className="w-full bg-background">
				<div className="container mx-auto px-4 py-8 sm:py-12">
					{/* Modern Empty State */}
					<div className="mx-auto flex max-w-lg flex-col items-center justify-center py-8 text-center sm:py-16">
						<div className="mb-6 rounded-3xl bg-gradient-to-br from-primary/5 to-primary/10 p-8 sm:mb-8 sm:p-12">
							<Heart className="h-12 w-12 text-primary/60 sm:h-16 sm:w-16" strokeWidth={1.5} />
						</div>
						<h2 className="mb-3 font-semibold text-2xl text-foreground sm:text-3xl">Your Wishlist is Empty</h2>
						<p className="mb-6 max-w-md px-4 text-muted-foreground text-sm leading-relaxed sm:mb-8 sm:text-base">
							Save products you&apos;re interested in and come back to them later. Start exploring our collection to
							find items you love.
						</p>
						<Button
							asChild
							className="h-11 rounded-xl px-6 font-semibold shadow-lg hover:shadow-xl sm:h-12 sm:px-8"
							size="lg"
						>
							<Link href="/products">Explore Products</Link>
						</Button>
					</div>
				</div>
			</section>
		);
	}

	return (
		<>
			{/* Floating Wishlist Header - appears on scroll */}
			<div
				className={cn(
					"fixed top-[var(--header-height)] right-0 left-0 z-50 h-[52px] border-border border-b bg-background/95 backdrop-blur-md transition-all duration-200",
					showFloating && !isDismissed ? "translate-y-0 opacity-100" : "-translate-y-full pointer-events-none opacity-0"
				)}
			>
				<div className="container mx-auto flex h-full items-center gap-2 px-4 sm:gap-4">
					{/* Close Button */}
					<Button className="h-8 w-8 flex-shrink-0" onClick={handleDismissFloating} size="icon" variant="ghost">
						<X className="h-4 w-4" />
						<span className="sr-only">Close</span>
					</Button>

					{/* Title & Count */}
					<div className="flex flex-1 items-center gap-3">
						<div className="flex items-center gap-2">
							<Heart className="h-4 w-4 text-primary" strokeWidth={2} />
							<span className="hidden font-semibold text-foreground text-sm sm:inline">My Wishlist</span>
						</div>
						<span className="text-muted-foreground text-sm">
							{displayProducts.length} {displayProducts.length === 1 ? "item" : "items"}
						</span>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
						<Button
							className="h-9 px-3 sm:px-4"
							disabled={isBuying}
							onClick={clearWishlist}
							size="sm"
							variant="outline"
						>
							<Trash2 className="h-4 w-4 sm:mr-1.5" />
							<span className="hidden sm:inline">Clear</span>
						</Button>
						<Button className="h-9 px-3 sm:px-4" disabled={isBuying} onClick={addAllToCart} size="sm" variant="outline">
							{isBuying ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<>
									<ShoppingCart className="h-4 w-4 sm:mr-1.5" />
									<span className="hidden sm:inline">Add</span>
								</>
							)}
						</Button>
						<Button className="h-9 px-3 sm:px-4" disabled={isBuying} onClick={buyAllItems} size="sm">
							{isBuying ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<>
									<span className="hidden sm:inline">Buy All</span>
									<span className="sm:hidden">Buy</span>
									<ShoppingCart className="ml-1 h-4 w-4 sm:ml-1.5" />
								</>
							)}
						</Button>
					</div>
				</div>
			</div>

			{/* Initial Header - always visible */}
			<div className="border-b bg-background">
				<div className="container mx-auto px-3 py-3 sm:px-4 sm:py-5">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						{/* Title Section */}
						<div className="flex items-center gap-2 sm:gap-3">
							<div className="rounded-lg bg-primary/10 p-1.5 sm:p-2">
								<Heart className="h-4 w-4 text-primary sm:h-5 sm:w-5" strokeWidth={2} />
							</div>
							<div>
								<h1 className="font-semibold text-foreground text-lg sm:text-2xl">My Wishlist</h1>
								<p className="mt-0.5 text-muted-foreground text-xs sm:text-sm">
									{displayProducts.length} {displayProducts.length === 1 ? "item" : "items"} saved
								</p>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex gap-2">
							{/* Mobile: Icons only */}
							<Button
								className="h-9 w-9 shrink-0 rounded-lg px-0 font-medium text-sm transition-all hover:bg-destructive/10 hover:text-destructive sm:hidden"
								disabled={isBuying}
								onClick={clearWishlist}
								size="icon"
								variant="outline"
							>
								<Trash2 className="h-4 w-4" strokeWidth={2} />
							</Button>
							<Button
								className="h-9 w-9 shrink-0 rounded-lg px-0 font-medium text-sm transition-all sm:hidden"
								disabled={isBuying}
								onClick={addAllToCart}
								size="icon"
								variant="outline"
							>
								{isBuying ? (
									<Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
								) : (
									<ShoppingCart className="h-4 w-4" strokeWidth={2} />
								)}
							</Button>
							<Button
								className="h-9 flex-1 rounded-lg px-3 font-semibold text-sm shadow-md transition-all hover:shadow-lg sm:hidden sm:flex-none sm:px-4"
								disabled={isBuying}
								onClick={buyAllItems}
							>
								{isBuying ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" strokeWidth={2.5} />
										<span className="xs:inline hidden">Processing...</span>
									</>
								) : (
									<>
										<ShoppingCart className="mr-2 h-4 w-4" strokeWidth={2} />
										Buy ({displayProducts.length})
									</>
								)}
							</Button>

							{/* Desktop: Full text buttons */}
							<Button
								className="hidden h-9 rounded-lg px-4 font-medium text-sm transition-all hover:bg-destructive/10 hover:text-destructive sm:flex"
								disabled={isBuying}
								onClick={clearWishlist}
								variant="outline"
							>
								<Trash2 className="mr-2 h-4 w-4" strokeWidth={2} />
								Clear All
							</Button>
							<Button
								className="hidden h-9 rounded-lg px-4 font-medium text-sm transition-all sm:flex"
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
							<Button
								className="hidden h-9 rounded-lg px-4 font-semibold text-sm shadow-md transition-all hover:shadow-lg sm:flex"
								disabled={isBuying}
								onClick={buyAllItems}
							>
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

			<section className="w-full bg-background">
				<div className="container mx-auto px-3 py-6 sm:px-4 sm:py-8 md:py-12">
					{/* Empty state after filtering */}
					{displayProducts.length === 0 ? (
						<div className="mx-auto flex max-w-lg flex-col items-center justify-center py-8 text-center sm:py-16">
							<div className="mb-6 rounded-3xl bg-gradient-to-br from-primary/5 to-primary/10 p-8 sm:mb-8 sm:p-12">
								<Heart className="h-12 w-12 text-primary/60 sm:h-16 sm:w-16" strokeWidth={1.5} />
							</div>
							<h2 className="mb-3 font-semibold text-foreground text-xl sm:text-2xl">No Products Match Your Filters</h2>
							<p className="mb-6 max-w-md px-4 text-muted-foreground text-sm leading-relaxed sm:mb-8 sm:text-base">
								Try adjusting your filters to see more products from your wishlist.
							</p>
						</div>
					) : (
						<>
							{/* Mobile: List view */}
							<div className="flex flex-col gap-0 sm:hidden">
								{displayProducts.map((product) => (
									<WishlistProductItem
										key={`${product.id}-mobile`}
										onRemoveFromWishlist={handleRemoveFromWishlist}
										product={product}
										view="list"
									/>
								))}
							</div>

							{/* Desktop: Grid view */}
							<div className="hidden gap-6 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
								{displayProducts.map((product) => (
									<div className="group relative" key={product.id}>
										<WishlistProductItem
											onRemoveFromWishlist={handleRemoveFromWishlist}
											product={product}
											view="grid"
										/>
									</div>
								))}
							</div>
						</>
					)}
				</div>
			</section>
		</>
	);
}
