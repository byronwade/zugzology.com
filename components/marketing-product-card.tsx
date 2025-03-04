"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check } from "lucide-react";

interface ProductCardProps {
	id: string;
	name: string;
	description: string;
	price: number;
	originalPrice?: number;
	image: string;
	isNew?: boolean;
	isFeatured?: boolean;
	onSale?: boolean;
}

export function MarketingProductCard({
	id,
	name,
	description,
	price,
	originalPrice,
	image,
	isNew = false,
	isFeatured = false,
	onSale = false,
}: ProductCardProps) {
	const [isAdding, setIsAdding] = useState(false);
	const [isAdded, setIsAdded] = useState(false);
	const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

	const handleAddToCart = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (isAdded) return;

		setIsAdding(true);

		// Simulate adding to cart
		setTimeout(() => {
			setIsAdding(false);
			setIsAdded(true);

			// Reset after 2 seconds
			setTimeout(() => {
				setIsAdded(false);
			}, 2000);
		}, 600);
	};

	return (
		<div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
			<div className="relative aspect-square overflow-hidden bg-gray-100">
				<Image
					src={image || "/placeholder.svg"}
					alt={name}
					fill
					className="object-cover transition-transform group-hover:scale-105"
					sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
				/>
				<div className="absolute top-2 left-2 flex flex-col gap-1">
					{isNew && <Badge className="bg-blue-500 hover:bg-blue-600">New</Badge>}
					{onSale && <Badge variant="destructive">-{discount}%</Badge>}
					{isFeatured && <Badge variant="secondary">Featured</Badge>}
				</div>
			</div>
			<div className="flex flex-1 flex-col p-4">
				<h3 className="text-lg font-medium text-gray-900">{name}</h3>
				<p className="mt-1 text-sm text-gray-500 line-clamp-2">{description}</p>
				<div className="mt-auto pt-4">
					<div className="flex items-center justify-between">
						<div>
							{onSale && originalPrice ? (
								<div className="flex items-center gap-1.5">
									<span className="text-lg font-bold text-gray-900">${price.toFixed(2)}</span>
									<span className="text-sm text-gray-500 line-through">${originalPrice.toFixed(2)}</span>
								</div>
							) : (
								<span className="text-lg font-bold text-gray-900">${price.toFixed(2)}</span>
							)}
						</div>
						<Button
							size="sm"
							variant={isAdded ? "default" : "outline"}
							className={`rounded-full p-2 transition-all ${isAdded ? "bg-green-600 hover:bg-green-700" : ""}`}
							onClick={handleAddToCart}
							disabled={isAdding}
						>
							{isAdding ? (
								<span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
							) : isAdded ? (
								<Check className="h-4 w-4" />
							) : (
								<ShoppingCart className="h-4 w-4" />
							)}
							<span className="sr-only">Add to cart</span>
						</Button>
					</div>
				</div>
			</div>
			<Link href={`/products/${id}`} className="absolute inset-0">
				<span className="sr-only">View {name}</span>
			</Link>
		</div>
	);
}
