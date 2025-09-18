"use client";

import Image from "next/image";
import Link from "next/link";
import {
	Search,
	Sun,
	Moon,
	Sprout,
	User,
	ShoppingCart,
	Menu,
	Sparkles,
	X,
	ChevronRight,
	Brain,
	TestTube,
	Leaf,
	BookOpen,
	ShoppingBag,
	Star,
	Tag,
	Package,
	HelpCircle,
	Clock,
	ArrowRight,
	Heart,
	LogIn,
	UserPlus,
	Keyboard,
	Globe,
	MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
	DropdownMenuLabel,
	DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState, useRef, useMemo, useCallback, memo } from "react";
import { useCart } from "@/components/providers/cart-provider";
import { useWishlist } from "@/components/providers/wishlist-provider";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import type { ShopifyBlog } from "@/lib/types";
import { useSearch } from "@/components/providers";
import Cookies from "js-cookie";
import { SignOutButton } from "@/components/features/auth/sign-out-button";
import { usePromo } from "@/components/providers";
import { MenuSheetFixed } from "./menu-sheet-fixed";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { UserAccountButton } from "@/components/features/auth/next-auth-buttons";
import { NextAuthLogout } from "@/components/features/auth/next-auth-logout";
import { LearnAndGrowMenuFixed } from "@/components/layout/header/learn-and-grow-menu-fixed";
import { SearchDropdown } from "@/components/features/search/search-dropdown";
import { DynamicPromoBanner } from "@/components/layout/promo-banner-dynamic";
import { DynamicAffiliateLinks, DynamicAffiliateLinksDropdown } from "@/components/layout/header/affiliate-links-dynamic";
import { useStoreConfig } from "@/hooks/use-store-config";
import { CartSheet } from "@/components/cart/cart-sheet";

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

interface SearchHandlers {
	change: (e: React.ChangeEvent<HTMLInputElement>) => void;
	submit: (e: React.FormEvent) => void;
	focus: () => void;
	clear: () => void;
}

function useResponsivePlaceholder(mobileText: string, desktopText: string) {
	const [placeholder, setPlaceholder] = useState(mobileText);

	useEffect(() => {
		const updatePlaceholder = () => {
			setPlaceholder(window.innerWidth < 640 ? mobileText : desktopText);
		};

		// Initial check
		updatePlaceholder();

		// Add event listener
		window.addEventListener("resize", updatePlaceholder);

		// Cleanup
		return () => window.removeEventListener("resize", updatePlaceholder);
	}, [mobileText, desktopText]);

	return placeholder;
}

// Memoize the header sections to prevent unnecessary re-renders
const Logo = memo(function Logo({ onClick }: { onClick: () => void }) {
	const { storeName, branding } = useStoreConfig();
	
	return (
		<div className="flex-shrink-0">
			<Link prefetch={true} href="/" className="flex items-center gap-3" onClick={onClick}>
				<div className="relative w-8 h-8">
					<Image 
						src={branding.logoUrl || "/logo.png"} 
						alt={`${storeName} Logo`} 
						fill 
						className="object-contain dark:invert" 
						sizes="24px" 
					/>
				</div>
				<span className="hidden md:inline text-lg font-bold">{storeName}</span>
			</Link>
		</div>
	);
});

const SearchBar = memo(function SearchBar({
	placeholder,
	value,
	onChange,
	onFocus,
	onSubmit,
	onClear,
}: {
	placeholder: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onFocus: () => void;
	onSubmit: (e: React.FormEvent) => void;
	onClear: () => void;
}) {
	return (
		<div className="flex-1 relative min-w-0 ml-2 mr-3 sm:mr-4" data-search-container>
			<form onSubmit={onSubmit} className="relative w-full">
				<div className="relative">
					<Input
						type="text"
						className="w-full pr-4 pl-8 text-[16px] h-10 bg-muted/50 focus:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none select-none [&::-webkit-search-decoration]:hidden [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden"
						placeholder={placeholder}
						value={value}
						onChange={onChange}
						onFocus={onFocus}
						autoComplete="off"
						autoCorrect="off"
						autoCapitalize="off"
						spellCheck="false"
						inputMode="search"
					/>
					<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					{value && (
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={onClear}
							className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
						>
							<X className="h-4 w-4" />
							<span className="sr-only">Clear search</span>
						</Button>
					)}
				</div>
			</form>
		</div>
	);
});

export function HeaderClient({ initialMenuItems, blogs, isAuthenticated }: HeaderClientProps) {
	// 1. Context hooks first
	const { theme, setTheme } = useTheme();
	const { openCart, cart } = useCart();
	const { wishlist } = useWishlist();
	const { setSearchQuery, isSearching, setIsDropdownOpen, isDropdownOpen } = useSearch();
	const { showPromo, setShowPromo } = usePromo();
	const router = useRouter();

	// Use session with fallback for when SessionProvider is not available
	const { data: session } = useSession({ required: false }) || { data: null };

	// Check if authenticated via NextAuth
	const isAuthenticatedNextAuth = !!session;

	// 2. State hooks with stable initial values
	const [mounted, setMounted] = useState<boolean>(false);
	const [inputValue, setInputValue] = useState<string>("");
	const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
	const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

	// 3. Refs for performance optimization
	const touchStartX = useRef<number>(0);
	const lastSearchTime = useRef<number>(0);

	// 4. Memoized values with proper dependencies
	const searchPlaceholder = useResponsivePlaceholder("Search...", "Search Products and Articles...");

	const menuItems = useMemo(
		() => ({
			all: initialMenuItems.reduce((acc: MenuItem[], item) => {
				acc.push(item);
				if (item.items?.length) {
					acc.push(...item.items);
				}
				return acc;
			}, []),
			main: initialMenuItems.slice(0, 12),
		}),
		[initialMenuItems]
	);

	const cartState = useMemo(
		() => ({
			quantity: cart?.totalQuantity ?? 0,
			show: mounted && cart && (cart?.totalQuantity ?? 0) > 0,
		}),
		[cart?.totalQuantity, mounted, cart]
	);

	const wishlistState = useMemo(
		() => ({
			quantity: wishlist?.length ?? 0,
			show: mounted && wishlist && wishlist.length > 0,
		}),
		[wishlist?.length, mounted, wishlist]
	);

	// Throttle search to prevent excessive API calls
	const throttledSearch = useCallback(
		(value: string) => {
			const now = Date.now();
			if (now - lastSearchTime.current > 300) {
				lastSearchTime.current = now;
				setSearchQuery(value);
				setIsDropdownOpen(!!value.trim());
			}
		},
		[setSearchQuery, setIsDropdownOpen]
	);

	// Memoize the search handlers
	const searchHandlers = useMemo(() => {
		return {
			change: (e: React.ChangeEvent<HTMLInputElement>) => {
				const value = e.target.value;
				setInputValue(value);
				throttledSearch(value);
			},
			submit: (e: React.FormEvent) => {
				e.preventDefault();
				if (inputValue.trim()) {
					router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`);
					setIsDropdownOpen(false);
				}
			},
			focus: () => {
				if (inputValue.trim()) {
					setIsDropdownOpen(true);
				}
			},
			clear: () => {
				setInputValue("");
				setSearchQuery("");
				setIsDropdownOpen(false);
				if (document.activeElement instanceof HTMLElement) {
					document.activeElement.blur();
				}
			},
		};
	}, [inputValue, router, setSearchQuery, setIsDropdownOpen, throttledSearch]);

	const handleTheme = useCallback(() => {
		setTheme(theme === "dark" ? "light" : "dark");
	}, [theme, setTheme]);

	// 6. Effects with cleanup
	useEffect(() => {
		setMounted(true);
	}, []);

	// Add keyboard shortcut handler
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Only handle if not in an input field
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
				return;
			}

			// Safely get the lowercase key
			const key = e.key?.toLowerCase() || "";

			// Navigation shortcuts
			if (e.shiftKey) {
				switch (key) {
					case "h":
						e.preventDefault();
						router.push("/");
						break;
					case "s":
						e.preventDefault();
						router.push("/search");
						break;
					case "a":
						e.preventDefault();
						router.push("/account");
						break;
					case "b":
						e.preventDefault();
						router.push("/blogs");
						break;
					case "?": // Changed from '/' to '?' for help
						e.preventDefault();
						router.push("/help");
						break;
					case "k":
						e.preventDefault();
						const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
						searchInput?.focus();
						break;
					case "o":
						e.preventDefault();
						openCart();
						break;
				}
			} else {
				// Non-shift shortcuts
				switch (key) {
					case "/":
						e.preventDefault();
						const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
						searchInput?.focus();
						break;
					case "escape":
						e.preventDefault();
						if (isDropdownOpen) {
							setIsDropdownOpen(false);
							searchHandlers.clear();
						}
						break;
					case "arrowup":
						if (isDropdownOpen) {
							e.preventDefault();
							// Handle search result navigation
						}
						break;
					case "arrowdown":
						if (isDropdownOpen) {
							e.preventDefault();
							// Handle search result navigation
						}
						break;
					case "enter":
						if (isDropdownOpen) {
							e.preventDefault();
							// Handle search result selection
						}
						break;
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [router, openCart, isDropdownOpen, setIsDropdownOpen, searchHandlers]);

	// Return null only for initial mount
	if (!mounted) return null;

	return (
		<>
			<header className="bg-white sticky top-0 z-50 flex flex-col">
			{/* Dynamic Promo Banner */}
			<DynamicPromoBanner showPromo={showPromo} onDismiss={() => setShowPromo(false)} />

			{/* Top Bar - Shopify Admin Style */}
			<div className="px-4 h-[var(--header-top-height)] flex-shrink-0 flex items-center bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
				<div className="flex items-center justify-between w-full">
					{/* Logo Section */}
					<div className="flex items-center">
						<Logo onClick={searchHandlers.clear} />
					</div>

					{/* Search Section - Shopify Admin Style */}
					<div className="flex-1 mx-4">
						<div className="relative w-full">
							<Input
								type="text"
								className="w-full pl-10 pr-4 h-9 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 focus:ring-purple-500 rounded-md text-sm"
								placeholder={searchPlaceholder}
								value={inputValue}
								onChange={searchHandlers.change}
								onFocus={searchHandlers.focus}
								onSubmit={searchHandlers.submit}
								autoComplete="off"
								autoCorrect="off"
								autoCapitalize="off"
								spellCheck="false"
								inputMode="search"
							/>
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
							{inputValue && (
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={searchHandlers.clear}
									className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-gray-200 dark:hover:bg-gray-700"
								>
									<X className="h-3.5 w-3.5" />
									<span className="sr-only">Clear search</span>
								</Button>
							)}
							<SearchDropdown />
						</div>
					</div>

					{/* Action Buttons - Shopify Admin Style */}
					<div className="flex items-center gap-2 flex-shrink-0">
						{/* Learn & Grow Button - Hidden on mobile */}
						<div className="hidden sm:block">
							<LearnAndGrowMenuFixed blogs={blogs} />
						</div>

						{/* Main Action Buttons */}
						<div className="flex items-center gap-2">
							{/* Mobile More Menu - Only visible on small screens */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild className="sm:hidden">
									<Button
										variant="ghost"
										size="icon"
										className="h-9 w-9 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
									>
										<MoreHorizontal className="h-5 w-5" />
										<span className="sr-only">More options</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="end"
									className="w-[200px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-1 shadow-lg rounded-lg"
								>
									{/* Learn & Grow in dropdown on mobile */}
									<DropdownMenuItem
										onClick={() => router.push("/blogs")}
										className="rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
									>
										<BookOpen className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
										Learn & Grow
									</DropdownMenuItem>

									{/* Dynamic Affiliated Websites */}
									<DynamicAffiliateLinksDropdown />

									{/* Theme Toggle in dropdown on mobile */}
									<DropdownMenuItem
										onClick={handleTheme}
										className="rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
									>
										{theme === "light" ? (
											<Moon className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
										) : (
											<Sun className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
										)}
										{theme === "light" ? "Dark Mode" : "Light Mode"}
									</DropdownMenuItem>

									{/* Wishlist in dropdown on mobile */}
									<DropdownMenuItem
										onClick={() => router.push("/wishlist")}
										className="rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
									>
										<Heart className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
										<span className="flex items-center gap-2">
											Wishlist
											{wishlistState.show && (
												<span className="min-w-[16px] h-[16px] text-xs bg-red-500 text-white rounded-full flex items-center justify-center px-1 font-medium">
													{wishlistState.quantity}
												</span>
											)}
										</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							{/* Dynamic Affiliated Websites Button - Hidden on mobile */}
							<DynamicAffiliateLinks className="hidden sm:flex" />

							{/* Theme Toggle - Hidden on mobile */}
							<Button
								variant="ghost"
								size="icon"
								onClick={handleTheme}
								className="hidden sm:flex h-9 w-9 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
							>
								{theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
								<span className="sr-only">Toggle theme</span>
							</Button>

							{/* Wishlist Button - Hidden on mobile */}
							<Button
								variant="ghost"
								size="icon"
								onClick={() => router.push("/wishlist")}
								className="relative hidden sm:flex h-9 w-9 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
							>
								<Heart className="h-5 w-5" />
								{wishlistState.show && (
									<span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-xs bg-red-500 text-white rounded-full flex items-center justify-center px-1 font-medium">
										{wishlistState.quantity}
									</span>
								)}
								<span className="sr-only">Wishlist</span>
							</Button>

							{/* Account Button - Hidden temporarily while testing
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="h-9 w-9 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
									>
										<User className="h-5 w-5" />
										<span className="sr-only">Account</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									className="w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-1 shadow-lg rounded-lg"
									align="end"
									forceMount
								>
									<DropdownMenuLabel className="font-normal px-3 py-2 text-gray-700 dark:text-gray-300">
										<div className="flex flex-col space-y-1">
											<p className="text-sm font-medium leading-none text-gray-900 dark:text-gray-100">
												{session?.user?.name || "Account"}
											</p>
											{session?.user?.email && (
												<p className="text-xs leading-none text-gray-500 dark:text-gray-400">{session.user.email}</p>
											)}
										</div>
									</DropdownMenuLabel>
									<DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-800 my-1" />
									<DropdownMenuGroup>
										{isAuthenticatedNextAuth ? (
											<>
												<DropdownMenuItem
													onClick={() => router.push("/account")}
													className="rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
												>
													<User className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
													Account
												</DropdownMenuItem>
											</>
										) : (
											<>
												<DropdownMenuItem
													onClick={() => router.push("/login")}
													className="rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
												>
													<LogIn className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
													Login
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => router.push("/register")}
													className="rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
												>
													<UserPlus className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
													Register
												</DropdownMenuItem>
											</>
										)}
									</DropdownMenuGroup>
									<DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-800 my-1" />
									<DropdownMenuItem
										onClick={() => router.push("/keyboard-shortcuts")}
										className="rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
									>
										<Keyboard className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
										Keyboard Shortcuts
									</DropdownMenuItem>
									{isAuthenticatedNextAuth && (
										<>
											<DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-800 my-1" />
											<NextAuthLogout onSignOut={() => router.refresh()} />
										</>
									)}
								</DropdownMenuContent>
							</DropdownMenu>
							*/}

							{/* Cart Button - Always visible */}
							<Button
								variant="ghost"
								size="icon"
								onClick={openCart}
								className="relative h-9 w-9 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
							>
								<ShoppingCart className="h-5 w-5" />
								{cartState.show && (
									<span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-xs bg-purple-600 text-white rounded-full flex items-center justify-center px-1 font-medium">
										{cartState.quantity}
									</span>
								)}
								<span className="sr-only">Cart</span>
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Navigation - Shopify Admin Style */}
			<nav className="bg-white dark:bg-gray-900 h-[var(--header-nav-height)] flex-shrink-0 border-b border-gray-200 dark:border-gray-800">
				<div className="px-4 h-full">
					<div className="flex items-center h-full">
						<MenuSheetFixed items={initialMenuItems} />

						<ScrollArea className="w-full whitespace-nowrap">
							<div className="flex items-center space-x-6">
								{menuItems.main.map((item) => (
									<Link
										prefetch={true}
										key={item.id}
										href={item.url}
										className="text-sm font-medium text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 py-1 shrink-0 transition-colors"
									>
										{item.title}
									</Link>
								))}
							</div>
							<ScrollBar orientation="horizontal" className="invisible" />
						</ScrollArea>
					</div>
				</div>
			</nav>

			<Dialog open={showKeyboardShortcuts} onOpenChange={setShowKeyboardShortcuts}>
				<DialogContent className="sm:max-w-[600px]" onPointerDownOutside={(e) => e.preventDefault()} tabIndex={-1}>
					<DialogHeader>
						<DialogTitle className="text-xl">Keyboard Shortcuts</DialogTitle>
						<DialogDescription>Use these keyboard shortcuts to navigate quickly through the site.</DialogDescription>
					</DialogHeader>
					{/* Only show keyboard shortcuts on desktop */}
					<div className="hidden sm:grid gap-6 py-6">
						<div className="space-y-4">
							<h3 className="font-medium text-sm text-muted-foreground mb-3">Navigation</h3>
							<div className="grid grid-cols-2 gap-4">
								<div className="flex items-center justify-between">
									<span className="text-sm">Go to Home</span>
									<kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded-md">shift + h</kbd>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm">Go to Search</span>
									<kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded-md">shift + s</kbd>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm">Go to Account</span>
									<kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded-md">shift + a</kbd>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm">Go to Blogs</span>
									<kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded-md">shift + b</kbd>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm">Go to Help</span>
									<kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded-md">shift + ?</kbd>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<h3 className="font-medium text-sm text-muted-foreground mb-3">Actions</h3>
							<div className="grid grid-cols-2 gap-4">
								<div className="flex items-center justify-between">
									<span className="text-sm">Focus Search</span>
									<kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded-md">shift + k</kbd>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm">Focus Search (alt)</span>
									<kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded-md">/</kbd>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm">Toggle Cart</span>
									<kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded-md">shift + o</kbd>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm">Close/Clear</span>
									<kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded-md">esc</kbd>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<h3 className="font-medium text-sm text-muted-foreground mb-3">Search Results</h3>
							<div className="grid grid-cols-2 gap-4">
								<div className="flex items-center justify-between">
									<span className="text-sm">Previous Result</span>
									<kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded-md">↑</kbd>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm">Next Result</span>
									<kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded-md">↓</kbd>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm">Select Result</span>
									<kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded-md">enter</kbd>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm">Close Search</span>
									<kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded-md">esc</kbd>
								</div>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</header>
		<CartSheet />
		</>
	);
}
