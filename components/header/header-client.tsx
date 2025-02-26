"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, Sun, Moon, Sprout, User, ShoppingCart, Menu, Sparkles, X, ChevronRight, Brain, TestTube, Leaf, BookOpen, ShoppingBag, Star, Tag, Package, HelpCircle, Clock, ArrowRight, Heart, LogIn, UserPlus, Keyboard, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuGroup } from "@/components/ui/dropdown-menu";
import { useEffect, useState, useRef, useMemo, useCallback, memo } from "react";
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
import { usePromo } from "@/lib/providers/promo-provider";
import { MenuSheet } from "./menu-sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { UserAccountButton } from "@/components/auth/next-auth-buttons";
import { NextAuthLogout } from "@/components/auth/next-auth-logout";
import { LearnAndGrowMenu } from "@/components/header/learn-and-grow-menu";

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
	return (
		<div className="flex-shrink-0">
			<Link prefetch={true} href="/" className="flex items-center gap-3" onClick={onClick}>
				<div className="relative w-8 h-8">
					<Image src="/logo.png" alt="Zugzology Logo" fill className="object-contain dark:invert" sizes="24px" />
				</div>
				<span className="hidden md:inline text-lg font-bold">Zugzology</span>
			</Link>
		</div>
	);
});

const SearchBar = memo(function SearchBar({ placeholder, value, onChange, onFocus, onSubmit, onClear }: { placeholder: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onFocus: () => void; onSubmit: (e: React.FormEvent) => void; onClear: () => void }) {
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
						<Button type="button" variant="ghost" size="icon" onClick={onClear} className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
							<X className="h-4 w-4" />
							<span className="sr-only">Clear search</span>
						</Button>
					)}
				</div>
			</form>
			<SearchDropdown />
		</div>
	);
});

export function HeaderClient({ initialMenuItems, blogs, isAuthenticated }: HeaderClientProps) {
	// 1. Context hooks first
	const { theme, setTheme } = useTheme();
	const { openCart, cart, isInitialized } = useCart();
	const { setSearchQuery, isSearching, setIsDropdownOpen, isDropdownOpen } = useSearch();
	const { showPromo, setShowPromo } = usePromo();
	const router = useRouter();

	// Replace auth context with Next Auth session
	const { data: session, status } = useSession();
	const isAuthenticatedNextAuth = status === "authenticated";

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
			show: mounted && isInitialized && (cart?.totalQuantity ?? 0) > 0,
		}),
		[cart?.totalQuantity, mounted, isInitialized]
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
		<header className={cn("bg-background border-b sticky top-0 z-50 flex flex-col", showPromo ? "h-[calc(var(--header-height)+32px)]" : "h-[var(--header-height)]")}>
			{/* Promo Banner */}
			{showPromo && (
				<div className="bg-purple-50 dark:bg-purple-950/20 border-b border-purple-100 dark:border-purple-900 h-8">
					<div className="relative mx-auto px-4 h-full">
						<div className="flex items-center justify-between gap-4 h-full">
							<div className="flex flex-wrap items-center gap-2 text-xs text-purple-700 dark:text-purple-300">
								<div className="flex items-center gap-2 min-w-fit">
									<Sparkles className="h-3.5 w-3.5" />
									<span className="font-medium whitespace-nowrap">Limited Time Offer</span>
								</div>
								<Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
									Save 20%
								</Badge>
								<span className="hidden xs:inline text-purple-400 dark:text-purple-600">|</span>
								<span className="hidden xs:flex items-center gap-1 text-purple-500 dark:text-purple-400 whitespace-nowrap">
									<Clock className="h-3.5 w-3.5" />
									Ends in 2 days
								</span>
							</div>
							<div className="flex items-center gap-3 min-w-fit">
								<Button variant="link" size="sm" className="h-auto p-0 text-xs text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 hover:no-underline" asChild>
									<a href="/sale" className="hidden xs:inline-flex items-center">
										View Deals
										<ArrowRight className="h-3 w-3 ml-1" />
									</a>
								</Button>
								<button onClick={() => setShowPromo(false)} className="text-purple-400 hover:text-purple-900 dark:hover:text-purple-100">
									<X className="h-3.5 w-3.5" />
									<span className="sr-only">Dismiss</span>
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Top Bar */}
			<div className="px-2 sm:px-4 h-[var(--header-top-height)] flex-shrink-0 flex items-center">
				<div className="flex items-center justify-between w-full">
					<Logo onClick={searchHandlers.clear} />

					<SearchBar placeholder={searchPlaceholder} value={inputValue} onChange={searchHandlers.change} onFocus={searchHandlers.focus} onSubmit={searchHandlers.submit} onClear={searchHandlers.clear} />

					{/* Action Buttons */}
					<div className="flex items-center gap-3 flex-shrink-0">
						{/* Learn & Grow Button */}
						<LearnAndGrowMenu blogs={blogs} />

						{/* Main Action Buttons */}
						<div className="flex items-center gap-3">
							{/* Affiliated Websites Button */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
										<Globe className="h-4 w-4" />
										<span className="sr-only">Affiliated Websites</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-[200px]">
									<DropdownMenuItem asChild>
										<a href="https://zugzmagic.com" target="_blank" rel="noopener noreferrer" className="w-full cursor-pointer">
											<Globe className="h-4 w-4 mr-2" />
											zugzmagic.com
										</a>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<a href="https://zugzbag.com" target="_blank" rel="noopener noreferrer" className="w-full cursor-pointer">
											<Globe className="h-4 w-4 mr-2" />
											zugzbag.com
										</a>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<div className="px-2 py-1.5 text-xs text-muted-foreground">Other Sites</div>
									<DropdownMenuItem asChild>
										<a href="https://tripsitter.com" target="_blank" rel="noopener noreferrer" className="w-full cursor-pointer">
											<Globe className="h-4 w-4 mr-2" />
											tripsitter.com
										</a>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							{/* Account & Menu Button */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" size="icon" className="relative h-10 w-10 rounded-full">
										<User className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-56" align="end" forceMount>
									<DropdownMenuLabel className="font-normal">
										<div className="flex flex-col space-y-1">
											<p className="text-sm font-medium leading-none">{session?.user?.name || "Account"}</p>
											{session?.user?.email && <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>}
										</div>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuGroup>
										{isAuthenticatedNextAuth ? (
											<>
												<DropdownMenuItem onClick={() => router.push("/account")}>
													<User className="h-4 w-4 mr-2" />
													Account
												</DropdownMenuItem>
											</>
										) : (
											<>
												<DropdownMenuItem onClick={() => router.push("/login")}>
													<LogIn className="h-4 w-4 mr-2" />
													Login
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => router.push("/register")}>
													<UserPlus className="h-4 w-4 mr-2" />
													Register
												</DropdownMenuItem>
											</>
										)}
									</DropdownMenuGroup>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={() => router.push("/keyboard-shortcuts")}>
										<Keyboard className="h-4 w-4 mr-2" />
										Keyboard Shortcuts
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
										{theme === "light" ? (
											<>
												<Moon className="h-4 w-4 mr-2" />
												Dark Mode
											</>
										) : (
											<>
												<Sun className="h-4 w-4 mr-2" />
												Light Mode
											</>
										)}
									</DropdownMenuItem>
									{isAuthenticatedNextAuth && (
										<>
											<DropdownMenuSeparator />
											<NextAuthLogout onSignOut={() => router.refresh()} />
										</>
									)}
								</DropdownMenuContent>
							</DropdownMenu>

							{/* Cart Button */}
							<Button variant="outline" size="icon" onClick={openCart} className="relative h-10 w-10 rounded-full">
								<ShoppingCart className="h-4 w-4" />
								{cartState.show && <span className="absolute -top-2 -right-1.5 sm:-right-2 min-w-[20px] h-5 text-xs bg-purple-500 text-white rounded-full flex items-center justify-center px-1.5">{cartState.quantity}</span>}
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Navigation */}
			<nav className="border-t h-[var(--header-nav-height)] flex-shrink-0">
				<div className="px-2 sm:px-4 h-full">
					<div className="flex items-center h-full">
						<MenuSheet items={initialMenuItems} />

						<ScrollArea className="w-full whitespace-nowrap">
							<div className="flex items-center space-x-4">
								{menuItems.main.map((item) => (
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
	);
}
