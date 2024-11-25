"use client";

import { useState, useEffect } from "react";
import { CartButton } from "@/components/cart/cart-button";
import { CartSheet } from "@/components/cart/cart-sheet";
import { Autocomplete } from "./autocomplete";
import { useTheme } from "next-themes";
import type { Product } from "@/lib/types/shopify";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { User, Sun, Moon, Sprout, Menu, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
	initialMenu: Array<{
		id: string;
		title: string;
		url: string;
	}>;
	search: (query: string) => Promise<Product[]>;
}

// Define microdosing products
const microdoseProducts = [
	{
		name: "Microdose Capsules",
		description: "Precise dosage in convenient capsule form",
		href: "/products/microdose-capsules",
	},
	{
		name: "Microdose Gummies",
		description: "Sweet and precise microdosing",
		href: "/products/microdose-gummies",
	},
	{
		name: "Microdose Chocolates",
		description: "Delicious chocolate with measured doses",
		href: "/products/microdose-chocolates",
	},
];

export function Header({ initialMenu, search }: HeaderProps) {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const [isSheetOpen, setIsSheetOpen] = useState(false);

	// Get first 8 items for the sub header
	const subHeaderItems = initialMenu?.slice(0, 8) || [];
	// Sort remaining items alphabetically for the sheet
	const allMenuItems = [...initialMenu].sort((a, b) => a.title.localeCompare(b.title));

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<header className="bg-background text-foreground sticky top-0 z-50">
			<div className="px-2 sm:px-4 py-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center">
						<Link href="/" className="flex items-center space-x-2">
							<div className="relative w-6 h-6">
								<Image src="/logo.png" alt="Zugzology Logo" fill sizes="24px" priority className="object-contain invert" />
							</div>
							<span className="hidden md:inline text-lg font-bold">Zugzology</span>
						</Link>
					</div>
					<div className="flex-1 mx-2">
						<Autocomplete onSearch={search} onSearchSubmit={search} />
					</div>
					<div className="flex items-center space-x-2">
						<Button variant="secondary" size="sm" className="h-8 w-8" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
							{mounted && (theme === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />)}
						</Button>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="secondary" size="sm" className="flex items-center gap-1 sm:gap-2 h-8 px-2 sm:px-3 bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600">
									<Sprout className="h-4 w-4" />
									<span className="hidden sm:inline">Microdosing</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-[300px]">
								{microdoseProducts.map((product) => (
									<DropdownMenuItem key={product.href} asChild>
										<Link href={product.href} className="flex flex-col gap-1 p-3 cursor-pointer">
											<span className="font-medium">{product.name}</span>
											<span className="text-sm text-muted-foreground">{product.description}</span>
										</Link>
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
						<Link href="/account">
							<Button variant="secondary" size="sm" className="h-8 w-8">
								<User className="h-4 w-4" />
							</Button>
						</Link>
						<CartButton />
						<CartSheet />
					</div>
				</div>
			</div>
			<nav className="border-t bg-muted">
				<div className="px-2 sm:px-4">
					<div className="flex items-center py-2">
						<div className="flex items-center space-x-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
							<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
								<SheetTrigger asChild>
									<Button variant="outline" size="sm" className="flex items-center gap-2 h-8">
										<Menu className="h-4 w-4" />
										<span>All</span>
									</Button>
								</SheetTrigger>
								<SheetContent side="left" className="w-[300px] sm:w-[400px]">
									<nav className="flex flex-col h-full">
										<h2 className="font-bold text-lg mb-4">Shop By Category</h2>
										{allMenuItems.map((item) => (
											<Link key={item.id} href={item.url} className="flex items-center justify-between py-2 px-4 hover:bg-muted rounded-md" onClick={() => setIsSheetOpen(false)}>
												{item.title}
												<ChevronRight className="h-4 w-4" />
											</Link>
										))}
									</nav>
								</SheetContent>
							</Sheet>
							{subHeaderItems.map((item) => (
								<Link key={item.id} href={item.url} className="text-sm hover:text-foreground/80 py-1">
									{item.title}
								</Link>
							))}
						</div>
					</div>
				</div>
			</nav>
		</header>
	);
}
