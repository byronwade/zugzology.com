"use client";

import { BookmarkIcon, Heart, Link2, Mail, MessageCircle, Share2 } from "lucide-react";
import { Link } from "@/components/ui/link";
import { memo, useCallback } from "react";
import { toast } from "sonner";
import { useWishlist } from "@/components/providers";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ShopifyProduct, ShopifyProductVariant } from "@/lib/types";
import { cn } from "@/lib/utils";

type ProductActionsProps = {
	product: ShopifyProduct;
	selectedVariant: ShopifyProductVariant | null;
};

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
					} catch (_error) {
						toast.error("Failed to copy link");
					}
					break;
				case "facebook":
					window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`, "_blank");
					break;
				case "twitter":
					window.open(
						`https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(productTitle)}`,
						"_blank"
					);
					break;
				case "email":
					window.open(
						`mailto:?subject=${encodeURIComponent(productTitle)}&body=${encodeURIComponent(`Check out this product: ${productUrl}`)}`,
						"_blank"
					);
					break;
			}
		},
		[product.handle, product.title]
	);

	return (
		<div className="space-y-4">
			{/* Social Actions */}
			<div className="mt-4 flex gap-4">
				<Button
					className={cn("flex-1 gap-2", isWishlisted && "border-primary bg-primary/5 text-primary")}
					onClick={handleWishlist}
					variant="outline"
				>
					<Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
					{isWishlisted ? "Saved" : "Save for Later"}
				</Button>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button className="flex-1 gap-2" variant="outline">
							<Share2 className="h-4 w-4" />
							Share
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-56">
						<DropdownMenuItem className="cursor-pointer" onClick={() => handleShare("copy")}>
							<Link2 className="mr-2 h-4 w-4" />
							Copy Link
						</DropdownMenuItem>
						<DropdownMenuItem className="cursor-pointer" onClick={() => handleShare("facebook")}>
							<BookmarkIcon className="mr-2 h-4 w-4" />
							Facebook
						</DropdownMenuItem>
						<DropdownMenuItem className="cursor-pointer" onClick={() => handleShare("twitter")}>
							<MessageCircle className="mr-2 h-4 w-4" />
							Twitter
						</DropdownMenuItem>
						<DropdownMenuItem className="cursor-pointer" onClick={() => handleShare("email")}>
							<Mail className="mr-2 h-4 w-4" />
							Email
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Wishlist Link */}
			{isWishlisted && (
				<div className="mt-2 text-center">
					<Button asChild className="text-muted-foreground text-sm" variant="link">
						<Link href="/wishlist">View Wishlist</Link>
					</Button>
				</div>
			)}
		</div>
	);
});

ProductActions.displayName = "ProductActions";
