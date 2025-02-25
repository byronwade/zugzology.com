"use client";

import { Loader2, ShoppingCart, Package, ArrowRight, Shield, TruckIcon, Star, Info, Check, HeartHandshake, Users, Headphones, Percent, Heart, Share2, Link2, Mail, MessageCircle, BookmarkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback, memo } from "react";
import { toast } from "sonner";
import { ShopifyProduct, ShopifyProductVariant } from "@/lib/types";
import { useWishlist } from "@/lib/providers/wishlist-provider";
import Link from "next/link";

interface ProductActionsProps {
	product: ShopifyProduct;
	selectedVariant: ShopifyProductVariant | null;
}

export const ProductActions = memo(function ProductActions({ product, selectedVariant }: ProductActionsProps) {
	const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
	const isWishlisted = isInWishlist(product.handle);

	const handleWishlist = useCallback(() => {
		if (isWishlisted) {
			removeFromWishlist(product.handle);
			toast.success("Removed from wishlist");
		} else {
			addToWishlist(product.handle);
			toast.success("Added to wishlist");
		}
	}, [isWishlisted, product.handle, addToWishlist, removeFromWishlist]);

	const handleShare = useCallback(
		async (platform: string) => {
			const productUrl = `https://zugzology.com/products/${product.handle}`;
			const productTitle = product.title;

			switch (platform) {
				case "copy":
					try {
						await navigator.clipboard.writeText(productUrl);
						toast.success("Link copied to clipboard");
					} catch (error) {
						console.error("Failed to copy link:", error);
						toast.error("Failed to copy link");
					}
					break;
				case "facebook":
					window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`, "_blank");
					break;
				case "twitter":
					window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(productTitle)}`, "_blank");
					break;
				case "email":
					window.open(`mailto:?subject=${encodeURIComponent(productTitle)}&body=${encodeURIComponent(`Check out this product: ${productUrl}`)}`, "_blank");
					break;
			}
		},
		[product.handle, product.title]
	);

	return (
		<div className="space-y-4">
			{/* Social Actions */}
			<div className="flex gap-4 mt-4">
				<Button variant="outline" onClick={handleWishlist} className={cn("flex-1 gap-2", isWishlisted && "bg-primary/5 border-primary text-primary")}>
					<Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
					{isWishlisted ? "Saved" : "Save for Later"}
				</Button>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="flex-1 gap-2">
							<Share2 className="h-4 w-4" />
							Share
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-56">
						<DropdownMenuItem onClick={() => handleShare("copy")} className="cursor-pointer">
							<Link2 className="mr-2 h-4 w-4" />
							Copy Link
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => handleShare("facebook")} className="cursor-pointer">
							<BookmarkIcon className="mr-2 h-4 w-4" />
							Facebook
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => handleShare("twitter")} className="cursor-pointer">
							<MessageCircle className="mr-2 h-4 w-4" />
							Twitter
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => handleShare("email")} className="cursor-pointer">
							<Mail className="mr-2 h-4 w-4" />
							Email
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Wishlist Link */}
			{isWishlisted && (
				<div className="mt-2 text-center">
					<Button variant="link" className="text-sm text-muted-foreground" asChild>
						<Link href="/wishlist">View Wishlist</Link>
					</Button>
				</div>
			)}
		</div>
	);
});

ProductActions.displayName = "ProductActions";
