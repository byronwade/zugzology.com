"use client";

import { useEffect, useState } from "react";
import { getProduct, createCart, addToCart, getProducts, getAllBlogPosts } from "@/lib/actions/shopify";
import { ShopifyProduct, ShopifyCart, CartItem, ShopifyBlogArticle } from "@/lib/types";
import { ProductList } from "@/components/features/products/product-list";
import { Button } from "@/components/ui/button";
import { 
	DropdownMenu, 
	DropdownMenuContent, 
	DropdownMenuItem, 
	DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ShoppingCart, Trash2, Heart, Sparkles, ShoppingBag, Star, Bell, Filter, Grid3X3, List, SortAsc } from "lucide-react";
import { toast } from "sonner";
import { HistoryRecommendations } from "@/components/features/products/sections/history-recommendations";
import { RelatedProducts } from "@/components/features/products/sections/related-products";
import { RecentPosts } from "@/components/blog/recent-posts";
import { useWishlist } from "@/components/providers";

export default function WishlistContent() {
	const { wishlist, removeFromWishlist } = useWishlist();
	const [wishlistProducts, setWishlistProducts] = useState<ShopifyProduct[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isBuying, setIsBuying] = useState(false);
	const [historyProducts, setHistoryProducts] = useState<ShopifyProduct[]>([]);
	const [recommendedProducts, setRecommendedProducts] = useState<ShopifyProduct[]>([]);
	const [randomProducts, setRandomProducts] = useState<ShopifyProduct[]>([]);
	const [recentPosts, setRecentPosts] = useState<ShopifyBlogArticle[]>([]);
	const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price-low' | 'price-high'>('newest');
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [filteredProducts, setFilteredProducts] = useState<ShopifyProduct[]>([]);

	// Load wishlist products when wishlist changes
	useEffect(() => {
		const fetchWishlistProducts = async () => {
			try {
				const products = await Promise.all(wishlist.filter((handle: string) => handle && typeof handle === "string").map((handle: string) => getProduct(handle)));
				setWishlistProducts(products.filter((p): p is ShopifyProduct => p !== null));
			} catch (error) {
				console.error("Error loading wishlist products:", error);
				toast.error("Failed to load wishlist products");
			} finally {
				setIsLoading(false);
			}
		};

		fetchWishlistProducts();
	}, [wishlist]);

	// Sort and filter products when wishlist products or sort option changes
	useEffect(() => {
		if (!wishlistProducts.length) {
			setFilteredProducts([]);
			return;
		}

		let sorted = [...wishlistProducts];
		
		switch (sortBy) {
			case 'newest':
				// Assume newest products have higher IDs or use createdAt if available
				sorted = sorted.reverse();
				break;
			case 'oldest':
				// Keep original order for oldest first
				break;
			case 'price-low':
				sorted.sort((a, b) => {
					const priceA = parseFloat(a.variants?.nodes?.[0]?.price?.amount || '0');
					const priceB = parseFloat(b.variants?.nodes?.[0]?.price?.amount || '0');
					return priceA - priceB;
				});
				break;
			case 'price-high':
				sorted.sort((a, b) => {
					const priceA = parseFloat(a.variants?.nodes?.[0]?.price?.amount || '0');
					const priceB = parseFloat(b.variants?.nodes?.[0]?.price?.amount || '0');
					return priceB - priceA;
				});
				break;
		}

		setFilteredProducts(sorted);
	}, [wishlistProducts, sortBy]);

	// Load recommendations and blog posts
	useEffect(() => {
		const loadRecommendations = async () => {
			try {
				const [allProducts, blogPosts] = await Promise.all([getProducts(), getAllBlogPosts()]);

				// Get history from localStorage
				const existingHistory = JSON.parse(localStorage.getItem("viewedProducts") || "[]");
				setHistoryProducts(existingHistory);

				// Get random products for recommendations
				if (allProducts?.length) {
					const shuffled = [...allProducts].sort(() => 0.5 - Math.random()).slice(0, 10);
					setRandomProducts(shuffled);
					setRecommendedProducts(shuffled.slice(0, 4));
				}

				// Set recent blog posts
				setRecentPosts(blogPosts || []);
			} catch (error) {
				console.error("Error loading recommendations:", error);
			}
		};

		loadRecommendations();
	}, []);

	// Track wishlist analytics
	useEffect(() => {
		if (typeof window !== 'undefined' && window.gtag) {
			window.gtag('event', 'view_item_list', {
				item_list_id: 'wishlist',
				item_list_name: 'Wishlist',
				items: wishlistProducts.slice(0, 10).map((product, index) => ({
					item_id: product.id,
					item_name: product.title,
					price: parseFloat(product.variants?.nodes?.[0]?.price?.amount || '0'),
					index: index,
				})),
			});
		}
	}, [wishlistProducts]);

	const handleRemoveFromWishlist = (handle: string) => {
		// Track wishlist removal
		if (typeof window !== 'undefined' && window.gtag) {
			const product = wishlistProducts.find(p => p.handle === handle);
			if (product) {
				window.gtag('event', 'remove_from_wishlist', {
					currency: 'USD',
					value: parseFloat(product.variants?.nodes?.[0]?.price?.amount || '0'),
					items: [{
						item_id: product.id,
						item_name: product.title,
						price: parseFloat(product.variants?.nodes?.[0]?.price?.amount || '0'),
					}],
				});
			}
		}

		removeFromWishlist(handle);
	};

	const clearWishlist = () => {
		// Track wishlist clear
		if (typeof window !== 'undefined' && window.gtag) {
			window.gtag('event', 'clear_wishlist', {
				items_count: wishlistProducts.length,
			});
		}

		// Remove all items from wishlist using the context
		wishlist.forEach((handle: string) => {
			removeFromWishlist(handle);
		});
		setWishlistProducts([]);
		toast.success("Wishlist cleared");
	};

	const addAllToCart = async () => {
		if (wishlistProducts.length === 0) {
			toast.error("Your wishlist is empty");
			return;
		}

		setIsBuying(true);
		try {
			// Get existing cart or create new one
			const cartId = localStorage.getItem("cartId");
			let cart;
			
			if (cartId) {
				// Use existing cart
				cart = { id: cartId };
			} else {
				// Create new cart
				cart = await createCart();
				if (!cart?.id) throw new Error("Failed to create cart");
			}

			const items: CartItem[] = wishlistProducts.map((product) => {
				// Get the first variant from the nodes array
				const variant = product.variants?.nodes?.[0];
				if (!variant?.id) {
					throw new Error(`No variant found for product: ${product.title}`);
				}

				// Ensure the variant ID has the correct format
				const formattedVariantId = variant.id.includes("gid://shopify/ProductVariant/") ? variant.id : `gid://shopify/ProductVariant/${variant.id}`;

				return {
					merchandiseId: formattedVariantId,
					quantity: 1,
				};
			});

			await addToCart(cart.id, items);

			// Track add to cart event
			if (typeof window !== 'undefined' && window.gtag) {
				window.gtag('event', 'add_to_cart', {
					currency: 'USD',
					value: wishlistProducts.reduce((total, product) => {
						return total + parseFloat(product.variants?.nodes?.[0]?.price?.amount || '0');
					}, 0),
					items: wishlistProducts.map((product) => ({
						item_id: product.id,
						item_name: product.title,
						price: parseFloat(product.variants?.nodes?.[0]?.price?.amount || '0'),
						quantity: 1,
					})),
				});
			}

			// Clear wishlist after successfully adding to cart
			wishlist.forEach((handle: string) => {
				removeFromWishlist(handle);
			});
			setWishlistProducts([]);
			toast.success("All items added to cart!");
		} catch (error) {
			console.error("Error in addAllToCart:", error);
			toast.error("Failed to add items to cart");
		} finally {
			setIsBuying(false);
		}
	};

	const buyAllItems = async () => {
		if (wishlistProducts.length === 0) {
			toast.error("Your wishlist is empty");
			return;
		}

		setIsBuying(true);
		try {
			const cart = await createCart();
			if (!cart?.id) throw new Error("Failed to create cart");

			const items: CartItem[] = wishlistProducts.map((product) => {
				// Get the first variant from the nodes array
				const variant = product.variants?.nodes?.[0];
				if (!variant?.id) {
					throw new Error(`No variant found for product: ${product.title}`);
				}

				// Ensure the variant ID has the correct format
				const formattedVariantId = variant.id.includes("gid://shopify/ProductVariant/") ? variant.id : `gid://shopify/ProductVariant/${variant.id}`;

				return {
					merchandiseId: formattedVariantId,
					quantity: 1,
				};
			});

			const updatedCart = await addToCart(cart.id, items);

			if (updatedCart && "checkoutUrl" in updatedCart) {
				// Track begin checkout event
				if (typeof window !== 'undefined' && window.gtag) {
					window.gtag('event', 'begin_checkout', {
						currency: 'USD',
						value: wishlistProducts.reduce((total, product) => {
							return total + parseFloat(product.variants?.nodes?.[0]?.price?.amount || '0');
						}, 0),
						items: wishlistProducts.map((product) => ({
							item_id: product.id,
							item_name: product.title,
							price: parseFloat(product.variants?.nodes?.[0]?.price?.amount || '0'),
							quantity: 1,
						})),
					});
				}

				// Clear wishlist after successfully adding to cart
				wishlist.forEach((handle: string) => {
					removeFromWishlist(handle);
				});
				setWishlistProducts([]);
				toast.success("All items added to cart!");
				window.location.href = updatedCart.checkoutUrl;
			} else {
				throw new Error("Failed to get checkout URL");
			}
		} catch (error) {
			console.error("Error in buyAllItems:", error);
			toast.error("Failed to proceed to checkout");
		} finally {
			setIsBuying(false);
		}
	};

	if (isLoading) {
		return (
			<div className="w-full">
				<div className="sticky top-[56px] z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
					<div className="px-4 py-3 border-b">
						<div className="flex items-center justify-between mx-auto">
							<h1 className="text-2xl font-bold">Your Wishlist</h1>
							<div className="flex gap-2">
								<Button variant="outline" disabled className="flex items-center gap-2">
									<Trash2 className="h-4 w-4" />
									Clear All
								</Button>
								<Button variant="outline" disabled className="flex items-center gap-2">
									<ShoppingCart className="h-4 w-4" />
									Add to Cart
								</Button>
								<Button disabled className="flex items-center gap-2">
									<ShoppingCart className="h-4 w-4" />
									Buy Now
								</Button>
							</div>
						</div>
					</div>
				</div>
				<div className="p-4">
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
						{[1, 2, 3, 4, 5].map((i) => (
							<div key={i} className="aspect-[2/3] animate-pulse bg-secondary/50 rounded-lg" />
						))}
					</div>
				</div>
			</div>
		);
	}

	if (wishlistProducts.length === 0) {
		return (
			<div className="w-full">
				<div className="sticky top-[56px] z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
					<div className="px-4 py-3 border-b">
						<div className="flex items-center justify-between mx-auto">
							<h1 className="text-2xl font-bold">Your Wishlist</h1>
							<div className="flex gap-2">
								<Button variant="outline" disabled className="flex items-center gap-2">
									<Trash2 className="h-4 w-4" />
									Clear All
								</Button>
								<Button variant="outline" disabled className="flex items-center gap-2">
									<ShoppingCart className="h-4 w-4" />
									Add to Cart
								</Button>
								<Button disabled className="flex items-center gap-2">
									<ShoppingCart className="h-4 w-4" />
									Buy Now
								</Button>
							</div>
						</div>
					</div>
				</div>
				<div className="p-4">
					{/* Empty State Hero Section */}
					<div className="flex flex-col items-center justify-center py-20 text-center max-w-xl mx-auto">
						<div className="mb-8">
							<div className="w-16 h-16 mx-auto rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center mb-6">
								<Heart className="w-8 h-8 text-gray-400 dark:text-gray-500" />
							</div>
							<h2 className="text-2xl font-light text-gray-900 dark:text-gray-100 mb-3">Your wishlist is empty</h2>
							<p className="text-gray-600 dark:text-gray-400 leading-relaxed">
								Save products you&apos;re interested in and come back to them later.
							</p>
						</div>
						
						<Button asChild className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 text-white font-medium px-6">
							<a href="/products">Start browsing</a>
						</Button>
					</div>

					{/* History & Recommendations Section */}
					{historyProducts.length > 0 && (
						<section className="mt-16">
							<HistoryRecommendations 
								products={historyProducts} 
								recommendedProducts={recommendedProducts} 
								randomProducts={randomProducts} 
								currentProductId={undefined}
							/>
						</section>
					)}

					{/* Recommended Products Section */}
					{recommendedProducts.length > 0 && (
						<section className="mt-16" itemScope itemType="https://schema.org/ItemList">
							<meta itemProp="name" content="Recommended Products" />
							<meta itemProp="description" content="Products you might like" />
							<RelatedProducts 
								products={recommendedProducts} 
								currentProductId={undefined}
							/>
						</section>
					)}

					{/* Recent Blog Posts Section */}
					{recentPosts.length > 0 && (
						<section className="mt-16" itemScope itemType="https://schema.org/Blog">
							<meta itemProp="name" content="Latest Blog Posts" />
							<RecentPosts posts={recentPosts} />
						</section>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className="w-full">
			<div className="sticky top-[56px] z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="border-b">
					{/* Header Row */}
					<div className="px-4 py-3 flex items-center justify-between">
						<div className="flex items-center gap-4">
							<h1 className="text-xl font-medium text-foreground">Wishlist</h1>
							<span className="text-sm text-muted-foreground">
								{wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'}
							</span>
						</div>
						<div className="flex gap-2">
							<Button variant="outline" onClick={clearWishlist} className="h-8 px-3 text-xs" disabled={isBuying}>
								<Trash2 className="h-3 w-3 mr-1" />
								Clear
							</Button>
							<Button variant="outline" onClick={addAllToCart} className="h-8 px-3 text-xs" disabled={isBuying}>
								{isBuying ? (
									<>
										<ShoppingCart className="h-3 w-3 mr-1 animate-spin" />
										Adding...
									</>
								) : (
									<>
										<ShoppingCart className="h-3 w-3 mr-1" />
										Add to Cart
									</>
								)}
							</Button>
							<Button onClick={buyAllItems} className="h-8 px-3 text-xs" disabled={isBuying}>
								{isBuying ? (
									<>
										<ShoppingCart className="h-3 w-3 mr-1 animate-spin" />
										Processing...
									</>
								) : (
									<>
										<ShoppingCart className="h-3 w-3 mr-1" />
										Buy ({wishlistProducts.length})
									</>
								)}
							</Button>
						</div>
					</div>

					{/* Filter Controls Row */}
					<div className="px-4 py-2 border-t border-border/50 flex items-center justify-between">
						<div className="flex items-center gap-2">
							{/* Sort Dropdown */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground">
										<SortAsc className="h-3 w-3 mr-1" />
										Sort
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="start" className="w-36">
									<DropdownMenuItem onClick={() => setSortBy('newest')} className="text-xs">
										Newest first
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setSortBy('oldest')} className="text-xs">
										Oldest first
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setSortBy('price-low')} className="text-xs">
										Price: Low to High
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setSortBy('price-high')} className="text-xs">
										Price: High to Low
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

						<div className="flex items-center gap-1">
							{/* View Mode Toggle */}
							<Button
								variant={viewMode === 'grid' ? 'default' : 'ghost'}
								size="sm"
								onClick={() => setViewMode('grid')}
								className="h-7 w-7 p-0"
							>
								<Grid3X3 className="h-3 w-3" />
							</Button>
							<Button
								variant={viewMode === 'list' ? 'default' : 'ghost'}
								size="sm"
								onClick={() => setViewMode('list')}
								className="h-7 w-7 p-0"
							>
								<List className="h-3 w-3" />
							</Button>
						</div>
					</div>
				</div>
			</div>
			<div className="p-4">
				<ProductList 
					products={filteredProducts} 
					onRemoveFromWishlist={handleRemoveFromWishlist}
				/>

				{/* History & Recommendations Section */}
				<section className="mt-16">
					<HistoryRecommendations products={historyProducts} recommendedProducts={recommendedProducts} randomProducts={randomProducts} currentProductId={wishlistProducts[0]?.id} />
				</section>

				{/* Related Products Section */}
				{recommendedProducts.length > 0 && (
					<section className="mt-16" itemScope itemType="https://schema.org/ItemList">
						<meta itemProp="name" content="Related Products" />
						<meta itemProp="description" content="Products you might like" />
						<RelatedProducts products={recommendedProducts} currentProductId={wishlistProducts[0]?.id} />
					</section>
				)}

				{/* Recent Blog Posts Section */}
				{recentPosts.length > 0 && (
					<section className="mt-16" itemScope itemType="https://schema.org/Blog">
						<meta itemProp="name" content="Latest Blog Posts" />
						<RecentPosts posts={recentPosts} />
					</section>
				)}
			</div>
		</div>
	);
}

// Global type extension for Google Analytics
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}