"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, Sun, Moon, Sprout, User, ShoppingCart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

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

	useEffect(() => {
		setMounted(true);
	}, []);

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

	return (
		<header className="bg-background text-foreground sticky top-0 z-50">
			{/* Top Bar */}
			<div className="px-2 sm:px-4 py-3">
				<div className="flex items-center justify-between">
					{/* Logo */}
					<div className="flex items-center">
						<Link href="/" className="flex items-center space-x-2">
							<div className="relative w-6 h-6">
								<Image src="/logo.png" alt="Zugzology Logo" fill className="object-contain invert dark:invert-0" sizes="24px" />
							</div>
							<span className="hidden md:inline text-lg font-bold">Zugzology</span>
						</Link>
					</div>

					{/* Search Bar */}
					<div className="flex-1 mx-2">
						<form className="relative w-full">
							<div className="relative">
								<Input type="text" className="w-full pr-10 h-8" placeholder="Search Zugzology..." />
								<button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
									<Search className="h-4 w-4 text-gray-400" />
								</button>
							</div>
						</form>
					</div>

					{/* Action Buttons */}
					<div className="flex items-center space-x-2">
						<Button variant="secondary" size="icon" className="h-8 w-8" onClick={toggleTheme}>
							{mounted && theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
						</Button>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button className="flex items-center gap-1 sm:gap-2 h-8 px-2 sm:px-3 bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600" size="sm">
									<Sprout className="h-4 w-4" />
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

						<Link href="/account">
							<Button variant="secondary" size="icon" className="h-8 w-8">
								<User className="h-4 w-4" />
							</Button>
						</Link>

						<Link href="/cart">
							<Button variant="outline" size="icon" className="h-8 w-8 relative">
								<ShoppingCart className="h-4 w-4" />
							</Button>
						</Link>
					</div>
				</div>
			</div>

			{/* Navigation */}
			<nav className="border-t bg-muted">
				<div className="px-2 sm:px-4">
					<div className="flex items-center py-2">
						<div className="flex items-center space-x-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
							<Sheet>
								<SheetTrigger asChild>
									<Button variant="outline" size="sm" className="flex items-center gap-2">
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
												<Link href={item.url} className="flex items-center py-2 hover:text-primary">
													{item.title}
												</Link>
												{index < allMenuItems.length - 1 && <Separator className="my-2" />}
											</div>
										))}
									</ScrollArea>
								</SheetContent>
							</Sheet>

							{mainMenuItems.map((item) => (
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
