import { Loader2, ShoppingCart, Package, ArrowRight, Shield, TruckIcon, Star, Info, Check, HeartHandshake, Users, Headphones, Percent, Heart, Share2, Link2, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ShopifyProduct, ShopifyProductVariant } from "@/lib/types";

interface ProductActionsProps {
	product: ShopifyProduct;
	selectedVariant: ShopifyProductVariant | null;
}

export function ProductActions({ product, selectedVariant }: ProductActionsProps) {
	const [isWishlisted, setIsWishlisted] = useState(false);

	useEffect(() => {
		const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
		setIsWishlisted(wishlist.includes(product.handle));
	}, [product.handle]);

	const handleWishlist = () => {
		const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
		let newWishlist;
		if (isWishlisted) {
			newWishlist = wishlist.filter((item: string) => item !== product.handle);
			toast.success("Removed from wishlist");
		} else {
			newWishlist = [...wishlist, product.handle];
			toast.success("Added to wishlist");
		}
		localStorage.setItem("wishlist", JSON.stringify(newWishlist));
		setIsWishlisted(!isWishlisted);
	};

	const handleShare = async (platform: string) => {
		const productUrl = `https://zugzology.com/products/${product.handle}`;

		switch (platform) {
			case "copy":
				await navigator.clipboard.writeText(productUrl);
				toast.success("Link copied to clipboard");
				break;
			case "facebook":
				window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`, "_blank");
				break;
			case "twitter":
				window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(product.title)}`, "_blank");
				break;
			case "email":
				window.open(`mailto:?subject=${encodeURIComponent(product.title)}&body=${encodeURIComponent(`Check out this product: ${productUrl}`)}`, "_blank");
				break;
		}
	};

	// Add after the buy button section
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
					<MessageCircle className="mr-2 h-4 w-4" />
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
	</div>;

	{
		isWishlisted && (
			<div className="mt-2 text-center">
				<Button variant="link" asChild className="text-sm text-muted-foreground">
					<a href="/wishlist">View Wishlist</a>
				</Button>
			</div>
		);
	}
}
