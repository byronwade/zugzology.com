"use client";

import { useState, useCallback, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Menu, ChevronRight, Sprout, Package, Tag, Users, Star, ShoppingBag, Sparkles, Clock, TrendingUp, Flame, Microscope, Leaf, Beaker, ShoppingBasket, Percent, Zap, Heart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/providers/cart-provider";
import { getAllCollections } from "@/lib/actions/shopify";
import type { ShopifyCollection } from "@/lib/types";

interface MenuItem {
	id: string;
	title: string;
	url: string;
	items?: MenuItem[];
}

interface MenuSheetProps {
	items: MenuItem[];
}

interface CategoryGroup {
	title: string;
	collections: ShopifyCollection[];
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
	const [shouldOpenCart, setShouldOpenCart] = useState(false);
	const [collections, setCollections] = useState<ShopifyCollection[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [touchStart, setTouchStart] = useState<number | null>(null);
	const { openCart } = useCart();

	// Handle touch events for swipe to dismiss
	const handleTouchStart = (e: React.TouchEvent) => {
		setTouchStart(e.touches[0].clientX);
	};

	const handleTouchMove = (e: React.TouchEvent) => {
		if (!touchStart) return;

		const currentTouch = e.touches[0].clientX;
		const diff = touchStart - currentTouch;

		// If swiped left more than 100px, close the sheet
		if (diff > 100) {
			setIsOpen(false);
		}
	};

	const handleTouchEnd = () => {
		setTouchStart(null);
	};

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
		(e: React.MouseEvent) => {
			e.preventDefault();
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
			const isFeatured = collection.metafields?.nodes?.find((m: CollectionMetafield) => m.key === "featured")?.value === "true";
			const category = collection.metafields?.nodes?.find((m: CollectionMetafield) => m.key === "category")?.value || "Other";

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

	return (
		<Sheet open={isOpen} onOpenChange={handleSheetOpenChange}>
			<SheetTrigger asChild>
				<Button variant="ghost" className="justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs flex items-center gap-2 shrink-0 mr-4">
					<Menu className="w-4 h-4" />
					<span className="font-medium">All</span>
				</Button>
			</SheetTrigger>
			<SheetContent side="left" className="w-full sm:max-w-md p-0 gap-0 flex flex-col" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
				<SheetHeader className="px-6 py-4 border-b flex-shrink-0">
					<SheetTitle>Shop by Category</SheetTitle>
				</SheetHeader>

				<div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
					<ScrollArea className="flex-1">
						<div className="flex flex-col">
							{isLoading ? (
								<div className="p-8 text-center">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
									<p className="text-sm text-muted-foreground mt-2">Loading categories...</p>
								</div>
							) : (
								<>
									{/* Quick Actions */}
									<div className="grid grid-cols-3 gap-2 p-4 border-b">
										<Link href="/collections/sale" onClick={(e) => handleNavigate("/collections/sale", e)} className="flex flex-col items-center justify-center p-4 rounded-lg bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors text-center group">
											<div className="mb-2 p-2 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400">
												<Percent className="w-4 h-4" />
											</div>
											<span className="text-sm font-medium text-red-600 dark:text-red-400">On Sale</span>
										</Link>
										<Link href="/collections/best-sellers" onClick={(e) => handleNavigate("/collections/best-sellers", e)} className="flex flex-col items-center justify-center p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/30 transition-colors text-center group">
											<div className="mb-2 p-2 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
												<Star className="w-4 h-4" />
											</div>
											<span className="text-sm font-medium text-amber-600 dark:text-amber-400">Best Sellers</span>
										</Link>
										<Link href="/collections/new-arrivals" onClick={(e) => handleNavigate("/collections/new-arrivals", e)} className="flex flex-col items-center justify-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-950/30 transition-colors text-center group">
											<div className="mb-2 p-2 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
												<Zap className="w-4 h-4" />
											</div>
											<span className="text-sm font-medium text-purple-600 dark:text-purple-400">New Arrivals</span>
										</Link>
									</div>

									{/* Featured Collections */}
									{organizedCollections.featured.length > 0 && (
										<div className="py-4 border-b">
											<div className="px-4 mb-2">
												<h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
													<Sparkles className="w-4 h-4" />
													Featured Collections
												</h2>
											</div>
											<div className="px-2 space-y-1">
												{organizedCollections.featured.map((collection) => (
													<Link key={collection.id} href={`/collections/${collection.handle}`} onClick={(e) => handleNavigate(`/collections/${collection.handle}`, e)} className="flex items-center gap-3 px-4 py-2 hover:bg-accent rounded-md transition-colors group">
														{collection.image ? (
															<div className="w-8 h-8 rounded-md overflow-hidden bg-background/80 group-hover:bg-background transition-colors">
																<img src={collection.image.url} alt={collection.title} className="w-full h-full object-cover" />
															</div>
														) : (
															<div className="w-8 h-8 rounded-md bg-background/80 group-hover:bg-background transition-colors flex items-center justify-center">
																<ShoppingBasket className="w-4 h-4 text-foreground/70" />
															</div>
														)}
														<div className="flex-1 min-w-0">
															<div className="flex items-center gap-2">
																<span className="text-sm font-medium truncate">{collection.title}</span>
																{collection.products.nodes.length > 0 && (
																	<Badge variant="secondary" className="shrink-0">
																		{collection.products.nodes.length}
																	</Badge>
																)}
															</div>
															{collection.description && <p className="text-xs text-muted-foreground line-clamp-1">{collection.description}</p>}
														</div>
													</Link>
												))}
											</div>
										</div>
									)}

									{/* Categorized Collections */}
									{Object.entries(organizedCollections.categories).map(([category, categoryCollections]) => (
										<div key={category} className="py-4 border-b last:border-b-0">
											<div className="px-4 mb-2">
												<h2 className="text-sm font-medium text-muted-foreground">{category}</h2>
											</div>
											<div className="px-2 space-y-1">
												{categoryCollections.map((collection) => (
													<Link key={collection.id} href={`/collections/${collection.handle}`} onClick={(e) => handleNavigate(`/collections/${collection.handle}`, e)} className="flex items-center gap-3 px-4 py-2 hover:bg-accent rounded-md transition-colors group">
														{collection.image ? (
															<div className="w-8 h-8 rounded-md overflow-hidden bg-background/80 group-hover:bg-background transition-colors">
																<img src={collection.image.url} alt={collection.title} className="w-full h-full object-cover" />
															</div>
														) : (
															<div className="w-8 h-8 rounded-md bg-background/80 group-hover:bg-background transition-colors flex items-center justify-center">
																<ShoppingBasket className="w-4 h-4 text-foreground/70" />
															</div>
														)}
														<div className="flex-1 min-w-0">
															<div className="flex items-center gap-2">
																<span className="text-sm truncate">{collection.title}</span>
																{collection.products.nodes.length > 0 && (
																	<Badge variant="secondary" className="shrink-0">
																		{collection.products.nodes.length}
																	</Badge>
																)}
															</div>
														</div>
													</Link>
												))}
											</div>
										</div>
									))}
								</>
							)}
						</div>
					</ScrollArea>

					{/* Account, Wishlist & Cart - Now outside ScrollArea */}
					<div className="p-4 border-t bg-muted/40 flex-shrink-0">
						<div className="flex items-center justify-between gap-2">
							<Button variant="outline" className="flex-1 bg-background hover:bg-accent" onClick={(e) => handleNavigate("/account", e)}>
								<Users className="mr-2 h-4 w-4" />
								Account
							</Button>
							<Button variant="outline" className="flex-1 bg-background hover:bg-accent" onClick={(e) => handleNavigate("/wishlist", e)}>
								<Heart className="mr-2 h-4 w-4" />
								Wishlist
							</Button>
							<Button variant="outline" onClick={handleCartClick} className="flex-1 bg-background hover:bg-accent">
								<ShoppingBag className="mr-2 h-4 w-4" />
								Cart
							</Button>
						</div>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
