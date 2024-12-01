"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, Sun, Moon, Sprout, User, ShoppingCart, Menu, Sparkles, X, ChevronRight, Brain, TestTube, Leaf, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/providers/cart-provider";
import { useSearch } from "@/lib/providers/search-provider";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

interface MenuItem {
	id: string;
	title: string;
	url: string;
	items?: MenuItem[];
}

interface HeaderClientProps {
	initialMenuItems: MenuItem[];
}

interface BlogCategory {
	title: string;
	description: string;
	href: string;
	count: number;
}

interface MicroDosingCard {
	title: string;
	description: string;
	href: string;
	icon: "Brain" | "TestTube" | "Leaf" | "BookOpen";
	tag: string;
}

export function HeaderClient({ initialMenuItems }: HeaderClientProps) {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const { searchQuery, setSearchQuery, isSearching, allProducts } = useSearch();
	const { openCart, cart, isInitialized } = useCart();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isSheetOpen, setIsSheetOpen] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

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
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearchQuery(value);
	};

	const handleSearchFocus = () => {
		if (!isSearching && !searchQuery) {
			setSearchQuery("");
		}
	};

	const handleSearchClear = () => {
		setSearchQuery("");
		// Remove focus from the input
		if (document.activeElement instanceof HTMLElement) {
			document.activeElement.blur();
		}
	};

	// Don't render search placeholder until mounted to prevent hydration mismatch
	const searchPlaceholder = mounted ? (isSearching ? "Filter products..." : `Search ${allProducts.length} products...`) : "Search products...";

	// Add these menu items to server-side data fetching
	const blogCategories: BlogCategory[] = [
		{
			title: "Growing Guides",
			description: "Step-by-step cultivation tutorials",
			href: "/blogs/growing-guides",
			count: 12,
		},
		{
			title: "Research & Science",
			description: "Latest mycological studies",
			href: "/blogs/research",
			count: 8,
		},
		{
			title: "Techniques",
			description: "Advanced growing methods",
			href: "/blogs/techniques",
			count: 15,
		},
		{
			title: "Equipment",
			description: "Tools and setup guides",
			href: "/blogs/equipment",
			count: 6,
		},
		{
			title: "Substrate Guides",
			description: "Substrate preparation and use",
			href: "/blogs/substrates",
			count: 9,
		},
	];

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

	// Replace hardcoded logo URL with environment variable
	const LOGO_URL = process.env.NEXT_PUBLIC_LOGO_URL || "/logo.png";

	return (
		<header className={cn("bg-background text-foreground sticky top-0 z-50", isSearching && "border-b-2 border-primary")}>
			{/* Top Bar */}
			<div className="px-2 sm:px-4 py-3">
				<div className="flex items-center justify-between gap-4">
					{/* Logo */}
					<div className="flex-shrink-0">
						<Link prefetch={true} href="/" className="flex items-center space-x-2" onClick={handleSearchClear}>
							<div className="relative w-6 h-6">
								<Image src={LOGO_URL} alt="Zugzology Logo" fill className="object-contain invert dark:invert-0" sizes="24px" />
							</div>
							<span className="hidden md:inline text-lg font-bold">Zugzology</span>
						</Link>
					</div>

					{/* Search Bar */}
					<div className="flex-1 relative min-w-0">
						<form onSubmit={handleSearchSubmit} className="relative w-full">
							<div className="relative">
								<Input type="text" className={cn("w-full pr-10 pl-10 text-[16px] h-8 sm:h-10 transition-colors", isSearching && "ring-2 ring-primary", "focus:outline-none focus:ring-2 focus:ring-primary")} placeholder={searchPlaceholder} value={searchQuery} onChange={handleSearchChange} onFocus={handleSearchFocus} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" />
								<Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", isSearching ? "text-primary" : "text-muted-foreground")} />
								{searchQuery && (
									<Button type="button" variant="ghost" size="icon" onClick={handleSearchClear} className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-neutral-100 dark:hover:bg-neutral-800">
										<X className="h-4 w-4" />
										<span className="sr-only">Clear search</span>
									</Button>
								)}
							</div>
						</form>
					</div>

					{/* Action Buttons */}
					<div className="flex items-center space-x-2 flex-shrink-0">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600 h-8 sm:h-10 px-2 sm:px-4">
									<Sprout className="h-4 w-4" />
									<span className="hidden sm:inline">Learn & Grow</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-[300px] p-2">
								<div className="space-y-2">
									{blogCategories.map((category) => (
										<Link key={category.href} href={category.href} className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted transition-colors">
											<div className="flex-1">
												<div className="flex items-center justify-between">
													<h3 className="font-medium">{category.title}</h3>
													<span className="text-xs text-muted-foreground">{category.count} articles</span>
												</div>
												<p className="text-sm text-muted-foreground">{category.description}</p>
											</div>
										</Link>
									))}
								</div>
							</DropdownMenuContent>
						</DropdownMenu>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600 h-8 sm:h-10 px-2 sm:px-4">
									<Sparkles className="h-4 w-4" />
									<span className="hidden sm:inline">Microdosing</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-[340px] p-3">
								<div className="grid grid-cols-2 gap-2">
									{microDosingCards.map((card) => (
										<Link key={card.href} href={card.href} className="group flex flex-col p-3 rounded-lg border hover:border-primary transition-colors">
											<div className="mb-2">
												{card.icon === "Brain" && <Brain className="h-5 w-5 text-purple-500" />}
												{card.icon === "TestTube" && <TestTube className="h-5 w-5 text-purple-500" />}
												{card.icon === "Leaf" && <Leaf className="h-5 w-5 text-purple-500" />}
												{card.icon === "BookOpen" && <BookOpen className="h-5 w-5 text-purple-500" />}
											</div>
											<div>
												<div className="flex items-center justify-between mb-1">
													<h3 className="font-medium text-sm">{card.title}</h3>
													<Badge variant="secondary" className="text-xs">
														{card.tag}
													</Badge>
												</div>
												<p className="text-xs text-muted-foreground">{card.description}</p>
											</div>
										</Link>
									))}
								</div>
							</DropdownMenuContent>
						</DropdownMenu>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="secondary" className="h-8 sm:h-10 w-8 sm:w-10 p-0">
									<User className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-48">
								<DropdownMenuItem asChild>
									<Link href="/account" className="w-full">
										Account
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href="/orders" className="w-full">
										Orders
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
									{mounted && theme === "dark" ? (
										<div className="flex items-center w-full">
											<Sun className="h-4 w-4 mr-2" />
											Light Mode
										</div>
									) : (
										<div className="flex items-center w-full">
											<Moon className="h-4 w-4 mr-2" />
											Dark Mode
										</div>
									)}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						<Button variant="outline" className="relative h-8 sm:h-10 w-8 sm:w-10 p-0" onClick={openCart}>
							<ShoppingCart className="h-4 w-4" />
							{showCartQuantity && <span className="absolute -top-1 -right-1 h-4 w-4 text-xs bg-primary text-primary-foreground rounded-full flex items-center justify-center">{cartQuantity}</span>}
						</Button>
					</div>
				</div>
			</div>

			{/* Navigation */}
			<nav className="border-y bg-muted">
				<div className="px-2 sm:px-4">
					<div className="flex items-center py-1">
						<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
							<SheetTrigger asChild>
								<Button variant="outline" size="sm" className="flex items-center gap-2 shrink-0 mr-4">
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
											<Link key={item.id} href={item.url} className="flex items-center justify-between px-3 py-2 text-sm hover:bg-secondary rounded-md transition-colors duration-200" onClick={() => setIsSheetOpen(false)}>
												<span>{item.title}</span>
												<ChevronRight className="w-4 h-4" />
											</Link>
										))}
									</div>
								</ScrollArea>
							</SheetContent>
						</Sheet>

						<ScrollArea className="w-full whitespace-nowrap">
							<div className="flex items-center space-x-4">
								{mainMenuItems.map((item) => (
									<Link prefetch={true} key={item.id} href={item.url} className="text-sm hover:text-foreground/80 py-1 shrink-0 transition-colors">
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
