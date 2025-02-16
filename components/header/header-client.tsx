"use client";

import Image from "next/image";
import { Link } from "@/components/ui/link";
import { Search, Sun, Moon, Sprout, User, ShoppingCart, Menu, Sparkles, X, ChevronRight, Brain, TestTube, Leaf, BookOpen, ShoppingBag, Star, Tag, Package, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/providers/cart-provider";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import type { ShopifyBlog } from "@/lib/types";
import { SearchDropdown } from "@/components/search/search-dropdown";
import { useSearch } from "@/lib/providers/search-provider";
import Cookies from "js-cookie";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getCustomer } from "@/lib/services/shopify-customer";

interface MenuItem {
	id: string;
	title: string;
	url: string;
	items?: MenuItem[];
}

interface HeaderClientProps {
	initialMenuItems: MenuItem[];
	blogs: ShopifyBlog[];
	isAuthenticated: boolean;
}

interface MicroDosingCard {
	title: string;
	description: string;
	href: string;
	icon: "Brain" | "TestTube" | "Leaf" | "BookOpen";
	tag: string;
}

export function HeaderClient({ initialMenuItems, blogs, isAuthenticated }: HeaderClientProps) {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const [authState, setAuthState] = useState(isAuthenticated);
	const router = useRouter();
	const { openCart, cart, isInitialized } = useCart();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isSheetOpen, setIsSheetOpen] = useState(false);
	const { searchQuery, setSearchQuery, isSearching, setIsDropdownOpen, searchResults, allProducts, isDropdownOpen } = useSearch();
	const [inputValue, setInputValue] = useState("");

	// Handle initial mount and auth state changes
	useEffect(() => {
		console.log("💫 [Header Client] Component mounted, initial auth:", isAuthenticated);
		setMounted(true);
		setAuthState(isAuthenticated);
	}, [isAuthenticated]);

	// Return null only for initial mount
	if (!mounted) {
		console.log("⏳ [Header Client] Not mounted yet");
		return null;
	}

	console.log("🎯 [Header Client] Rendering with auth state:", authState);

	// Only show cart quantity when both mounted and cart is initialized
	const cartQuantity = cart?.totalQuantity ?? 0;
	const showCartQuantity = mounted && isInitialized && cartQuantity > 0;

	// Get all menu items including nested ones
	const allMenuItems = initialMenuItems.reduce((acc: MenuItem[], item) => {
		acc.push(item);
		if (item.items?.length) {
			acc.push(...item.items);
		}
		return acc;
	}, []);

	// Main menu shows first 12 top-level items
	const mainMenuItems = initialMenuItems.slice(0, 12);

	// Theme toggle function
	const toggleTheme = () => {
		setTheme(theme === "dark" ? "light" : "dark");
	};

	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("[HEADER] Search submitted:", { inputValue });
		if (inputValue.trim()) {
			router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`);
			setIsDropdownOpen(false);
		}
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		console.log("[HEADER] Search input changed:", { value, currentDropdownState: isDropdownOpen });
		setInputValue(value);
		setSearchQuery(value);
	};

	const handleSearchFocus = () => {
		console.log("[HEADER] Search focused");
		if (inputValue.trim()) {
			setIsDropdownOpen(true);
		}
	};

	const handleSearchClear = () => {
		console.log("[HEADER] Search cleared");
		setInputValue("");
		setSearchQuery("");
		setIsDropdownOpen(false);
		// Remove focus from the input
		if (document.activeElement instanceof HTMLElement) {
			document.activeElement.blur();
		}
	};

	// Don't render search placeholder until mounted to prevent hydration mismatch
	const searchPlaceholder = mounted ? "Search products..." : "";

	// Add these menu items to server-side data fetching
	const microDosingCards: MicroDosingCard[] = [
		{
			title: "Getting Started",
			description: "Beginner's guide to microdosing",
			href: "/guides/microdosing/beginners",
			icon: "BookOpen",
			tag: "Guide",
		},
		{
			title: "Products",
			description: "Microdosing supplies",
			href: "/collections/microdosing",
			icon: "Leaf",
			tag: "Shop",
		},
		{
			title: "Research",
			description: "Scientific studies",
			href: "/blogs/research",
			icon: "TestTube",
			tag: "Science",
		},
		{
			title: "Protocol",
			description: "Schedules & methods",
			href: "/guides/microdosing/protocol",
			icon: "Brain",
			tag: "Guide",
		},
	];

	return (
		<header className={cn("bg-background border-b sticky top-0 z-50")}>
			{/* Top Bar */}
			<div className="px-2 sm:px-4 py-3">
				<div className="flex items-center justify-between gap-4">
					{/* Logo */}
					<div className="flex-shrink-0">
						<Link prefetch={true} href="/" className="flex items-center space-x-2" onClick={handleSearchClear}>
							<div className="relative w-8 h-8">
								<Image src="/logo.png" alt="Zugzology Logo" fill className="object-contain dark:invert" sizes="24px" />
							</div>
							<span className="hidden md:inline text-lg font-bold">Zugzology</span>
						</Link>
					</div>

					{/* Search Bar */}
					<div className="flex-1 relative min-w-0" data-search-container>
						<form onSubmit={handleSearchSubmit} className="relative w-full">
							<div className="relative">
								<Input
									type="text"
									className="w-full pr-4 pl-10 text-[16px] h-8 sm:h-10 bg-muted/50 focus:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none select-none [&::-webkit-search-decoration]:hidden [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden"
									placeholder={searchPlaceholder}
									value={inputValue}
									onChange={handleSearchChange}
									onFocus={handleSearchFocus}
									autoComplete="off"
									autoCorrect="off"
									autoCapitalize="off"
									spellCheck="false"
									inputMode="search"
								/>
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								{inputValue && (
									<Button type="button" variant="ghost" size="icon" onClick={handleSearchClear} className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7">
										<X className="h-4 w-4" />
										<span className="sr-only">Clear search</span>
									</Button>
								)}
							</div>
						</form>

						{/* Search Dropdown */}
						<SearchDropdown />
					</div>

					{/* Action Buttons */}
					<div className="flex items-center gap-2 flex-shrink-0">
						{/* Learn & Grow Button */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="sm" className="h-8 sm:h-10 px-2.5 sm:px-3">
									<Sprout className="h-4 w-4 sm:mr-2" />
									<span className="hidden sm:inline">Learn & Grow</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-[300px]">
								{blogs?.map((blog) => (
									<DropdownMenuItem key={blog.id} asChild>
										<Link href={`/blogs/${blog.handle}`} className="flex items-start gap-3 p-3 cursor-pointer">
											<div className="flex-1 min-w-0">
												<div className="flex items-center justify-between gap-2">
													<h3 className="font-medium truncate">{blog.title}</h3>
													<Badge variant="secondary" className="shrink-0">
														{blog.articles.edges.length}
													</Badge>
												</div>
												<p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{blog.articles.edges[0]?.node.excerpt || "Explore our articles"}</p>
											</div>
										</Link>
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>

						{/* Hide Microdosing Button */}
						<div className="hidden">
							{/* Original Microdosing Button Content */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="default" size="sm" className="h-8 sm:h-10 px-2.5 sm:px-3">
										<Sparkles className="h-4 w-4 sm:mr-2" />
										<span className="hidden sm:inline">Microdosing</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-[400px] p-4">
									<div className="space-y-4">
										{/* Header */}
										<div className="space-y-1.5">
											<h3 className="font-semibold text-lg">Microdosing Resources</h3>
											<p className="text-sm text-muted-foreground">Everything you need to know about microdosing</p>
										</div>

										{/* Cards Grid */}
										<div className="grid grid-cols-1 gap-3">
											{microDosingCards.map((card) => (
												<DropdownMenuItem key={card.href} asChild className="p-0">
													<Link href={card.href} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted cursor-pointer w-full">
														<div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
															{card.icon === "Brain" && <Brain className="h-5 w-5" />}
															{card.icon === "TestTube" && <TestTube className="h-5 w-5" />}
															{card.icon === "Leaf" && <Leaf className="h-5 w-5" />}
															{card.icon === "BookOpen" && <BookOpen className="h-5 w-5" />}
														</div>
														<div className="flex-1 min-w-0">
															<div className="flex items-center justify-between gap-2">
																<p className="font-medium">{card.title}</p>
																<Badge variant="outline" className="font-normal">
																	{card.tag}
																</Badge>
															</div>
															<p className="text-sm text-muted-foreground truncate">{card.description}</p>
														</div>
													</Link>
												</DropdownMenuItem>
											))}
										</div>

										{/* Footer */}
										<div className="pt-3 border-t">
											<DropdownMenuItem asChild className="p-0">
												<Link href="/guides/microdosing" className="flex items-center justify-between p-2 rounded-md hover:bg-muted w-full text-sm text-muted-foreground">
													View all microdosing resources
													<ChevronRight className="h-4 w-4" />
												</Link>
											</DropdownMenuItem>
										</div>
									</div>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

						{/* Help Button */}
						<Button variant="ghost" size="sm" className="h-8 sm:h-10 px-2.5 sm:px-3" asChild>
							<Link href="/help">
								<HelpCircle className="h-4 w-4 sm:mr-2" />
								<span className="hidden sm:inline">Help</span>
							</Link>
						</Button>

						<div className="flex items-center border-l ml-2 pl-2 h-8 sm:h-10">
							{/* Account Button/Dropdown */}
							{authState ? (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon" className="h-8 sm:h-10 w-8 sm:w-10 rounded-full">
											<User className="h-4 w-4" />
											<span className="sr-only">Account menu</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-[200px]">
										<DropdownMenuItem asChild>
											<Link href="/account" className="w-full cursor-pointer" prefetch={true}>
												<User className="h-4 w-4 mr-2" />
												Account
											</Link>
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
											{theme === "dark" ? (
												<>
													<Sun className="h-4 w-4 mr-2" />
													Light Mode
												</>
											) : (
												<>
													<Moon className="h-4 w-4 mr-2" />
													Dark Mode
												</>
											)}
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<SignOutButton onSignOut={() => setAuthState(false)} />
									</DropdownMenuContent>
								</DropdownMenu>
							) : (
								<Link href="/login" passHref>
									<Button variant="ghost" size="icon" className="h-8 sm:h-10 w-8 sm:w-10 rounded-full">
										<User className="h-4 w-4" />
										<span className="sr-only">Login</span>
									</Button>
								</Link>
							)}

							{/* Cart Button */}
							<Button variant="ghost" className="relative h-8 sm:h-10 w-8 sm:w-10 p-0 rounded-full" onClick={openCart}>
								<ShoppingCart className="h-4 w-4" />
								{showCartQuantity && <span className="absolute -top-2 -right-2 min-w-[20px] h-5 text-xs bg-purple-500 text-white rounded-full flex items-center justify-center px-1.5">{cartQuantity}</span>}
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Navigation */}
			<nav className="border-t">
				<div className="px-2 sm:px-4">
					<div className="flex items-center py-1">
						<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
							<SheetTrigger asChild>
								<Button variant="ghost" size="sm" className="flex items-center gap-2 shrink-0 mr-4">
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
										<line x1="4" x2="20" y1="12" y2="12" />
										<line x1="4" x2="20" y1="6" y2="6" />
										<line x1="4" x2="20" y1="18" y2="18" />
									</svg>
									<span className="font-medium">All</span>
								</Button>
							</SheetTrigger>
							<SheetContent side="left" className="w-[320px] p-0">
								<SheetHeader className="px-4 py-3 border-b">
									<SheetTitle className="text-lg font-bold">Shop By Category</SheetTitle>
								</SheetHeader>
								<ScrollArea className="h-[calc(100vh-60px)]">
									<div className="grid gap-0.5 p-1">
										{allMenuItems.map((item) => (
											<Link key={item.id} href={item.url} className="flex items-center justify-between px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors duration-200" onClick={() => setIsSheetOpen(false)}>
												<span>{item.title}</span>
												<ChevronRight className="w-4 h-4 text-muted-foreground" />
											</Link>
										))}
									</div>
								</ScrollArea>
							</SheetContent>
						</Sheet>

						<ScrollArea className="w-full whitespace-nowrap">
							<div className="flex items-center space-x-4">
								{mainMenuItems.map((item) => (
									<Link prefetch={true} key={item.id} href={item.url} className="text-sm text-muted-foreground hover:text-foreground py-1 shrink-0 transition-colors">
										{item.title}
									</Link>
								))}
							</div>
							<ScrollBar orientation="horizontal" className="invisible" />
						</ScrollArea>
					</div>
				</div>
			</nav>
		</header>
	);
}
