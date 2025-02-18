"use client";

import { memo } from "react";
import { MainNav } from "@/components/layout/main-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Search } from "@/components/search";
import { CartSheet } from "@/components/cart/cart-sheet";
import { Link } from "@/components/ui/link";
import { Logo } from "@/components/logo";

interface HeaderProps {
	menuItems: Array<{
		id: string;
		title: string;
		url: string;
		items?: Array<{
			id: string;
			title: string;
			url: string;
		}>;
	}>;
}

const Header = memo(function Header({ menuItems }: HeaderProps) {
	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex h-16 items-center">
				<MainNav menuItems={menuItems} />
				<div className="flex flex-1 items-center justify-end space-x-4">
					<div className="flex-1 flex items-center justify-end space-x-4">
						<Search />
						<CartSheet />
					</div>
					<MobileNav menuItems={menuItems} />
				</div>
			</div>
		</header>
	);
});

Header.displayName = "Header";

export { Header };
