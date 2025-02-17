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
import { debounce } from "@/lib/utils/debounce";

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

interface DebouncedFunction<T extends (...args: any[]) => any> {
	(...args: Parameters<T>): void;
	cancel: () => void;
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
	const { searchQuery, setSearchQuery, isSearching, setIsDropdownOpen, searchResults, allProducts, isDropdownOpen } = useSearch();
	const router = useRouter();

	// 2. State hooks with stable initial values
	const [mounted, setMounted] = useState<boolean>(false);
	const [authState, setAuthState] = useState<boolean>(isAuthenticated);
	const [inputValue, setInputValue] = useState<string>("");
	const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

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
		setAuthState(isAuthenticated);
	}, [isAuthenticated]);

	// Return null only for initial mount
	if (!mounted) return null;

	return (
		<header className={cn("bg-background border-b sticky top-0 z-50 h-[var(--header-height)] flex flex-col")}>
			{/* Top Bar */}
			<div className="px-2 sm:px-4 h-[var(--header-top-height)] flex-shrink-0 flex items-center">
				<div className="flex items-center justify-between w-full">
					<Logo onClick={searchHandlers.clear} />
					<SearchBar placeholder={searchPlaceholder} value={inputValue} onChange={searchHandlers.change} onFocus={searchHandlers.focus} onSubmit={searchHandlers.submit} onClear={searchHandlers.clear} />

					{/* Action Buttons */}
					<div className="flex items-center gap-3 flex-shrink-0">
						{/* Learn & Grow Button */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm" className="h-10 px-3">
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
														{blog.articles?.edges?.length || 0}
													</Badge>
												</div>
												<p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{blog.articles?.edges?.[0]?.node?.excerpt || "Explore our articles"}</p>
											</div>
										</Link>
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>

						{/* Help Button */}
						<Button variant="outline" size="sm" className="h-10 px-3" asChild>
							<Link href="/help">
								<HelpCircle className="h-4 w-4 sm:mr-2" />
								<span className="hidden sm:inline">Help</span>
							</Link>
						</Button>

						<div className="flex items-center gap-3 border-l pl-3">
							{/* Account Button */}
							{authState ? (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
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
										<DropdownMenuSeparator />
										<SignOutButton onSignOut={() => setAuthState(false)} />
									</DropdownMenuContent>
								</DropdownMenu>
							) : (
								<Link href="/login" passHref>
									<Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
										<User className="h-4 w-4" />
										<span className="sr-only">Login</span>
									</Button>
								</Link>
							)}

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
						<Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
							<SheetTrigger asChild>
								<Button variant="ghost" size="sm" className="flex items-center gap-2 shrink-0 mr-4">
									<Menu className="h-4 w-4" />
									<span className="font-medium">Menu</span>
								</Button>
							</SheetTrigger>
							<SheetContent
								side="left"
								className="w-[320px] p-0"
								onTouchStart={(e) => {
									const touch = e.touches[0];
									touchStartX.current = touch.clientX;
								}}
								onTouchMove={(e) => {
									const touch = e.touches[0];
									const deltaX = touch.clientX - touchStartX.current;
									if (deltaX < 0) {
										e.currentTarget.style.transform = `translateX(${deltaX}px)`;
										e.currentTarget.style.transition = "none";
									}
								}}
								onTouchEnd={(e) => {
									const touch = e.changedTouches[0];
									const deltaX = touch.clientX - touchStartX.current;
									e.currentTarget.style.transition = "transform 0.2s ease-out";

									if (deltaX < -50) {
										setIsMenuOpen(false);
									}
									e.currentTarget.style.transform = "";
								}}
							>
								<SheetHeader className="p-4 border-b">
									<SheetTitle>Menu</SheetTitle>
								</SheetHeader>
								<ScrollArea className="h-[calc(100vh-var(--header-height)-2rem)] py-4">
									<div className="grid gap-0.5 p-1">
										{menuItems.all.map((item) => (
											<Link key={item.id} href={item.url} className="flex items-center justify-between px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>
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
		</header>
	);
}
