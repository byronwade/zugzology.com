"use client";

import Image from "next/image";
import { Link } from "@/components/ui/link";
import { Search, Sun, Moon, Sprout, User, ShoppingCart, Menu, Sparkles, X, ChevronRight, Brain, TestTube, Leaf, BookOpen, ShoppingBag, Star, Tag, Package, HelpCircle, Clock, ArrowRight, Heart, LogIn, UserPlus, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
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
	const { searchQuery, setSearchQuery, isDropdownOpen, setIsDropdownOpen, addRecentSearch } = useSearch();
	const { showPromo, setShowPromo } = usePromo();
	const router = useRouter();

	// 2. State hooks with stable initial values
	const [mounted, setMounted] = useState<boolean>(false);
	const [authState, setAuthState] = useState<boolean>(isAuthenticated);
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

	// Use setSearchQuery directly instead of throttling
	const searchHandlers = useMemo<SearchHandlers>(() => {
		return {
			change: (e) => {
				const value = e.target.value;
				setInputValue(value);
				setSearchQuery(value);

				// Ensure dropdown opens when typing
				if (value.trim().length > 0) {
					setIsDropdownOpen(true);
				} else {
					setIsDropdownOpen(false);
				}
			},
			submit: (e) => {
				e.preventDefault();
				if (inputValue.trim()) {
					addRecentSearch(inputValue);
					router.push(`/search?q=${encodeURIComponent(inputValue)}`);
					setIsDropdownOpen(false);
				}
			},
			focus: () => {
				// Open dropdown on focus if there's a query
				if (inputValue.trim().length > 0) {
					setIsDropdownOpen(true);
				}
			},
			clear: () => {
				setInputValue("");
				setSearchQuery("");
				setIsDropdownOpen(false);
			},
		};
	}, [inputValue, setSearchQuery, setIsDropdownOpen, addRecentSearch, router]);

	const handleTheme = useCallback(() => {
		setTheme(theme === "dark" ? "light" : "dark");
	}, [theme, setTheme]);

	// 6. Effects with cleanup
	useEffect(() => {
		setMounted(true);
		setAuthState(isAuthenticated);
	}, [isAuthenticated]);

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
						{typeof window !== "undefined" && window.innerWidth < 640 ? (
							<Sheet>
								<SheetTrigger asChild>
									<Button variant="outline" size="sm" className="h-10 px-3">
										<Sprout className="h-4 w-4" />
									</Button>
								</SheetTrigger>
								<SheetContent side="bottom" className="h-[80vh] p-0">
									<ScrollArea className="h-full">
										<div className="flex flex-col">
											{/* Left Column - Featured Content */}
											<div className="w-full bg-muted/50 p-4 border-b">
												{/* Featured Blog */}
												{blogs?.[0] && (
													<div className="mb-4">
														<h3 className="text-sm font-medium mb-3 flex items-center gap-2">
															<Sparkles className="h-4 w-4 text-purple-500" />
															Featured
														</h3>
														<Link href={`/blogs/${blogs[0].handle}`} className="group block">
															<div className="relative aspect-video rounded-lg overflow-hidden">
																{blogs[0].articles?.edges?.[0]?.node?.image ? (
																	<>
																		<Image src={blogs[0].articles.edges[0].node.image.url} alt={blogs[0].articles.edges[0].node.image.altText || blogs[0].title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
																		<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
																		<div className="absolute inset-x-0 bottom-0 p-3">
																			<Badge variant="secondary" className="bg-purple-500/90 text-white border-0 mb-1.5 text-[10px]">
																				New Guide
																			</Badge>
																			<h4 className="text-sm font-medium text-white line-clamp-2">{blogs[0].articles?.edges?.[0]?.node?.title || blogs[0].title}</h4>
																		</div>
																	</>
																) : (
																	<div className="h-full bg-gradient-to-br from-purple-500/20 to-purple-700/20 flex items-center justify-center">
																		<Sprout className="h-8 w-8 text-purple-500" />
																	</div>
																)}
															</div>
														</Link>
													</div>
												)}

												{/* Quick Stats */}
												<div className="grid grid-cols-2 gap-2">
													<div className="rounded-lg border bg-background/50 p-2.5">
														<div className="flex items-center gap-2 text-purple-500 mb-1">
															<BookOpen className="h-4 w-4" />
															<span className="text-xs font-medium">Total Guides</span>
														</div>
														<p className="text-xl font-semibold">{blogs?.reduce((acc, blog) => acc + (blog.articles?.edges?.length || 0), 0) || 0}</p>
													</div>
													<div className="rounded-lg border bg-background/50 p-2.5">
														<div className="flex items-center gap-2 text-green-500 mb-1">
															<Clock className="h-4 w-4" />
															<span className="text-xs font-medium">Last Updated</span>
														</div>
														<p className="text-sm font-medium">2 days ago</p>
													</div>
												</div>
											</div>

											{/* Categories Section */}
											<div className="p-4 border-b">
												<h3 className="text-sm font-medium mb-3">Learning Paths</h3>
												<div className="grid grid-cols-2 gap-2">
													{blogs?.slice(0, 4).map((blog) => {
														const categoryStyles = {
															guide: { icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
															tutorial: { icon: TestTube, color: "text-green-500", bg: "bg-green-50 dark:bg-green-500/10" },
															tip: { icon: Brain, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
															default: { icon: Leaf, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10" },
														};

														const style = blog.handle.includes("guide") ? categoryStyles.guide : blog.handle.includes("tutorial") ? categoryStyles.tutorial : blog.handle.includes("tip") ? categoryStyles.tip : categoryStyles.default;

														const Icon = style.icon;

														return (
															<Link key={blog.id} href={`/blogs/${blog.handle}`} className={cn("group flex items-start gap-2 p-2.5 rounded-lg", style.bg, "transition-colors duration-200 hover:opacity-80")}>
																<Icon className={cn("h-4 w-4 mt-0.5", style.color)} />
																<div className="min-w-0">
																	<h4 className="font-medium text-sm leading-tight line-clamp-1">{blog.title}</h4>
																	<p className="text-xs text-muted-foreground mt-0.5">{blog.articles?.edges?.length || 0} articles</p>
																</div>
															</Link>
														);
													})}
												</div>
											</div>

											{/* Recent Articles */}
											<div className="p-4">
												<div className="flex items-center justify-between mb-3">
													<h3 className="text-sm font-medium">Latest Content</h3>
													<Link href="/blogs" className="text-xs text-primary hover:text-primary/80 transition-colors">
														View All →
													</Link>
												</div>
												<div className="space-y-2">
													{blogs
														?.slice(0, 2)
														.map((blog) =>
															blog.articles?.edges?.slice(0, 2).map((article) => (
																<Link key={article.node.id} href={`/blogs/${blog.handle}/${article.node.handle}`} className="group flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors">
																	<div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">{blog.handle.includes("guide") ? <BookOpen className="h-4 w-4 text-blue-500" /> : blog.handle.includes("tutorial") ? <TestTube className="h-4 w-4 text-green-500" /> : blog.handle.includes("tip") ? <Brain className="h-4 w-4 text-amber-500" /> : <Leaf className="h-4 w-4 text-purple-500" />}</div>
																	<div className="flex-1 min-w-0">
																		<h4 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">{article.node.title}</h4>
																		<p className="text-xs text-muted-foreground mt-0.5">{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
																	</div>
																</Link>
															))
														)
														.flat()}
												</div>
											</div>
										</div>
									</ScrollArea>
								</SheetContent>
							</Sheet>
						) : (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" size="sm" className="h-10 px-3">
										<Sprout className="h-4 w-4 sm:mr-2" />
										<span className="hidden sm:inline">Learn & Grow</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-[480px] p-0 overflow-hidden">
									<div className="flex flex-row">
										{/* Left Column - Featured Content */}
										<div className="w-1/2 bg-muted/50 p-4 border-r">
											{/* Featured Blog */}
											{blogs?.[0] && (
												<div className="mb-4">
													<h3 className="text-sm font-medium mb-3 flex items-center gap-2">
														<Sparkles className="h-4 w-4 text-purple-500" />
														Featured
													</h3>
													<Link href={`/blogs/${blogs[0].handle}`} className="group block">
														<div className="relative aspect-video sm:aspect-square rounded-lg overflow-hidden">
															{blogs[0].articles?.edges?.[0]?.node?.image ? (
																<>
																	<Image src={blogs[0].articles.edges[0].node.image.url} alt={blogs[0].articles.edges[0].node.image.altText || blogs[0].title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
																	<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
																	<div className="absolute inset-x-0 bottom-0 p-3">
																		<Badge variant="secondary" className="bg-purple-500/90 text-white border-0 mb-1.5 text-[10px]">
																			New Guide
																		</Badge>
																		<h4 className="text-sm font-medium text-white line-clamp-2">{blogs[0].articles?.edges?.[0]?.node?.title || blogs[0].title}</h4>
																	</div>
																</>
															) : (
																<div className="h-full bg-gradient-to-br from-purple-500/20 to-purple-700/20 flex items-center justify-center">
																	<Sprout className="h-8 w-8 text-purple-500" />
																</div>
															)}
														</div>
													</Link>
												</div>
											)}

											{/* Quick Stats */}
											<div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
												<div className="rounded-lg border bg-background/50 p-2.5">
													<div className="flex items-center gap-2 text-purple-500 mb-1">
														<BookOpen className="h-4 w-4" />
														<span className="text-xs font-medium">Total Guides</span>
													</div>
													<p className="text-xl font-semibold">{blogs?.reduce((acc, blog) => acc + (blog.articles?.edges?.length || 0), 0) || 0}</p>
												</div>
												<div className="rounded-lg border bg-background/50 p-2.5">
													<div className="flex items-center gap-2 text-green-500 mb-1">
														<Clock className="h-4 w-4" />
														<span className="text-xs font-medium">Last Updated</span>
													</div>
													<p className="text-sm font-medium">2 days ago</p>
												</div>
											</div>
										</div>

										{/* Right Column */}
										<div className="w-1/2 flex flex-col">
											{/* Categories Section */}
											<div className="p-4 border-b">
												<h3 className="text-sm font-medium mb-3">Learning Paths</h3>
												<div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
													{blogs?.slice(0, 4).map((blog) => {
														const categoryStyles = {
															guide: { icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
															tutorial: { icon: TestTube, color: "text-green-500", bg: "bg-green-50 dark:bg-green-500/10" },
															tip: { icon: Brain, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
															default: { icon: Leaf, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10" },
														};

														const style = blog.handle.includes("guide") ? categoryStyles.guide : blog.handle.includes("tutorial") ? categoryStyles.tutorial : blog.handle.includes("tip") ? categoryStyles.tip : categoryStyles.default;

														const Icon = style.icon;

														return (
															<Link key={blog.id} href={`/blogs/${blog.handle}`} className={cn("group flex items-start gap-2 p-2.5 rounded-lg", style.bg, "transition-colors duration-200 hover:opacity-80")}>
																<Icon className={cn("h-4 w-4 mt-0.5", style.color)} />
																<div className="min-w-0">
																	<h4 className="font-medium text-sm leading-tight line-clamp-1">{blog.title}</h4>
																	<p className="text-xs text-muted-foreground mt-0.5">{blog.articles?.edges?.length || 0} articles</p>
																</div>
															</Link>
														);
													})}
												</div>
											</div>

											{/* Recent Articles */}
											<div className="p-4">
												<div className="flex items-center justify-between mb-3">
													<h3 className="text-sm font-medium">Latest Content</h3>
													<Link href="/blogs" className="text-xs text-primary hover:text-primary/80 transition-colors">
														View All →
													</Link>
												</div>
												<div className="space-y-2">
													{blogs
														?.slice(0, 2)
														.map((blog) =>
															blog.articles?.edges?.slice(0, 2).map((article) => (
																<Link key={article.node.id} href={`/blogs/${blog.handle}/${article.node.handle}`} className="group flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors">
																	<div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">{blog.handle.includes("guide") ? <BookOpen className="h-4 w-4 text-blue-500" /> : blog.handle.includes("tutorial") ? <TestTube className="h-4 w-4 text-green-500" /> : blog.handle.includes("tip") ? <Brain className="h-4 w-4 text-amber-500" /> : <Leaf className="h-4 w-4 text-purple-500" />}</div>
																	<div className="flex-1 min-w-0">
																		<h4 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">{article.node.title}</h4>
																		<p className="text-xs text-muted-foreground mt-0.5">{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
																	</div>
																</Link>
															))
														)
														.flat()}
												</div>
											</div>
										</div>
									</div>
								</DropdownMenuContent>
							</DropdownMenu>
						)}

						{/* Main Action Buttons */}
						<div className="flex items-center gap-3">
							{/* Account & Menu Button */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
										<Menu className="h-4 w-4" />
										<span className="sr-only">Menu</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-[200px]">
									{/* Help Section */}
									<DropdownMenuItem asChild>
										<Link href="/help" className="w-full cursor-pointer">
											<HelpCircle className="h-4 w-4 mr-2" />
											Help Center
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link href="/wishlist" className="w-full cursor-pointer">
											<Heart className="h-4 w-4 mr-2" />
											Wishlist
										</Link>
									</DropdownMenuItem>
									{authState ? (
										<>
											<DropdownMenuItem asChild>
												<Link href="/account" className="w-full cursor-pointer" prefetch={true}>
													<User className="h-4 w-4 mr-2" />
													Account
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => setShowKeyboardShortcuts(true)} className="hidden sm:flex cursor-pointer">
												<Keyboard className="h-4 w-4 mr-2" />
												Keyboard Shortcuts
											</DropdownMenuItem>
										</>
									) : (
										<>
											<DropdownMenuItem asChild>
												<Link href="/login" className="w-full cursor-pointer">
													<LogIn className="h-4 w-4 mr-2" />
													Login
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link href="/register" className="w-full cursor-pointer">
													<UserPlus className="h-4 w-4 mr-2" />
													Register
												</Link>
											</DropdownMenuItem>
										</>
									)}
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={handleTheme} className="cursor-pointer">
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
									{authState && (
										<>
											<DropdownMenuSeparator />
											<SignOutButton onSignOut={() => setAuthState(false)} />
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
