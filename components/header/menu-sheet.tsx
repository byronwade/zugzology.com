"use client";

import { useState, useCallback, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
	Menu,
	ChevronRight,
	ShoppingBag,
	Sparkles,
	ShoppingBasket,
	Heart,
	User,
	ShoppingCart,
	Loader2,
	Grid,
	Compass,
	Tag,
	Clock,
	ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/providers/cart-provider";
import { getAllCollections } from "@/lib/actions/shopify";
import type { ShopifyCollection } from "@/lib/types";
import Image from "next/image";

interface MenuItem {
	id: string;
	title: string;
	url: string;
	items?: MenuItem[];
}

interface MenuSheetProps {
	items: MenuItem[];
}

interface CollectionMetafield {
	id: string;
	namespace: string;
	key: string;
	value: string;
	type: string;
}

export function MenuSheet({ items }: MenuSheetProps) {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const [collections, setCollections] = useState<ShopifyCollection[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [touchStart, setTouchStart] = useState<number | null>(null);
	const [activeTab, setActiveTab] = useState<string>("shop");
	const { openCart } = useCart();

	// Handle touch events for swipe to dismiss
	const handleTouchStart = useCallback((e: React.TouchEvent) => {
		setTouchStart(e.touches[0].clientX);
	}, []);

	const handleTouchMove = useCallback(
		(e: React.TouchEvent) => {
			if (!touchStart) return;

			const currentTouch = e.touches[0].clientX;
			const diff = touchStart - currentTouch;

			// If swiped left more than 100px, close the sheet
			if (diff > 100) {
				setIsOpen(false);
			}
		},
		[touchStart]
	);

	const handleTouchEnd = useCallback(() => {
		setTouchStart(null);
	}, []);

	// Fetch collections when the sheet opens
	useEffect(() => {
		if (isOpen && collections.length === 0) {
			getAllCollections().then((fetchedCollections: ShopifyCollection[]) => {
				setCollections(fetchedCollections);
				setIsLoading(false);
			});
		}
	}, [isOpen, collections.length]);

	const handleNavigate = useCallback(
		(url: string, event?: React.MouseEvent | KeyboardEvent) => {
			if (event) {
				event.preventDefault();
			}
			setIsOpen(false);
			// Use requestAnimationFrame to ensure the sheet closes before navigation
			requestAnimationFrame(() => {
				router.push(url);
			});
		},
		[router]
	);

	const handleCartClick = useCallback(
		(e?: React.MouseEvent) => {
			if (e) {
				e.preventDefault();
			}
			setIsOpen(false);
			// Use requestAnimationFrame to ensure the menu sheet closes before opening the cart
			requestAnimationFrame(() => {
				openCart();
			});
		},
		[openCart]
	);

	const handleSheetOpenChange = useCallback((open: boolean) => {
		setIsOpen(open);
	}, []);

	// Organize collections into categories
	const organizedCollections = collections.reduce<{
		featured: ShopifyCollection[];
		categories: Record<string, ShopifyCollection[]>;
	}>(
		(acc, collection) => {
			const isFeatured =
				collection.metafields?.nodes?.find((m: CollectionMetafield) => m.key === "featured")?.value === "true";
			const category =
				collection.metafields?.nodes?.find((m: CollectionMetafield) => m.key === "category")?.value || "Other";

			if (isFeatured) {
				acc.featured.push(collection);
			}

			if (!acc.categories[category]) {
				acc.categories[category] = [];
			}
			acc.categories[category].push(collection);

			return acc;
		},
		{ featured: [], categories: {} }
	);

	// Get recent collections (for the "Recent" tab)
	const recentCollections = collections.slice(0, 5);

	return (
		<>
			<Button
				variant="ghost"
				size="icon"
				onClick={() => setIsOpen(true)}
				className="h-9 w-9 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
			>
				<Menu className="h-5 w-5" />
				<span className="sr-only">Menu</span>
			</Button>
			<Sheet open={isOpen} onOpenChange={handleSheetOpenChange}>
				<SheetContent
					side="left"
					className="w-full sm:max-w-md p-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
					onTouchStart={handleTouchStart}
					onTouchMove={handleTouchMove}
					onTouchEnd={handleTouchEnd}
				>
					{/* Squarespace-style header with logo */}
					<SheetHeader className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
						<div className="flex items-center justify-between">
							<SheetTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
								<ShoppingBag className="h-5 w-5 text-purple-600" />
								Zugzology
							</SheetTitle>
						</div>
					</SheetHeader>

					{/* Squarespace-style tabs */}
					<div className="border-b border-gray-200 dark:border-gray-800">
						<div className="flex">
							<button
								onClick={() => setActiveTab("shop")}
								className={cn(
									"flex-1 py-4 px-4 text-sm font-medium text-center border-b-2 transition-colors",
									activeTab === "shop"
										? "border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400"
										: "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
								)}
							>
								Shop
							</button>
							<button
								onClick={() => setActiveTab("categories")}
								className={cn(
									"flex-1 py-4 px-4 text-sm font-medium text-center border-b-2 transition-colors",
									activeTab === "categories"
										? "border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400"
										: "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
								)}
							>
								Categories
							</button>
							<button
								onClick={() => setActiveTab("recent")}
								className={cn(
									"flex-1 py-4 px-4 text-sm font-medium text-center border-b-2 transition-colors",
									activeTab === "recent"
										? "border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400"
										: "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
								)}
							>
								Recent
							</button>
						</div>
					</div>

					<div className="overflow-y-auto h-full pb-20">
						{isLoading ? (
							<div className="flex flex-col items-center justify-center h-64 gap-3">
								<Loader2 className="h-8 w-8 animate-spin text-purple-600" />
								<p className="text-sm text-gray-500 dark:text-gray-400">Loading collections...</p>
							</div>
						) : (
							<>
								{/* Shop Tab Content */}
								{activeTab === "shop" && (
									<div className="py-4">
										{/* Featured Collections in a grid layout */}
										{organizedCollections.featured.length > 0 && (
											<div className="px-6 py-5">
												<h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4 flex items-center gap-2">
													<Sparkles className="h-4 w-4 text-purple-600" />
													Featured Collections
												</h3>
												<div className="grid grid-cols-2 gap-4">
													{organizedCollections.featured.map((collection) => (
														<Link
															key={collection.id}
															href={`/collections/${collection.handle}`}
															onClick={(e) => handleNavigate(`/collections/${collection.handle}`, e)}
															className="group relative overflow-hidden rounded-lg aspect-square"
														>
															{collection.image ? (
																<Image
																	src={collection.image.url}
																	alt={collection.title}
																	fill
																	className="object-cover transition-transform duration-300 group-hover:scale-105"
																/>
															) : (
																<div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30" />
															)}
															<div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
															<div className="absolute inset-0 flex items-center justify-center">
																<span className="text-white font-medium text-lg px-3 py-2 bg-black/40 rounded-md">
																	{collection.title}
																</span>
															</div>
														</Link>
													))}
												</div>
											</div>
										)}

										{/* Main navigation links */}
										<div className="px-6 py-5">
											<h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4 flex items-center gap-2">
												<Compass className="h-4 w-4 text-purple-600" />
												Main Navigation
											</h3>
											<div className="space-y-3">
												{items.map((item) => (
													<Link
														key={item.id}
														href={item.url}
														onClick={(e) => handleNavigate(item.url, e)}
														className="flex items-center justify-between py-3 px-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
													>
														<span className="text-gray-800 dark:text-gray-200 font-medium group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
															{item.title}
														</span>
														{item.items && item.items.length > 0 && (
															<ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
														)}
													</Link>
												))}
											</div>
										</div>

										{/* Quick links */}
										<div className="px-6 py-5 border-t border-gray-200 dark:border-gray-800">
											<h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4 flex items-center gap-2">
												<Grid className="h-4 w-4 text-purple-600" />
												Quick Links
											</h3>
											<div className="grid grid-cols-2 gap-3">
												<Button
													variant="outline"
													onClick={() => handleNavigate("/products")}
													className="justify-start gap-2 h-auto py-3 border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
												>
													<ShoppingBasket className="h-4 w-4 text-purple-600" />
													<span>All Products</span>
												</Button>
												<Button
													variant="outline"
													onClick={() => handleNavigate("/collections/new-arrivals")}
													className="justify-start gap-2 h-auto py-3 border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
												>
													<Tag className="h-4 w-4 text-purple-600" />
													<span>New Arrivals</span>
												</Button>
												<Button
													variant="outline"
													onClick={() => handleNavigate("/collections/sale")}
													className="justify-start gap-2 h-auto py-3 border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
												>
													<Tag className="h-4 w-4 text-purple-600" />
													<span>Sale</span>
												</Button>
												<Button
													variant="outline"
													onClick={() => handleNavigate("/blogs")}
													className="justify-start gap-2 h-auto py-3 border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
												>
													<Tag className="h-4 w-4 text-purple-600" />
													<span>Blog</span>
												</Button>
											</div>
										</div>
									</div>
								)}

								{/* Categories Tab Content */}
								{activeTab === "categories" && (
									<div className="py-4">
										{Object.entries(organizedCollections.categories).map(([category, categoryCollections]) => (
											<div
												key={category}
												className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 last:border-0"
											>
												<h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">
													{category}
												</h3>
												<div className="space-y-2">
													{categoryCollections.map((collection) => (
														<Link
															key={collection.id}
															href={`/collections/${collection.handle}`}
															onClick={(e) => handleNavigate(`/collections/${collection.handle}`, e)}
															className="flex items-center justify-between py-2.5 px-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
														>
															<div className="flex items-center gap-3">
																<div className="w-8 h-8 rounded-md bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
																	<ShoppingBasket className="h-4 w-4 text-purple-600 dark:text-purple-400" />
																</div>
																<span className="text-gray-800 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
																	{collection.title}
																</span>
															</div>
															<ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
														</Link>
													))}
												</div>
											</div>
										))}
									</div>
								)}

								{/* Recent Tab Content */}
								{activeTab === "recent" && (
									<div className="py-4">
										<div className="px-6 py-4">
											<h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4 flex items-center gap-2">
												<Clock className="h-4 w-4 text-purple-600" />
												Recently Viewed
											</h3>
											<div className="space-y-4">
												{recentCollections.map((collection) => (
													<Link
														key={collection.id}
														href={`/collections/${collection.handle}`}
														onClick={(e) => handleNavigate(`/collections/${collection.handle}`, e)}
														className="flex items-start gap-3 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
													>
														<div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
															{collection.image ? (
																<Image
																	src={collection.image.url}
																	alt={collection.title}
																	fill
																	className="object-cover"
																/>
															) : (
																<div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30" />
															)}
														</div>
														<div className="flex-1">
															<h4 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
																{collection.title}
															</h4>
															{collection.description && (
																<p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
																	{collection.description}
																</p>
															)}
														</div>
													</Link>
												))}
											</div>

											<div className="mt-6">
												<Button
													variant="outline"
													onClick={() => handleNavigate("/products")}
													className="w-full justify-center gap-2 border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
												>
													<span>View All Products</span>
													<ArrowRight className="h-4 w-4" />
												</Button>
											</div>
										</div>
									</div>
								)}
							</>
						)}
					</div>

					{/* Footer with account, wishlist, and cart buttons */}
					<div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
						<div className="grid grid-cols-3 gap-3">
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									handleNavigate("/account");
									setIsOpen(false);
								}}
								className="flex items-center justify-center gap-2 rounded-md border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-purple-700 dark:hover:text-purple-400 hover:border-purple-200 dark:hover:border-purple-800 transition-colors"
							>
								<User className="h-4 w-4" />
								<span className="sr-only sm:not-sr-only sm:text-xs">Account</span>
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									handleNavigate("/wishlist");
									setIsOpen(false);
								}}
								className="flex items-center justify-center gap-2 rounded-md border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-purple-700 dark:hover:text-purple-400 hover:border-purple-200 dark:hover:border-purple-800 transition-colors"
							>
								<Heart className="h-4 w-4" />
								<span className="sr-only sm:not-sr-only sm:text-xs">Wishlist</span>
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									handleCartClick();
								}}
								className="flex items-center justify-center gap-2 rounded-md border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-purple-700 dark:hover:text-purple-400 hover:border-purple-200 dark:hover:border-purple-800 transition-colors"
							>
								<ShoppingCart className="h-4 w-4" />
								<span className="sr-only sm:not-sr-only sm:text-xs">Cart</span>
							</Button>
						</div>
					</div>
				</SheetContent>
			</Sheet>
		</>
	);
}
