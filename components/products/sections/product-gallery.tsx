"use client";

import { useState, useEffect, useRef } from "react";
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

// Separate thumbnail component
const ThumbnailButton = ({ 
	image, 
	index, 
	isActive, 
	onClick, 
	onMouseEnter,
	layout = "desktop" // 'desktop' | 'mobile'
}: { 
	image: ProductImage;
	index: number;
	isActive: boolean;
	onClick: () => void;
	onMouseEnter: () => void;
	layout?: 'desktop' | 'mobile';
}) => (
	<button 
		onClick={onClick}
		onMouseEnter={onMouseEnter}
		className={cn(
			"relative rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-foreground/10",
			"hover:border-foreground transition duration-200",
			layout === 'desktop' ? "w-16 h-16" : "aspect-square w-full",
			isActive && (layout === 'desktop' ? "border-foreground" : "ring-2 ring-offset-2 ring-primary")
		)}
	>
		<div className="absolute inset-0 overflow-hidden rounded-lg">
			<Image 
				src={image.url} 
				alt={image.altText || `Product image ${index + 1}`} 
				fill 
				className="object-cover" 
				sizes={layout === 'desktop' ? "64px" : "(max-width: 768px) 25vw, 80px"} 
			/>
		</div>
	</button>
);

export function ProductGallery({ images, title, selectedIndex = 0, onImageSelect }: ProductGalleryProps) {
	const [activeIndex, setActiveIndex] = useState(selectedIndex);
	const [mounted, setMounted] = useState(false);
	const thumbnailsRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (mounted) {
			setActiveIndex(selectedIndex);
		}
	}, [selectedIndex, mounted]);

	const handleImageSelect = (index: number) => {
		setActiveIndex(index);
		onImageSelect?.(index);

		if (thumbnailsRef.current) {
			const thumbnails = thumbnailsRef.current.children;
			if (thumbnails[index]) {
				thumbnails[index].scrollIntoView({ behavior: "smooth", block: "nearest" });
			}
		}
	};

	if (!mounted) return null;

	return (
		<div className="flex flex-col md:flex-row gap-4">
			{/* Desktop Thumbnails Column */}
			<div ref={thumbnailsRef} className="hidden lg:flex flex-col gap-2 w-16 pr-2" style={{ maxHeight: "calc(100vh - 200px)" }}>
				{images.map((image, idx) => (
					<ThumbnailButton key={image.url} image={image} index={idx} isActive={activeIndex === idx} onClick={() => handleImageSelect(idx)} onMouseEnter={() => handleImageSelect(idx)} layout="desktop" />
				))}
			</div>

			{/* Main Image and Mobile Thumbnails */}
			<div className="flex-1">
				<div className="relative aspect-square w-full rounded-lg bg-neutral-100 dark:bg-neutral-800 group overflow-hidden max-h-[calc(100vh-200px)] border border-foreground/10">
					{images[activeIndex] && (
						<>
							<Image src={images[activeIndex].url} alt={images[activeIndex].altText || title} fill className="object-contain transition-transform duration-200 group-hover:scale-105" priority sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px" />
							<div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
						</>
					)}
				</div>

				{/* Mobile Thumbnails */}
				<div className="mt-4 grid grid-cols-4 gap-4 lg:hidden">
					{images.map((image, idx) => (
						<ThumbnailButton key={image.url} image={image} index={idx} isActive={activeIndex === idx} onClick={() => handleImageSelect(idx)} onMouseEnter={() => handleImageSelect(idx)} layout="mobile" />
					))}
				</div>
			</div>
		</div>
	);
}
