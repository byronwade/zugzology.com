"use client";

import { BookOpen, ChevronRight, Heart, Home, Loader2, Menu, Package, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { transformShopifyUrl } from "@/components/utils/transform-shopify-url";
import { useStoreConfig } from "@/hooks/use-store-config";
import { getAllCollections, getPages } from "@/lib/api/shopify/actions";
import { CONTENT } from "@/lib/config/wadesdesign.config";
import type { ShopifyCollection, ShopifyPage } from "@/lib/types";

type MenuItem = {
	id: string;
	title: string;
	url: string;
	items?: MenuItem[];
};

type MenuSheetProps = {
	items: MenuItem[];
};

const buildPageUrl = (page: ShopifyPage) => {
	if (page.handle) {
		return `/pages/${page.handle}`;
	}
	return transformShopifyUrl(page.onlineStoreUrl || "/");
};

export function MenuSheetFixed({ items }: MenuSheetProps) {
	const router = useRouter();
	const { storeName } = useStoreConfig();
	const { openCart } = useCart();
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [collections, setCollections] = useState<ShopifyCollection[]>([]);
	const [pages, setPages] = useState<ShopifyPage[]>([]);

	const handleOpenChange = useCallback((open: boolean) => {
		setIsOpen(open);
	}, []);

	useEffect(() => {
		if (!isOpen) {
			return;
		}
		if (collections.length && pages.length) {
			return;
		}

		setIsLoading(true);
		Promise.all([getAllCollections(), getPages()])
			.then(([collectionData, pageData]) => {
				setCollections(collectionData ?? []);
				setPages(pageData ?? []);
			})
			.catch((_error) => {})
			.finally(() => setIsLoading(false));
	}, [isOpen, collections.length, pages.length]);

	const handleNavigate = useCallback(
		(url: string) => {
			setIsOpen(false);
			requestAnimationFrame(() => router.push(url));
		},
		[router]
	);

	const handleCartClick = useCallback(() => {
		setIsOpen(false);
		requestAnimationFrame(() => openCart());
	}, [openCart]);

	const featuredCollections = useMemo(() => collections.slice(0, 8), [collections]);
	const featuredPages = useMemo(() => pages.slice(0, 6), [pages]);

	return (
		<Sheet onOpenChange={handleOpenChange} open={isOpen}>
			<SheetTrigger asChild>
				<Button
					className="mr-4 h-8 w-8 rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
					size="icon"
					variant="ghost"
				>
					<Menu className="h-5 w-5" />
					<span className="sr-only">{CONTENT.navigation.buttons.menu}</span>
				</Button>
			</SheetTrigger>
			<SheetContent className="flex w-full flex-col p-0 sm:max-w-md" side="left">
				{/* Header */}
				<div className="flex items-center justify-between border-border border-b p-4">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
							<Menu className="h-5 w-5 text-primary" />
						</div>
						<div>
							<SheetTitle className="font-semibold text-foreground">{CONTENT.navigation.buttons.menu}</SheetTitle>
							<p className="text-muted-foreground text-xs">{storeName}</p>
						</div>
					</div>
				</div>

				{/* Content */}
				<ScrollArea className="flex-1">
					{isLoading && !collections.length && !pages.length ? (
						<div className="flex items-center justify-center py-20 text-muted-foreground">
							<Loader2 className="h-6 w-6 animate-spin" />
						</div>
					) : (
						<div className="space-y-6 p-4">
							{/* Main Navigation */}
							{items.length > 0 && (
								<div className="space-y-2">
									<h3 className="mb-3 px-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
										Navigation
									</h3>
									<div className="space-y-1">
										{items.map((item) => (
											<div key={item.id}>
												<button
													className="group flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted"
													onClick={() => handleNavigate(item.url)}
												>
													<span className="font-medium text-foreground text-sm">{item.title}</span>
													<ChevronRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-foreground" />
												</button>
												{/* Render submenu items if they exist */}
												{item.items && item.items.length > 0 && (
													<div className="ml-4 mt-1 space-y-1 border-muted-foreground/20 border-l pl-3">
														{item.items.map((subItem) => (
															<button
																className="group flex w-full items-center justify-between rounded-lg p-2 text-left transition-colors hover:bg-muted"
																key={subItem.id}
																onClick={() => handleNavigate(subItem.url)}
															>
																<span className="text-muted-foreground text-xs">{subItem.title}</span>
																<ChevronRight className="h-3 w-3 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-foreground" />
															</button>
														))}
													</div>
												)}
											</div>
										))}
									</div>
								</div>
							)}

							{/* Collections */}
							{featuredCollections.length > 0 && (
								<div className="space-y-2">
									<h3 className="mb-3 px-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
										Collections
									</h3>
									<div className="space-y-1">
										{featuredCollections.map((collection) => (
											<button
												className="group flex w-full items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted"
												key={collection.id}
												onClick={() => handleNavigate(`/collections/${collection.handle}`)}
											>
												<div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-muted">
													{collection.image?.url ? (
														<Image
															alt={collection.title}
															className="h-full w-full object-cover"
															height={48}
															src={collection.image.url}
															width={48}
														/>
													) : (
														<div className="flex h-full w-full items-center justify-center">
															<Package className="h-5 w-5 text-muted-foreground" />
														</div>
													)}
												</div>
												<div className="min-w-0 flex-1 text-left">
													<p className="truncate font-medium text-foreground text-sm">{collection.title}</p>
													<p className="text-muted-foreground text-xs">
														{collection.products?.productsCount ?? collection.products?.nodes?.length ?? 0} products
													</p>
												</div>
												<ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-foreground" />
											</button>
										))}
									</div>
								</div>
							)}

							{/* Pages */}
							{featuredPages.length > 0 && (
								<div className="space-y-2">
									<h3 className="mb-3 px-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
										Information
									</h3>
									<div className="space-y-1">
										{featuredPages.map((page) => (
											<button
												className="group flex w-full items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted"
												key={page.id}
												onClick={() => handleNavigate(buildPageUrl(page))}
											>
												<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-primary/10">
													<BookOpen className="h-4 w-4 text-primary" />
												</div>
												<div className="min-w-0 flex-1 text-left">
													<p className="truncate font-medium text-foreground text-sm">{page.title}</p>
													{page.bodySummary && (
														<p className="line-clamp-1 text-muted-foreground text-xs">{page.bodySummary}</p>
													)}
												</div>
												<ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-foreground" />
											</button>
										))}
									</div>
								</div>
							)}
						</div>
					)}
				</ScrollArea>

				{/* Footer Actions */}
				<div className="border-border border-t p-4">
					<div className="grid grid-cols-3 gap-2">
						<Button
							className="flex h-auto flex-col gap-1 py-3"
							onClick={() => handleNavigate("/")}
							size="sm"
							variant="outline"
						>
							<Home className="h-5 w-5 text-muted-foreground" />
							<span className="text-xs">{CONTENT.navigation.buttons.home}</span>
						</Button>
						<Button
							className="flex h-auto flex-col gap-1 py-3"
							onClick={() => handleNavigate("/wishlist")}
							size="sm"
							variant="outline"
						>
							<Heart className="h-5 w-5 text-muted-foreground" />
							<span className="text-xs">{CONTENT.navigation.buttons.wishlist}</span>
						</Button>
						<Button
							className="flex h-auto flex-col gap-1 bg-primary py-3 hover:bg-primary/90"
							onClick={handleCartClick}
							size="sm"
							variant="default"
						>
							<ShoppingCart className="h-5 w-5" />
							<span className="text-xs">{CONTENT.navigation.buttons.cart}</span>
						</Button>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
