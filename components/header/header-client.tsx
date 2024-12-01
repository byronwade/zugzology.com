"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, Sun, Moon, Sprout, User, ShoppingCart, Menu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { useCart } from "@/lib/providers/cart-provider";

interface MenuItem {
	id: string;
	title: string;
	url: string;
	items?: MenuItem[];
}

interface HeaderClientProps {
	initialMenuItems: MenuItem[];
}

export function HeaderClient({ initialMenuItems }: HeaderClientProps) {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();
	const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
	const debouncedQuery = useDebounce(searchQuery, 300);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isSearchFocused, setIsSearchFocused] = useState(false);
	const { openCart, cart } = useCart();
	const pathname = usePathname();
	const [isSheetOpen, setIsSheetOpen] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Update URL when search query changes
	useEffect(() => {
		if (debouncedQuery !== searchParams.get("q")) {
			if (debouncedQuery) {
				if (!pathname.includes("/search")) {
					router.push(`/search?q=${encodeURIComponent(debouncedQuery)}`);
				} else {
					router.push(`/search?q=${encodeURIComponent(debouncedQuery)}`, { scroll: false });
				}
			} else if (pathname === "/search") {
				router.push("/search", { scroll: false });
			}
		}
	}, [debouncedQuery, router, searchParams, pathname]);

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
		if (searchQuery.trim()) {
			router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
		}
	};

	const handleSearchFocus = () => {
		setIsSearchFocused(true);
	};

	return (
		<header className="bg-background text-foreground sticky top-0 z-50">
			{/* Top Bar */}
			<div className="px-2 sm:px-4 py-3">
				<div className="flex items-center justify-between">
					{/* Logo */}
					<div className="flex items-center">
						<Link prefetch={true} href="/" className="flex items-center space-x-2">
							<div className="relative w-6 h-6">
								<Image src="/logo.png" alt="Zugzology Logo" fill className="object-contain invert dark:invert-0" sizes="24px" />
							</div>
							<span className="hidden md:inline text-lg font-bold">Zugzology</span>
						</Link>
					</div>

					{/* Search Bar */}
					<div className="flex-1 mx-2">
						<form onSubmit={handleSearchSubmit} className="relative w-full">
							<div className="relative">
								<Input type="text" className="w-full pr-10 text-[16px] h-8 sm:h-10" placeholder="Search Zugzology..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={handleSearchFocus} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" />
								<button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
									<Search className="h-4 w-4 text-muted-foreground" />
								</button>
							</div>
						</form>
					</div>

					{/* Action Buttons */}
					<div className="flex items-center space-x-2">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600 h-8 sm:h-10 px-2 sm:px-4">
									<Sprout className="h-4 w-4" />
									<span className="hidden sm:inline">Learn & Grow</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-48">
								<DropdownMenuItem>
									<Link href="/guides/microdosing" className="w-full">
										Microdosing Guide
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<Link href="/collections/microdosing" className="w-full">
										Products
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<Link href="/blogs/research" className="w-full">
										Research
									</Link>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600 h-8 sm:h-10 px-2 sm:px-4">
									<Sparkles className="h-4 w-4" />
									<span className="hidden sm:inline">Microdosing</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-48">
								<DropdownMenuItem>
									<Link href="/guides/microdosing" className="w-full">
										Microdosing Guide
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<Link href="/collections/microdosing" className="w-full">
										Products
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<Link href="/blogs/research" className="w-full">
										Research
									</Link>
								</DropdownMenuItem>
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
							{cart?.totalQuantity ? <span className="absolute -top-1 -right-1 h-4 w-4 text-xs bg-primary text-primary-foreground rounded-full flex items-center justify-center">{cart.totalQuantity}</span> : null}
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
								<Button variant="outline" className="flex items-center gap-2 shrink-0 mr-4">
									<Menu className="h-4 w-4" />
									<span>All</span>
								</Button>
							</SheetTrigger>
							<SheetContent side="left">
								<SheetHeader>
									<SheetTitle>All Categories</SheetTitle>
								</SheetHeader>
								<ScrollArea className="h-[calc(100vh-8rem)] pr-4">
									{allMenuItems.map((item, index) => (
										<div key={item.id}>
											<Link prefetch={true} href={item.url} className="flex items-center py-2 hover:text-primary" onClick={() => setIsSheetOpen(false)}>
												{item.title}
											</Link>
											{index < allMenuItems.length - 1 && <Separator className="my-2" />}
										</div>
									))}
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
