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
	Moon,
	Sun,
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
import { useTheme } from "next-themes";

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
	const { theme, setTheme } = useTheme();

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

	const handleTheme = useCallback(() => {
		setTheme(theme === "dark" ? "light" : "dark");
	}, [theme, setTheme]);

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
					<div className="flex-1 overflow-y-auto">{/* Content sections would go here */}</div>

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
						{/* Account Button - Hidden temporarily while testing
						<Button
							variant="ghost"
							size="sm"
							onClick={() => handleNavigate("/account")}
							className="flex flex-col items-center justify-center h-auto py-2 text-xs text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-transparent"
						>
							<User className="h-5 w-5 mb-1" />
							<span>Account</span>
						</Button>
						*/}
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
						<Button
							variant="ghost"
							size="sm"
							onClick={handleTheme}
							className="flex flex-col items-center justify-center h-auto py-2 text-xs text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-transparent"
						>
							{theme === "light" ? <Moon className="h-5 w-5 mb-1" /> : <Sun className="h-5 w-5 mb-1" />}
							<span>{theme === "light" ? "Dark" : "Light"}</span>
						</Button>
					</div>
				</SheetContent>
			</Sheet>
		</>
	);
}
