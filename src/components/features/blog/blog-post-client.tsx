"use client";

import { ExternalLink, Percent } from "lucide-react";
import Image from "next/image";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { AdPlaceholder } from "@/components/ads/ad-placeholder";
import { ProductAd } from "@/components/features/blog/product-ad";
import { useAnchorScroll } from "@/hooks/use-anchor-scroll";
import type { ShopifyProduct } from "@/lib/types";

type BlogPostClientProps = {
	children: ReactNode;
	featuredProducts?: ShopifyProduct[];
};

export function BlogPostClient({ children, featuredProducts = [] }: BlogPostClientProps) {
	const [isMounted, setIsMounted] = useState(false);
	const contentRef = useRef<HTMLDivElement>(null);

	// Use the simplified anchor scroll hook to track scrolling state only
	useAnchorScroll();

	// Set up heading IDs and handle initial hash
	useEffect(() => {
		setIsMounted(true);

		// This function ensures all headings have proper IDs for linking
		const setupHeadingIds = () => {
			if (!contentRef.current) {
				return;
			}

			// Get all headings in the blog content
			const headings = contentRef.current.querySelectorAll("h2, h3, h4, h5, h6");

			// Process each heading
			headings.forEach((heading) => {
				const headingElement = heading as HTMLElement;
				// If the heading already has an ID, keep it
				if (!headingElement.id && headingElement.textContent) {
					// Create an ID from the heading content
					const id = headingElement.textContent
						.trim()
						.toLowerCase()
						.replace(/[^\w\s-]/g, "")
						.replace(/\s+/g, "-");

					headingElement.id = id;
				}
			});
		};

		// Give the DOM time to fully render
		const timer = setTimeout(() => {
			setupHeadingIds();

			// After IDs are set up, handle any initial hash in the URL
			if (window.location.hash) {
				const hash = window.location.hash.substring(1);
				const targetElement = document.getElementById(hash);

				if (targetElement) {
					// Wait a little longer to ensure everything is ready
					setTimeout(() => {
						// Scroll to the element with offset
						const headerOffset = 100;
						const elementPosition = targetElement.getBoundingClientRect().top;
						const offsetPosition = elementPosition + window.scrollY - headerOffset;

						window.scrollTo({
							top: offsetPosition,
							behavior: "smooth",
						});
					}, 200);
				}
			}
		}, 300);

		return () => clearTimeout(timer);
	}, []);

	// Limit to 4 products for the sidebar
	const limitedProducts = featuredProducts?.slice(0, 4) || [];

	// Don't render until client-side
	if (!isMounted) {
		return null;
	}

	return (
		<div className="mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-8">
			<div className="grid grid-cols-1 gap-8 xl:grid-cols-[70%_30%]">
				<div className="blog-content w-full" ref={contentRef}>
					{children}
				</div>

				{/* Sidebar */}
				<aside className="hidden xl:block">
					<div className="space-y-6">
						{/* Featured Products */}
						{limitedProducts.length > 0 && (
							<div className="rounded-lg border bg-background p-4">
								<h3 className="mb-4 font-semibold text-lg">Featured Products</h3>
								<ProductAd products={limitedProducts} />
							</div>
						)}

						{/* Advertisement */}
						<AdPlaceholder type="advertise" />

						{/* Bulk Discount Advertisement */}
						<a
							className="block w-full overflow-hidden rounded-xl border border-foreground/10 bg-white text-foreground dark:bg-card dark:text-gray-100"
							href="https://allinonegrowbags.com"
							rel="noopener noreferrer sponsored"
							target="_blank"
						>
							<div className="relative">
								{/* Advertisement Label */}
								<div className="bg-primary py-2 text-center font-bold text-sm text-white">ADVERTISEMENT</div>

								{/* Product Image */}
								<div className="relative aspect-square">
									<Image
										alt="All-in-One Mushroom Grow Bag"
										className="object-cover"
										fill
										priority
										sizes="(max-width: 1280px) 0vw, 30vw"
										src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sterile-all-in-one-mushroom-grow-bag-4-lbs-substrate-and-grain-filter-patch-112491-Hkoucg5alJXunr83eIolGhCMiHCxR3-FeibS7qNAKjyL9XrVQosZdlm9U2qlF.webp"
									/>
									<div className="absolute top-2 right-2 rounded-full bg-primary p-2">
										<Percent className="h-6 w-6 text-white" />
									</div>
								</div>

								{/* Content */}
								<div className="space-y-4 p-4">
									<div>
										<h3 className="mb-1 font-bold text-xl leading-tight tracking-tight">
											All-in-One Mushroom Grow Bags
										</h3>
										<p className="text-muted-foreground text-sm dark:text-muted-foreground">
											Premium 4 lbs bags with sterilized substrate
										</p>
									</div>

									{/* Bulk Discount Information */}
									<div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
										<h4 className="mb-2 font-bold text-primary">Bulk Discounts:</h4>
										<ul className="space-y-1 text-sm">
											<li>2+ Bags: 15% OFF</li>
											<li>5+ Bags: 25% OFF</li>
											<li>10+ Bags: 30% OFF</li>
											<li>20+ Bags: 35% OFF</li>
										</ul>
									</div>

									<div className="flex items-center justify-between">
										<span className="font-bold text-2xl">$24.95</span>
										<span className="text-primary text-sm">Free Shipping</span>
									</div>

									<button className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2 font-medium text-white">
										Shop Now <ExternalLink className="h-4 w-4" />
									</button>
								</div>

								{/* External Link Notice */}
								<div className="bg-muted py-2 text-center text-muted-foreground text-xs dark:bg-muted dark:text-muted-foreground">
									Links to: allinonegrowbags.com
								</div>
							</div>
						</a>
					</div>
				</aside>
			</div>
		</div>
	);
}
