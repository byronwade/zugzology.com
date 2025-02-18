"use client";

import { useEffect, useState } from "react";
import { getProduct, createCart, addToCart, getProducts, getAllBlogPosts } from "@/lib/actions/shopify";
import { ShopifyProduct, ShopifyCart, CartItem, ShopifyBlogArticle } from "@/lib/types";
import { ProductList } from "@/components/products/product-list";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { HistoryRecommendations } from "@/components/products/sections/history-recommendations";
import { RelatedProducts } from "@/components/products/sections/related-products";
import { RecentPosts } from "@/components/blog/recent-posts";
import { useWishlist } from "@/lib/providers/wishlist-provider";

export default function WishlistPage() {
	const { wishlist, removeFromWishlist } = useWishlist();
	const [wishlistProducts, setWishlistProducts] = useState<ShopifyProduct[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isBuying, setIsBuying] = useState(false);
	const [historyProducts, setHistoryProducts] = useState<ShopifyProduct[]>([]);
	const [recommendedProducts, setRecommendedProducts] = useState<ShopifyProduct[]>([]);
	const [randomProducts, setRandomProducts] = useState<ShopifyProduct[]>([]);
	const [recentPosts, setRecentPosts] = useState<ShopifyBlogArticle[]>([]);

	const loadWishlistProducts = async () => {
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

	// Load wishlist products when wishlist changes
	useEffect(() => {
		loadWishlistProducts();
	}, [wishlist]);

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

	const handleRemoveFromWishlist = (handle: string) => {
		removeFromWishlist(handle);
	};

	const clearWishlist = () => {
		localStorage.setItem("wishlist", "[]");
		setWishlistProducts([]);
		toast.success("Wishlist cleared");
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
							<div className="flex gap-4">
								<Button variant="outline" disabled className="flex items-center gap-2">
									<Trash2 className="h-4 w-4" />
									Clear All
								</Button>
								<Button disabled className="flex items-center gap-2">
									<ShoppingCart className="h-4 w-4" />
									Buy All Items
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
							<div className="flex gap-4">
								<Button variant="outline" disabled className="flex items-center gap-2">
									<Trash2 className="h-4 w-4" />
									Clear All
								</Button>
								<Button disabled className="flex items-center gap-2">
									<ShoppingCart className="h-4 w-4" />
									Buy All Items
								</Button>
							</div>
						</div>
					</div>
				</div>
				<div className="p-4">
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<p className="text-lg text-muted-foreground mb-4">Your wishlist is empty</p>
						<Button asChild>
							<a href="/products">Browse Products</a>
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full">
			<div className="sticky top-[56px] z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="px-4 py-3 border-b">
					<div className="flex items-center justify-between mx-auto">
						<h1 className="text-2xl font-bold">Your Wishlist</h1>
						<div className="flex gap-4">
							<Button variant="outline" onClick={clearWishlist} className="flex items-center gap-2" disabled={isBuying}>
								<Trash2 className="h-4 w-4" />
								Clear All
							</Button>
							<Button onClick={buyAllItems} className="flex items-center gap-2" disabled={isBuying}>
								{isBuying ? (
									<>
										<ShoppingCart className="h-4 w-4 animate-spin" />
										Processing...
									</>
								) : (
									<>
										<ShoppingCart className="h-4 w-4" />
										Buy All Items ({wishlistProducts.length})
									</>
								)}
							</Button>
						</div>
					</div>
				</div>
			</div>
			<div className="p-4">
				<ProductList products={wishlistProducts} onRemoveFromWishlist={handleRemoveFromWishlist} />

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
