"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Compass, Clock, Heart, ShoppingBag, ChevronUp } from "lucide-react";
import { Link } from '@/components/ui/link';

interface QuickAction {
	icon: React.ReactNode;
	label: string;
	href: string;
}

const quickActions: QuickAction[] = [
	{
		icon: <Clock className="h-4 w-4" />,
		label: "Recently Viewed",
		href: "/recently-viewed",
	},
	{
		icon: <Heart className="h-4 w-4" />,
		label: "Wishlist",
		href: "/wishlist",
	},
	{
		icon: <ShoppingBag className="h-4 w-4" />,
		label: "Cart",
		href: "/cart",
	},
];

export function EnhancedNavigation() {
	const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

	return (
		<>
			{/* Quick Action Floating Button */}
			<div className="fixed bottom-6 right-6 z-50">
				<AnimatePresence>
					{isQuickActionOpen && (
						<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="absolute bottom-full right-0 mb-2">
							<div className="flex flex-col gap-2 items-end">
								{quickActions.map((action, index) => (
									<motion.div key={action.label} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ delay: index * 0.1 }}>
										<Button variant="secondary" size="sm" className="flex items-center gap-2" asChild>
											<Link href={action.href}>
												{action.icon}
												<span>{action.label}</span>
											</Link>
										</Button>
									</motion.div>
								))}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
				<Button size="icon" className={cn("h-12 w-12 rounded-full shadow-lg transition-transform hover:scale-105", isQuickActionOpen && "rotate-180")} onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}>
					<Compass className="h-6 w-6" />
				</Button>
			</div>

			{/* Enhanced Mega Menu */}
			<NavigationMenu className="hidden lg:flex">
				<NavigationMenuList>
					<NavigationMenuItem>
						<NavigationMenuTrigger>Featured Categories</NavigationMenuTrigger>
						<NavigationMenuContent>
							<div className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
								<div className="row-span-3">
									<NavigationMenuLink asChild>
										<Link className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md" href="/">
											<div className="mb-2 mt-4 text-lg font-medium">Featured Collection</div>
											<p className="text-sm leading-tight text-muted-foreground">Discover our latest and most popular items</p>
										</Link>
									</NavigationMenuLink>
								</div>
								<div className="group grid gap-4">
									{/* Add your category links here */}
									{/* This is a placeholder for demonstration */}
									<div className="group relative rounded-md p-4 hover:bg-muted">
										<Link href="/category/new" className="block">
											<div className="text-sm font-medium mb-1">New Arrivals</div>
											<p className="text-xs text-muted-foreground">Check out our latest products</p>
										</Link>
									</div>
								</div>
							</div>
						</NavigationMenuContent>
					</NavigationMenuItem>
				</NavigationMenuList>
			</NavigationMenu>
		</>
	);
}
