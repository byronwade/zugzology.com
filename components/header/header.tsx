"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, Sun, Sprout, User, ShoppingCart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header() {
	return (
		<header className="bg-background text-foreground sticky top-0 z-50">
			{/* Top Bar */}
			<div className="px-2 sm:px-4 py-3">
				<div className="flex items-center justify-between">
					{/* Logo */}
					<div className="flex items-center">
						<Link href="/" className="flex items-center space-x-2">
							<div className="relative w-6 h-6">
								<Image src="/logo.png" alt="Zugzology Logo" fill className="object-contain invert" sizes="24px" />
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
						<Button variant="secondary" size="icon" className="h-8 w-8">
							<Sun className="h-4 w-4" />
						</Button>

						<Button className="flex items-center gap-1 sm:gap-2 h-8 px-2 sm:px-3 bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600" size="sm">
							<Sprout className="h-4 w-4" />
							<span className="hidden sm:inline">Microdosing</span>
						</Button>

						<Link href="/account">
							<Button variant="secondary" size="icon" className="h-8 w-8">
								<User className="h-4 w-4" />
							</Button>
						</Link>

						<Button variant="outline" size="icon" className="h-8 w-8 relative">
							<ShoppingCart className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>

			{/* Navigation */}
			<nav className="border-t bg-muted">
				<div className="px-2 sm:px-4">
					<div className="flex items-center py-2">
						<div className="flex items-center space-x-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
							<Button variant="outline" size="sm" className="flex items-center gap-2">
								<Menu className="h-4 w-4" />
								<span>All</span>
							</Button>

							<Link href="/collections/zugzbars" className="text-sm hover:text-foreground/80 py-1">
								Zugzbars
							</Link>
							<Link href="/myceliums-gambit" className="text-sm hover:text-foreground/80 py-1">
								Mycelium&apos;s Gambit
							</Link>
							<Link href="/products" className="text-sm hover:text-foreground/80 py-1">
								Catalog
							</Link>
							<Link href="/pages/contact" className="text-sm hover:text-foreground/80 py-1">
								Contact
							</Link>
							<Link href="/collections/medicinal" className="text-sm hover:text-foreground/80 py-1">
								Medcinal
							</Link>
						</div>
					</div>
				</div>
			</nav>
		</header>
	);
}
