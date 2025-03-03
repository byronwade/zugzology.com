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
	Search,
	Home,
	Settings,
	Info,
	Bookmark,
	PanelRight,
	ChevronDown,
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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

export function MenuSheetFixed({ items }: MenuSheetProps) {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const [collections, setCollections] = useState<ShopifyCollection[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [touchStart, setTouchStart] = useState<number | null>(null);
	const [activeSection, setActiveSection] = useState<string>("shop");
	const [searchQuery, setSearchQuery] = useState<string>("");
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
			setIsLoading(true);
			getAllCollections()
				.then((fetchedCollections) => {
					setCollections(fetchedCollections);
				})
				.catch((error) => {
					console.error("Error fetching collections:", error);
				})
				.finally(() => {
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

	const handleCartClick = useCallback(() => {
		setIsOpen(false);
		// Use requestAnimationFrame to ensure the menu sheet closes before opening the cart
		requestAnimationFrame(() => {
			openCart();
		});
	}, [openCart]);

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

	// Filter collections based on search query
	const filteredCollections =
		searchQuery.trim() !== ""
			? collections.filter(
					(collection) =>
						collection.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
						(collection.description && collection.description.toLowerCase().includes(searchQuery.toLowerCase()))
			  )
			: [];

	// Get recent collections
	const recentCollections = collections.slice(0, 5);

	// Group menu items by category
	const mainNavItems = items.filter((item) => !item.url.includes("/collections/") && !item.url.includes("/products/"));
	const productRelatedItems = items.filter(
		(item) => item.url.includes("/collections/") || item.url.includes("/products/")
	);

	return (
		<>
			<Button
				variant="ghost"
				onClick={() => setIsOpen(true)}
				className="flex items-center gap-2 h-9 px-3 ml-1 rounded-md text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
			>
				<Menu className="h-5 w-5" />
				<span className="text-sm font-medium">Menu</span>
			</Button>
			<Sheet open={isOpen} onOpenChange={handleSheetOpenChange}>
				<SheetContent
					side="left"
					className="w-full sm:max-w-md p-0 border-0 bg-white dark:bg-gray-950 flex flex-col h-full"
					onTouchStart={handleTouchStart}
					onTouchMove={handleTouchMove}
					onTouchEnd={handleTouchEnd}
				>
					{/* Modern header with search */}
					<div className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
						<div className="p-4 flex items-center justify-between">
							<SheetTitle className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
								<ShoppingBag className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
								Zugzology
							</SheetTitle>
						</div>

						{/* Search bar */}
						<div className="px-4 pb-4">
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
								</div>
								<input
									type="text"
									placeholder="Search collections..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="w-full py-2 pl-10 pr-4 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors"
								/>
							</div>
						</div>

						{/* Main navigation */}
						<div className="flex px-4 border-t border-gray-200 dark:border-gray-800">
							<button
								onClick={() => setActiveSection("shop")}
								className={cn(
									"flex-1 py-3 px-2 text-sm font-medium text-center transition-colors relative",
									activeSection === "shop"
										? "text-indigo-600 dark:text-indigo-400"
										: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
								)}
							>
								<div className="flex flex-col items-center gap-1">
									<ShoppingBasket className="h-5 w-5" />
									<span>Shop</span>
								</div>
								{activeSection === "shop" && (
									<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"></span>
								)}
							</button>
							<button
								onClick={() => setActiveSection("categories")}
								className={cn(
									"flex-1 py-3 px-2 text-sm font-medium text-center transition-colors relative",
									activeSection === "categories"
										? "text-indigo-600 dark:text-indigo-400"
										: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
								)}
							>
								<div className="flex flex-col items-center gap-1">
									<Grid className="h-5 w-5" />
									<span>Categories</span>
								</div>
								{activeSection === "categories" && (
									<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"></span>
								)}
							</button>
							<button
								onClick={() => setActiveSection("explore")}
								className={cn(
									"flex-1 py-3 px-2 text-sm font-medium text-center transition-colors relative",
									activeSection === "explore"
										? "text-indigo-600 dark:text-indigo-400"
										: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
								)}
							>
								<div className="flex flex-col items-center gap-1">
									<Compass className="h-5 w-5" />
									<span>Explore</span>
								</div>
								{activeSection === "explore" && (
									<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"></span>
								)}
							</button>
						</div>
					</div>

					{/* Main content with search results or sections */}
					<div className="flex-1 overflow-y-auto">
						{/* Search results */}
						{searchQuery.trim() !== "" && (
							<div className="p-4">
								<h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
									Search results for "{searchQuery}"
								</h3>
								{filteredCollections.length > 0 ? (
									<div className="space-y-2">
										{filteredCollections.map((collection) => (
											<Link
												key={collection.id}
												href={`/collections/${collection.handle}`}
												onClick={(e) => handleNavigate(`/collections/${collection.handle}`, e)}
												className="flex items-start p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
											>
												<div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
													{collection.image ? (
														<Image src={collection.image.url} alt={collection.title} fill className="object-cover" />
													) : (
														<div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700" />
													)}
												</div>
												<div className="ml-3 flex-1">
													<h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">{collection.title}</h4>
													{collection.description && (
														<p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
															{collection.description}
														</p>
													)}
												</div>
											</Link>
										))}
									</div>
								) : (
									<div className="text-center py-8">
										<p className="text-gray-500 dark:text-gray-400 text-sm">No results found</p>
										<p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Try another search term</p>
									</div>
								)}
							</div>
						)}

						{/* Shop Section Content */}
						{searchQuery.trim() === "" && activeSection === "shop" && (
							<div className="py-2">
								{/* Featured Collections */}
								{organizedCollections.featured.length > 0 && (
									<div className="px-4 py-3">
										<h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
											Featured Collections
										</h3>
										<div className="grid grid-cols-2 gap-3">
											{organizedCollections.featured.slice(0, 4).map((collection) => (
												<Link
													key={collection.id}
													href={`/collections/${collection.handle}`}
													onClick={(e) => handleNavigate(`/collections/${collection.handle}`, e)}
													className="group relative overflow-hidden rounded-lg aspect-square shadow-sm"
												>
													{collection.image ? (
														<Image
															src={collection.image.url}
															alt={collection.title}
															fill
															className="object-cover transition-transform duration-300 group-hover:scale-105"
														/>
													) : (
														<div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700" />
													)}
													<div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
													<div className="absolute inset-0 flex items-center justify-center p-2">
														<span className="text-white font-medium text-sm px-2 py-1 bg-black/50 rounded-md text-center">
															{collection.title}
														</span>
													</div>
												</Link>
											))}
										</div>
									</div>
								)}

								{/* Popular Categories */}
								<div className="mt-2 px-4 py-3">
									<h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
										Popular Categories
									</h3>
									<div className="grid grid-cols-2 gap-2">
										<Button
											variant="outline"
											onClick={() => handleNavigate("/products")}
											className="justify-center h-auto py-3 text-sm border-gray-200 dark:border-gray-800 hover:border-indigo-600 dark:hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-900 dark:text-white transition-all"
										>
											All Products
										</Button>
										<Button
											variant="outline"
											onClick={() => handleNavigate("/collections/new-arrivals")}
											className="justify-center h-auto py-3 text-sm border-gray-200 dark:border-gray-800 hover:border-indigo-600 dark:hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-900 dark:text-white transition-all"
										>
											New Arrivals
										</Button>
										<Button
											variant="outline"
											onClick={() => handleNavigate("/collections/sale")}
											className="justify-center h-auto py-3 text-sm border-gray-200 dark:border-gray-800 hover:border-indigo-600 dark:hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-900 dark:text-white transition-all"
										>
											Sale
										</Button>
										<Button
											variant="outline"
											onClick={() => handleNavigate("/blogs")}
											className="justify-center h-auto py-3 text-sm border-gray-200 dark:border-gray-800 hover:border-indigo-600 dark:hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-900 dark:text-white transition-all"
										>
											Blog
										</Button>
									</div>
								</div>

								{/* Recently Viewed */}
								<div className="mt-2 px-4 py-3">
									<h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
										<Clock className="h-4 w-4 text-gray-400" />
										Recently Viewed
									</h3>
									<div className="space-y-2">
										{recentCollections.slice(0, 3).map((collection) => (
											<Link
												key={collection.id}
												href={`/collections/${collection.handle}`}
												onClick={(e) => handleNavigate(`/collections/${collection.handle}`, e)}
												className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group"
											>
												<div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
													{collection.image ? (
														<Image src={collection.image.url} alt={collection.title} fill className="object-cover" />
													) : (
														<div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700" />
													)}
												</div>
												<div className="ml-3 flex-1">
													<h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
														{collection.title}
													</h4>
												</div>
												<ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
											</Link>
										))}
									</div>
								</div>

								{/* Featured Products Section */}
								<div className="mt-2 px-4 py-3 border-t border-gray-200 dark:border-gray-800">
									<h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
										<Sparkles className="h-4 w-4 text-gray-400" />
										Featured Products
									</h3>
									<div className="px-3 py-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
										<p className="text-sm text-gray-900 dark:text-gray-100 mb-2">
											Discover our exclusive selection of high-quality mushroom cultivation supplies
										</p>
										<Button
											onClick={() => handleNavigate("/collections/featured")}
											className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-2"
										>
											Shop Featured Products
										</Button>
									</div>
								</div>
							</div>
						)}

						{/* Categories Section Content */}
						{searchQuery.trim() === "" && activeSection === "categories" && (
							<div className="py-2">
								<Accordion type="single" collapsible className="w-full">
									{Object.entries(organizedCollections.categories).map(([category, categoryCollections]) => (
										<AccordionItem
											key={category}
											value={category}
											className="border-b border-gray-200 dark:border-gray-800"
										>
											<AccordionTrigger className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900">
												{category}
											</AccordionTrigger>
											<AccordionContent className="px-4 pb-3">
												<div className="space-y-1 pl-2">
													{categoryCollections.map((collection) => (
														<Link
															key={collection.id}
															href={`/collections/${collection.handle}`}
															onClick={(e) => handleNavigate(`/collections/${collection.handle}`, e)}
															className="flex items-center py-2 px-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
														>
															<span className="text-sm">{collection.title}</span>
															<ChevronRight className="h-4 w-4 ml-auto text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
														</Link>
													))}
												</div>
											</AccordionContent>
										</AccordionItem>
									))}
								</Accordion>
							</div>
						)}

						{/* Explore Section Content */}
						{searchQuery.trim() === "" && activeSection === "explore" && (
							<div className="py-2">
								{/* Main Navigation Links */}
								<div className="px-4 py-3">
									<h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
										<Compass className="h-4 w-4 text-gray-400" />
										Navigation
									</h3>
									<div className="space-y-1">
										{mainNavItems.map((item) => (
											<Link
												key={item.id}
												href={item.url}
												onClick={(e) => handleNavigate(item.url, e)}
												className="flex items-center justify-between py-2.5 px-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group"
											>
												<span className="text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-sm">
													{item.title}
												</span>
												<ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
											</Link>
										))}
									</div>
								</div>

								{/* Learning Resources */}
								<div className="mt-2 px-4 py-3 border-t border-gray-200 dark:border-gray-800">
									<h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
										<Bookmark className="h-4 w-4 text-gray-400" />
										Learning Resources
									</h3>
									<div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
										<h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-2">
											Mushroom Cultivation Guide
										</h4>
										<p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
											Learn how to grow your own mushrooms with our comprehensive guides and tutorials.
										</p>
										<Button
											variant="outline"
											onClick={() => handleNavigate("/blogs/myceliums-gambit")}
											className="w-full justify-center gap-2 text-sm"
										>
											<span>Visit Our Blog</span>
											<ArrowRight className="h-4 w-4" />
										</Button>
									</div>
								</div>

								{/* About Us */}
								<div className="mt-2 px-4 py-3">
									<h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
										<Info className="h-4 w-4 text-gray-400" />
										About Us
									</h3>
									<div className="space-y-1">
										<Link
											href="/about"
											onClick={(e) => handleNavigate("/about", e)}
											className="flex items-center justify-between py-2.5 px-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group"
										>
											<span className="text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-sm">
												Our Story
											</span>
											<ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
										</Link>
										<Link
											href="/contact"
											onClick={(e) => handleNavigate("/contact", e)}
											className="flex items-center justify-between py-2.5 px-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group"
										>
											<span className="text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-sm">
												Contact Us
											</span>
											<ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
										</Link>
										<Link
											href="/faq"
											onClick={(e) => handleNavigate("/faq", e)}
											className="flex items-center justify-between py-2.5 px-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group"
										>
											<span className="text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-sm">
												FAQ
											</span>
											<ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
										</Link>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Footer navigation */}
					<div className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 grid grid-cols-4 gap-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => handleNavigate("/")}
							className="flex flex-col items-center justify-center h-auto py-2 text-xs text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-transparent"
						>
							<Home className="h-5 w-5 mb-1" />
							<span>Home</span>
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => handleNavigate("/account")}
							className="flex flex-col items-center justify-center h-auto py-2 text-xs text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-transparent"
						>
							<User className="h-5 w-5 mb-1" />
							<span>Account</span>
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => handleNavigate("/wishlist")}
							className="flex flex-col items-center justify-center h-auto py-2 text-xs text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-transparent"
						>
							<Heart className="h-5 w-5 mb-1" />
							<span>Wishlist</span>
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={handleCartClick}
							className="flex flex-col items-center justify-center h-auto py-2 text-xs text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-transparent"
						>
							<ShoppingCart className="h-5 w-5 mb-1" />
							<span>Cart</span>
						</Button>
					</div>
				</SheetContent>
			</Sheet>
		</>
	);
}
