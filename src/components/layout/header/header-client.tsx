"use client";

import {
	BookOpen,
	Heart,
	HelpCircle,
	Keyboard,
	LogIn,
	MoreHorizontal,
	Search,
	ShoppingBag,
	ShoppingCart,
	User,
	UserPlus,
	X,
} from "lucide-react";
import Image from "next/image";
import { Link } from "@/components/ui/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SignOutButton } from "@/components/features/auth/sign-out-button";
import { CartSheet } from "@/components/features/cart/cart-sheet";
import { SearchDropdown } from "@/components/features/search/search-dropdown";
import { DynamicAffiliateLinksDropdown } from "@/components/layout/header/affiliate-links-dynamic";
import { LearnAndGrowMenuFixed } from "@/components/layout/header/learn-and-grow-menu-fixed";
import { DynamicPromoBanner } from "@/components/layout/promo-banner-dynamic";
import { useAuthContext, usePromo, useSearch } from "@/components/providers";
import { useCart } from "@/components/providers/cart-provider";
import { useWishlist } from "@/components/providers/wishlist-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useStoreConfig } from "@/hooks/use-store-config";
import { CONTENT } from "@/lib/config/wadesdesign.config";
import type { ShopifyBlog } from "@/lib/types";
import { MenuSheetFixed } from "./menu-sheet-fixed";

type MenuItem = {
	id: string;
	title: string;
	url: string;
	items?: MenuItem[];
};

type HeaderClientProps = {
	initialMenuItems: MenuItem[];
	blogs: ShopifyBlog[];
	isAuthenticated: boolean;
};

type SearchHandlers = {
	change: (e: React.ChangeEvent<HTMLInputElement>) => void;
	submit: (e: React.FormEvent) => void;
	focus: () => void;
	clear: () => void;
};

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

	// Use wadesdesign config as fallback
	const logoUrl = branding.logoUrl || "/logo.png";
	const displayName = storeName;

	return (
		<div className="flex-shrink-0">
			<Link className="flex items-center gap-3" href="/" onClick={onClick} prefetch={true}>
				<div className="relative h-8 w-8">
					<Image
						alt={`${displayName} Logo`}
						className="object-contain dark:invert"
						fill
						priority
						sizes="24px"
						src={logoUrl}
					/>
				</div>
				<span className="hidden font-bold text-lg md:inline">{displayName}</span>
			</Link>
		</div>
	);
});

const _SearchBar = memo(function SearchBar({
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
		<div className="relative mr-3 ml-2 min-w-0 flex-1 sm:mr-4" data-search-container>
			<form className="relative w-full" onSubmit={onSubmit}>
				<div className="relative">
					<Input
						autoCapitalize="off"
						autoComplete="off"
						autoCorrect="off"
						className="h-10 w-full select-none appearance-none bg-muted/50 pr-4 pl-8 text-[16px] transition-colors focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden"
						inputMode="search"
						onChange={onChange}
						onFocus={onFocus}
						placeholder={placeholder}
						spellCheck="false"
						type="text"
						value={value}
					/>
					<Search className="-translate-y-1/2 absolute top-1/2 left-2.5 h-4 w-4 text-muted-foreground" />
					{value && (
						<Button
							className="-translate-y-1/2 absolute top-1/2 right-1 h-8 w-8"
							onClick={onClear}
							size="icon"
							type="button"
							variant="ghost"
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
	const { openCart, cart } = useCart();
	const { wishlist } = useWishlist();
	const { setSearchQuery, isSearching, setIsDropdownOpen, isDropdownOpen } = useSearch();
	const { showPromo, setShowPromo } = usePromo();
	const router = useRouter();

	// Use session with fallback for when SessionProvider is not available
	const sessionResult = useSession({ required: false }) || { data: null, status: "unauthenticated" };
	const session = sessionResult.data;
	const { user: authUser, isAuthenticated: authContextAuthenticated } = useAuthContext();

	const accountNameParts = (authUser ? [authUser.firstName, authUser.lastName] : []).filter((part): part is string =>
		Boolean(part?.trim())
	);
	const accountDisplayName = accountNameParts.length ? accountNameParts.join(" ") : undefined;
	const accountEmail = authUser?.email ?? "";
	const accountLabel = accountDisplayName ?? accountEmail ?? "Account";
	const avatarInitialsSource = (accountDisplayName ?? accountEmail)?.trim();
	const accountInitials = avatarInitialsSource
		? avatarInitialsSource
				.split(/\s+/)
				.filter(Boolean)
				.slice(0, 2)
				.map((part) => part[0]?.toUpperCase() ?? "")
				.join("") || "A"
		: "A";
	const accountAvatarImage = session?.user?.image ?? undefined;
	const isUserAuthenticated = authContextAuthenticated;

	// 2. State hooks with stable initial values
	const [mounted, setMounted] = useState<boolean>(false);
	const [inputValue, setInputValue] = useState<string>("");
	const [_isMenuOpen, _setIsMenuOpen] = useState<boolean>(false);
	const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

	// 3. Refs for performance optimization
	const _touchStartX = useRef<number>(0);
	const lastSearchTime = useRef<number>(0);

	// 4. Memoized values with proper dependencies
	const searchPlaceholder = useResponsivePlaceholder(
		CONTENT.navigation.search.placeholder,
		CONTENT.navigation.search.placeholderLong
	);

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
	const searchHandlers = useMemo(
		() => ({
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
		}),
		[inputValue, router, setSearchQuery, setIsDropdownOpen, throttledSearch]
	);

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
					case "k": {
						e.preventDefault();
						const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
						searchInput?.focus();
						break;
					}
					case "o":
						e.preventDefault();
						openCart();
						break;
				}
			} else {
				// Non-shift shortcuts
				switch (key) {
					case "/": {
						e.preventDefault();
						const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
						searchInput?.focus();
						break;
					}
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
	if (!mounted) {
		return null;
	}

	return (
		<>
			<header className="sticky top-0 z-50 flex flex-col bg-background">
				{/* Dynamic Promo Banner */}
				<DynamicPromoBanner onDismiss={() => setShowPromo(false)} showPromo={showPromo} />

				{/* Top Bar - Shopify Admin Style */}
				<div className="flex h-[var(--header-top-height)] flex-shrink-0 items-center border-border border-b bg-background">
					<div className="container mx-auto flex w-full items-center justify-between px-4">
						{/* Logo Section */}
						<div className="flex items-center">
							<Logo onClick={searchHandlers.clear} />
						</div>

						{/* Search Section - Shopify Admin Style */}
						<div className="mx-4 flex-1">
							<div className="relative w-full">
								<Input
									autoCapitalize="off"
									autoComplete="off"
									autoCorrect="off"
									className="flex h-9 w-full rounded-md border border bg-muted px-3 py-2 pr-4 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus:bg-background focus:ring-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									inputMode="search"
									onChange={searchHandlers.change}
									onFocus={searchHandlers.focus}
									placeholder={searchPlaceholder}
									spellCheck="false"
									type="text"
									value={inputValue}
								/>
								<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
								<SearchDropdown />
							</div>
						</div>

						{/* Action Buttons - Shopify Admin Style */}
						<div className="flex flex-shrink-0 items-center gap-2">
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
											className="inline-flex h-9 w-9 items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 sm:hidden [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
											size="icon"
											variant="ghost"
										>
											<MoreHorizontal className="h-5 w-5" />
											<span className="sr-only">More options</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align="end"
										className="w-[200px] rounded-lg border border-border bg-background p-1 shadow-lg"
									>
										{/* Learn & Grow in dropdown on mobile */}
										<DropdownMenuItem
											className="rounded-md text-foreground hover:bg-muted focus:bg-muted"
											onClick={() => router.push("/blogs")}
										>
											<BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
											{CONTENT.navigation.buttons.learnAndGrow}
										</DropdownMenuItem>

										{/* Dynamic Affiliated Websites */}
										<DynamicAffiliateLinksDropdown />

										{/* Wishlist in dropdown on mobile */}
										<DropdownMenuItem
											className="rounded-md text-foreground hover:bg-muted focus:bg-muted"
											onClick={() => router.push("/wishlist")}
										>
											<Heart className="mr-2 h-4 w-4 text-muted-foreground" />
											<span className="flex items-center gap-2">
												{CONTENT.navigation.buttons.wishlist}
												{wishlistState.show && (
													<span className="flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 font-medium text-destructive-foreground text-xs">
														{wishlistState.quantity}
													</span>
												)}
											</span>
										</DropdownMenuItem>

										<DropdownMenuSeparator className="my-1 bg-border" />

										{isUserAuthenticated ? (
											<>
												<DropdownMenuLabel className="px-3 py-1 font-medium text-muted-foreground text-xs uppercase tracking-wide">
													{CONTENT.navigation.buttons.account}
												</DropdownMenuLabel>
												<DropdownMenuItem
													className="rounded-md text-foreground hover:bg-muted focus:bg-muted"
													onClick={() => router.push("/account")}
												>
													<User className="mr-2 h-4 w-4 text-muted-foreground" />
													{CONTENT.navigation.buttons.accountDashboard}
												</DropdownMenuItem>
												<DropdownMenuItem
													className="rounded-md text-foreground hover:bg-muted focus:bg-muted"
													onClick={() => router.push("/account/orders")}
												>
													<ShoppingBag className="mr-2 h-4 w-4 text-muted-foreground" />
													{CONTENT.navigation.buttons.orders}
												</DropdownMenuItem>
												<DropdownMenuSeparator className="my-1 bg-border" />
												<SignOutButton onSignOut={() => router.refresh()} />
											</>
										) : (
											<>
												<DropdownMenuItem
													className="rounded-md text-foreground hover:bg-muted focus:bg-muted"
													onClick={() => router.push("/login")}
												>
													<LogIn className="mr-2 h-4 w-4 text-muted-foreground" />
													{CONTENT.navigation.actions.signIn}
												</DropdownMenuItem>
												<DropdownMenuItem
													className="rounded-md text-foreground hover:bg-muted focus:bg-muted"
													onClick={() => router.push("/register")}
												>
													<UserPlus className="mr-2 h-4 w-4 text-muted-foreground" />
													{CONTENT.navigation.actions.createAccount}
												</DropdownMenuItem>
											</>
										)}
									</DropdownMenuContent>
								</DropdownMenu>

								{/* Wishlist Button - Hidden on mobile */}
								<Button
									className="relative hidden h-9 w-9 items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 sm:flex [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
									onClick={() => router.push("/wishlist")}
									size="icon"
									variant="ghost"
								>
									<Heart className="h-5 w-5" />
									{wishlistState.show && (
										<span className="-top-1 -right-1 absolute flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive px-1 font-semibold text-[10px] text-destructive-foreground">
											{wishlistState.quantity}
										</span>
									)}
									<span className="sr-only">{CONTENT.navigation.buttons.wishlist}</span>
								</Button>

								{/* Cart Button - Always visible */}
								<Button
									className="relative inline-flex h-9 w-9 items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
									onClick={openCart}
									size="icon"
									variant="ghost"
								>
									<ShoppingCart className="h-5 w-5" />
									{cartState.show && (
										<span className="-top-1 -right-1 absolute flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 font-semibold text-[10px] text-primary-foreground">
											{cartState.quantity}
										</span>
									)}
									<span className="sr-only">{CONTENT.navigation.buttons.cart}</span>
								</Button>

								{isUserAuthenticated ? (
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												className="hidden h-9 w-9 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground sm:flex"
												data-testid="account-menu-trigger"
												size="icon"
												variant="ghost"
											>
												<Avatar className="h-8 w-8">
													{accountAvatarImage ? <AvatarImage alt={accountLabel} src={accountAvatarImage} /> : null}
													<AvatarFallback>{accountInitials}</AvatarFallback>
												</Avatar>
												<span className="sr-only">{CONTENT.navigation.buttons.account}</span>
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent
											align="end"
											className="w-60 rounded-lg border border-border bg-background p-1 shadow-lg"
											forceMount
										>
											<DropdownMenuLabel className="px-3 py-2 font-normal text-foreground">
												<div className="flex flex-col space-y-1">
													<p className="font-medium text-foreground text-sm leading-none">{accountLabel}</p>
													{accountEmail && <p className="text-muted-foreground text-xs leading-none">{accountEmail}</p>}
												</div>
											</DropdownMenuLabel>
											<DropdownMenuSeparator className="my-1 bg-border" />
											<DropdownMenuGroup>
												<DropdownMenuItem
													className="rounded-md text-foreground hover:bg-muted focus:bg-muted"
													onClick={() => router.push("/account")}
												>
													<User className="mr-2 h-4 w-4 text-muted-foreground" />
													{CONTENT.navigation.buttons.accountDashboard}
												</DropdownMenuItem>
												<DropdownMenuItem
													className="rounded-md text-foreground hover:bg-muted focus:bg-muted"
													onClick={() => router.push("/account/orders")}
												>
													<ShoppingBag className="mr-2 h-4 w-4 text-muted-foreground" />
													{CONTENT.navigation.buttons.orders}
												</DropdownMenuItem>
											</DropdownMenuGroup>
											<DropdownMenuSeparator className="my-1 bg-border" />
											<DropdownMenuItem
												className="rounded-md text-foreground hover:bg-muted focus:bg-muted"
												onClick={() => router.push("/keyboard-shortcuts")}
											>
												<Keyboard className="mr-2 h-4 w-4 text-muted-foreground" />
												{CONTENT.navigation.buttons.keyboardShortcuts}
											</DropdownMenuItem>
											<DropdownMenuItem
												className="rounded-md text-foreground hover:bg-muted focus:bg-muted"
												onClick={() => router.push("/help")}
											>
												<HelpCircle className="mr-2 h-4 w-4 text-muted-foreground" />
												{CONTENT.navigation.buttons.helpCenter}
											</DropdownMenuItem>
											<DropdownMenuSeparator className="my-1 bg-border" />
											<SignOutButton onSignOut={() => router.refresh()} />
										</DropdownMenuContent>
									</DropdownMenu>
								) : (
									<div className="hidden items-center gap-2 sm:flex">
										<Button
											className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-full border border bg-background px-3 font-medium text-xs shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
											onClick={() => router.push("/login")}
											size="sm"
											variant="outline"
										>
											<LogIn className="h-4 w-4" />
											{CONTENT.navigation.actions.signIn}
										</Button>
										<Button
											className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-primary px-3 font-medium text-primary-foreground text-xs shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
											onClick={() => router.push("/register")}
											size="sm"
											variant="default"
										>
											<UserPlus className="h-4 w-4" />
											{CONTENT.navigation.actions.signUp}
										</Button>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Navigation - Shopify Admin Style */}
				<nav className="h-[var(--header-nav-height)] flex-shrink-0 border-border border-b bg-background">
					<div className="container mx-auto h-full px-4">
						<div className="flex h-full items-center">
							<MenuSheetFixed items={initialMenuItems} />

							<ScrollArea className="w-full whitespace-nowrap">
								<div className="flex items-center space-x-6">
									{menuItems.main.map((item) => {
										// Check if item has submenu items
										if (item.items && item.items.length > 0) {
											return (
												<DropdownMenu key={item.id}>
													<DropdownMenuTrigger asChild>
														<button className="shrink-0 py-1 font-medium text-muted-foreground text-sm transition-colors hover:text-primary">
															{item.title}
														</button>
													</DropdownMenuTrigger>
													<DropdownMenuContent className="w-56 rounded-lg border border-border bg-background p-1 shadow-lg">
														{item.items.map((subItem) => (
															<DropdownMenuItem
																className="rounded-md text-foreground hover:bg-muted focus:bg-muted"
																key={subItem.id}
																onClick={() => router.push(subItem.url)}
															>
																{subItem.title}
															</DropdownMenuItem>
														))}
													</DropdownMenuContent>
												</DropdownMenu>
											);
										}

										// No submenu items, render as regular link
										return (
											<Link
												className="shrink-0 py-1 font-medium text-muted-foreground text-sm transition-colors hover:text-primary"
												href={item.url}
												key={item.id}
												prefetch={true}
											>
												{item.title}
											</Link>
										);
									})}
								</div>
								<ScrollBar className="invisible" orientation="horizontal" />
							</ScrollArea>
						</div>
					</div>
				</nav>

				<Dialog onOpenChange={setShowKeyboardShortcuts} open={showKeyboardShortcuts}>
					<DialogContent className="sm:max-w-[600px]" onPointerDownOutside={(e) => e.preventDefault()} tabIndex={-1}>
						<DialogHeader>
							<DialogTitle className="text-xl">Keyboard Shortcuts</DialogTitle>
							<DialogDescription>Use these keyboard shortcuts to navigate quickly through the site.</DialogDescription>
						</DialogHeader>
						{/* Only show keyboard shortcuts on desktop */}
						<div className="hidden gap-6 py-6 sm:grid">
							<div className="space-y-4">
								<h3 className="mb-3 font-medium text-muted-foreground text-sm">Navigation</h3>
								<div className="grid grid-cols-2 gap-4">
									<div className="flex items-center justify-between">
										<span className="text-sm">Go to Home</span>
										<kbd className="rounded-md bg-muted px-2 py-1 font-semibold text-xs">shift + h</kbd>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Go to Search</span>
										<kbd className="rounded-md bg-muted px-2 py-1 font-semibold text-xs">shift + s</kbd>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Go to Account</span>
										<kbd className="rounded-md bg-muted px-2 py-1 font-semibold text-xs">shift + a</kbd>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Go to Blogs</span>
										<kbd className="rounded-md bg-muted px-2 py-1 font-semibold text-xs">shift + b</kbd>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Go to Help</span>
										<kbd className="rounded-md bg-muted px-2 py-1 font-semibold text-xs">shift + ?</kbd>
									</div>
								</div>
							</div>

							<div className="space-y-4">
								<h3 className="mb-3 font-medium text-muted-foreground text-sm">Actions</h3>
								<div className="grid grid-cols-2 gap-4">
									<div className="flex items-center justify-between">
										<span className="text-sm">Focus Search</span>
										<kbd className="rounded-md bg-muted px-2 py-1 font-semibold text-xs">shift + k</kbd>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Focus Search (alt)</span>
										<kbd className="rounded-md bg-muted px-2 py-1 font-semibold text-xs">/</kbd>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Toggle Cart</span>
										<kbd className="rounded-md bg-muted px-2 py-1 font-semibold text-xs">shift + o</kbd>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Close/Clear</span>
										<kbd className="rounded-md bg-muted px-2 py-1 font-semibold text-xs">esc</kbd>
									</div>
								</div>
							</div>

							<div className="space-y-4">
								<h3 className="mb-3 font-medium text-muted-foreground text-sm">Search Results</h3>
								<div className="grid grid-cols-2 gap-4">
									<div className="flex items-center justify-between">
										<span className="text-sm">Previous Result</span>
										<kbd className="rounded-md bg-muted px-2 py-1 font-semibold text-xs">↑</kbd>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Next Result</span>
										<kbd className="rounded-md bg-muted px-2 py-1 font-semibold text-xs">↓</kbd>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Select Result</span>
										<kbd className="rounded-md bg-muted px-2 py-1 font-semibold text-xs">enter</kbd>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Close Search</span>
										<kbd className="rounded-md bg-muted px-2 py-1 font-semibold text-xs">esc</kbd>
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
