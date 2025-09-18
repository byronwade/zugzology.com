"use client";

import { memo, useMemo, useCallback } from "react";
import { Search, ShoppingCart, User, Heart, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { useCart } from "@/components/providers/cart-provider";
import { useSearch } from "@/components/providers";
import { smartMemo } from "@/lib/utils/performance";

interface SearchBarProps {
	placeholder: string;
	onSearch: (query: string) => void;
	onFocus: () => void;
	className?: string;
}

// Memoized search bar component
const SearchBar = smartMemo<React.FC<SearchBarProps>>(function SearchBar({ 
	placeholder, 
	onSearch, 
	onFocus, 
	className 
}) {
	const { searchQuery, setSearchQuery } = useSearch();

	const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearchQuery(value);
		onSearch(value);
	}, [setSearchQuery, onSearch]);

	return (
		<div className={`relative flex-1 max-w-lg ${className}`}>
			<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
				<Search className="h-5 w-5 text-gray-400" />
			</div>
			<Input
				type="text"
				placeholder={placeholder}
				value={searchQuery}
				onChange={handleChange}
				onFocus={onFocus}
				className="pl-10 pr-4 w-full"
			/>
		</div>
	);
});

interface CartButtonProps {
	onClick: () => void;
	className?: string;
}

// Memoized cart button with optimized count calculation
const CartButton = smartMemo<React.FC<CartButtonProps>>(function CartButton({ onClick, className }) {
	const { getItemCount, isLoading } = useCart();
	
	// Memoize item count to prevent recalculation on every render
	const itemCount = useMemo(() => getItemCount(), [getItemCount]);

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={onClick}
			className={`relative ${className}`}
			disabled={isLoading}
		>
			<ShoppingCart className="h-5 w-5" />
			{itemCount > 0 && (
				<Badge 
					variant="destructive" 
					className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center text-xs p-0 min-w-[1.5rem]"
				>
					{itemCount > 99 ? "99+" : itemCount}
				</Badge>
			)}
		</Button>
	);
});

interface ThemeToggleProps {
	className?: string;
}

// Memoized theme toggle component
const ThemeToggle = smartMemo<React.FC<ThemeToggleProps>>(function ThemeToggle({ className }) {
	const { theme, setTheme } = useTheme();

	const toggleTheme = useCallback(() => {
		setTheme(theme === "dark" ? "light" : "dark");
	}, [theme, setTheme]);

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={toggleTheme}
			className={className}
		>
			{theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
		</Button>
	);
});

interface UserMenuProps {
	isAuthenticated: boolean;
	onSignIn: () => void;
	onSignOut: () => void;
	onAccount: () => void;
	className?: string;
}

// Memoized user menu component
const UserMenu = smartMemo<React.FC<UserMenuProps>>(function UserMenu({ 
	isAuthenticated, 
	onSignIn, 
	onSignOut, 
	onAccount, 
	className 
}) {
	if (!isAuthenticated) {
		return (
			<Button
				variant="ghost"
				size="icon"
				onClick={onSignIn}
				className={className}
			>
				<User className="h-5 w-5" />
			</Button>
		);
	}

	return (
		<div className="flex items-center gap-2">
			<Button
				variant="ghost"
				size="icon"
				onClick={onAccount}
				className={className}
			>
				<User className="h-5 w-5" />
			</Button>
		</div>
	);
});

interface WishlistButtonProps {
	onClick: () => void;
	count?: number;
	className?: string;
}

// Memoized wishlist button
const WishlistButton = smartMemo<React.FC<WishlistButtonProps>>(function WishlistButton({ 
	onClick, 
	count = 0, 
	className 
}) {
	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={onClick}
			className={`relative ${className}`}
		>
			<Heart className="h-5 w-5" />
			{count > 0 && (
				<Badge 
					variant="secondary" 
					className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center text-xs p-0 min-w-[1.5rem]"
				>
					{count > 99 ? "99+" : count}
				</Badge>
			)}
		</Button>
	);
});

// Export all optimized components
export {
	SearchBar,
	CartButton,
	ThemeToggle,
	UserMenu,
	WishlistButton,
};