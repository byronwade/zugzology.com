"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductImage {
	url: string;
	altText: string | null;
	width: number;
	height: number;
}

interface ProductGalleryProps {
	images: ProductImage[];
	title: string;
	selectedIndex?: number;
	onImageSelect?: (index: number) => void;
}

export function ProductGallery({ images, title, selectedIndex = 0, onImageSelect }: ProductGalleryProps) {
	const [activeIndex, setActiveIndex] = useState(selectedIndex);

	useEffect(() => {
		setActiveIndex(selectedIndex);
	}, [selectedIndex]);

	const handleImageSelect = (index: number) => {
		setActiveIndex(index);
		onImageSelect?.(index);
	};

	return (
		<>
			{/* Thumbnails Column */}
			<div className="hidden md:block md:col-span-1 space-y-4">
				{images.map((image, idx) => (
					<button key={image.url} onClick={() => handleImageSelect(idx)} className={cn("w-full aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800", "cursor-pointer hover:ring-2 ring-primary transition duration-300", activeIndex === idx && "ring-2")}>
						<Image src={image.url} alt={image.altText || `Product image ${idx + 1}`} width={80} height={80} className="object-cover w-full h-full" />
					</button>
				))}
			</div>

			{/* Main Image */}
			<div className="col-span-1 md:col-span-5">
				<div className="sticky top-20">
					<div className="aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 shadow-lg h-[80vh]">{images[activeIndex] && <Image src={images[activeIndex].url} alt={images[activeIndex].altText || title} width={800} height={800} className="object-contain w-full h-[80vh]" priority />}</div>

					{/* Mobile Thumbnails */}
					<div className="mt-4 grid grid-cols-4 gap-4 md:hidden">
						{images.map((image, idx) => (
							<button key={image.url} onClick={() => handleImageSelect(idx)} className={cn("aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800", "cursor-pointer hover:ring-2 ring-primary transition duration-300", activeIndex === idx && "ring-2")}>
								<Image src={image.url} alt={image.altText || `Product image ${idx + 1}`} width={80} height={80} className="object-cover w-full h-full" />
							</button>
						))}
					</div>
				</div>
			</div>
		</>
	);
}
