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

	if (!mounted) {
		return null;
	}

	return (
		<div className="flex flex-col md:flex-row gap-4">
			{/* Thumbnails Column */}
			<div ref={thumbnailsRef} className="hidden md:flex flex-col gap-2 w-16 pr-2" style={{ maxHeight: "calc(100vh - 200px)" }}>
				{images.map((image, idx) => (
					<button key={image.url} onClick={() => handleImageSelect(idx)} className={cn("relative w-16 h-16 rounded-lg bg-neutral-100 dark:bg-neutral-800", "hover:ring-2 hover:ring-offset-2 ring-primary transition duration-200", activeIndex === idx && "ring-2 ring-offset-2 ring-primary")} onMouseEnter={() => handleImageSelect(idx)}>
						<div className="absolute inset-0 overflow-hidden rounded-lg">
							<Image src={image.url} alt={image.altText || `Product image ${idx + 1}`} fill className="object-cover" sizes="64px" />
						</div>
					</button>
				))}
			</div>

			{/* Main Image */}
			<div className="flex-1">
				<div className="relative aspect-square w-full rounded-lg bg-neutral-100 dark:bg-neutral-800 group overflow-hidden">
					{images[activeIndex] && (
						<>
							<Image src={images[activeIndex].url} alt={images[activeIndex].altText || title} fill className="object-contain transition-transform duration-200 group-hover:scale-105" priority sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px" />
							<div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
						</>
					)}
				</div>

				{/* Mobile Thumbnails */}
				<div className="mt-4 grid grid-cols-4 gap-4 md:hidden">
					{images.map((image, idx) => (
						<button key={image.url} onClick={() => handleImageSelect(idx)} className={cn("relative aspect-square w-full rounded-lg bg-neutral-100 dark:bg-neutral-800", "hover:ring-2 hover:ring-offset-2 ring-primary transition duration-200", activeIndex === idx && "ring-2 ring-offset-2 ring-primary")}>
							<div className="absolute inset-0 overflow-hidden rounded-lg">
								<Image src={image.url} alt={image.altText || `Product image ${idx + 1}`} fill className="object-cover" sizes="(max-width: 768px) 25vw, 80px" />
							</div>
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
