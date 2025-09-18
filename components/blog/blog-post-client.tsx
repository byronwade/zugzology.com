"use client";

import { useEffect, ReactNode, useState, useRef } from "react";
import { useAnchorScroll } from "@/hooks/use-anchor-scroll";
import { ProductAd } from "@/components/blog/product-ad";
import { AdPlaceholder } from "@/components/ads/ad-placeholder";
import { Percent, ExternalLink } from "lucide-react";
import Image from "next/image";
import type { ShopifyProduct } from "@/lib/types";

interface BlogPostClientProps {
	children: ReactNode;
	featuredProducts?: ShopifyProduct[];
}

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
			if (!contentRef.current) return;

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
					console.log(`Set ID for heading: ${id}`);
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
		<div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
			<div className="grid grid-cols-1 xl:grid-cols-[70%_30%] gap-8">
				<div ref={contentRef} className="w-full blog-content">
					{children}
				</div>

				{/* Sidebar */}
				<aside className="hidden xl:block">
					<div className="space-y-6">
						{/* Featured Products */}
						{limitedProducts.length > 0 && (
							<div className="rounded-lg border p-4 bg-background">
								<h3 className="text-lg font-semibold mb-4">Featured Products</h3>
								<ProductAd products={limitedProducts} />
							</div>
						)}

						{/* Advertisement */}
						<AdPlaceholder type="advertise" />

						{/* Bulk Discount Advertisement */}
						<a
							href="https://allinonegrowbags.com"
							target="_blank"
							rel="noopener noreferrer sponsored"
							className="block w-full rounded-xl overflow-hidden border border-foreground/10 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100"
						>
							<div className="relative">
								{/* Advertisement Label */}
								<div className="bg-purple-600 text-white text-center py-2 text-sm font-bold">ADVERTISEMENT</div>

								{/* Product Image */}
								<div className="relative aspect-square">
									<Image
										src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sterile-all-in-one-mushroom-grow-bag-4-lbs-substrate-and-grain-filter-patch-112491-Hkoucg5alJXunr83eIolGhCMiHCxR3-FeibS7qNAKjyL9XrVQosZdlm9U2qlF.webp"
										alt="All-in-One Mushroom Grow Bag"
										fill
										className="object-cover"
										priority
									/>
									<div className="absolute top-2 right-2 p-2 rounded-full bg-purple-500">
										<Percent className="w-6 h-6 text-white" />
									</div>
								</div>

								{/* Content */}
								<div className="p-4 space-y-4">
									<div>
										<h3 className="text-xl font-bold tracking-tight leading-tight mb-1">
											All-in-One Mushroom Grow Bags
										</h3>
										<p className="text-sm text-gray-600 dark:text-gray-400">
											Premium 4 lbs bags with sterilized substrate
										</p>
									</div>

									{/* Bulk Discount Information */}
									<div className="p-3 rounded-lg border border-purple-200 bg-purple-50 dark:border-purple-700 dark:bg-gray-800">
										<h4 className="font-bold mb-2 text-purple-600">Bulk Discounts:</h4>
										<ul className="text-sm space-y-1">
											<li>2+ Bags: 15% OFF</li>
											<li>5+ Bags: 25% OFF</li>
											<li>10+ Bags: 30% OFF</li>
											<li>20+ Bags: 35% OFF</li>
										</ul>
									</div>

									<div className="flex items-center justify-between">
										<span className="text-2xl font-bold">$24.95</span>
										<span className="text-sm text-purple-600">Free Shipping</span>
									</div>

									<button className="w-full py-2 rounded-md font-medium flex items-center justify-center gap-2 bg-purple-600 text-white">
										Shop Now <ExternalLink className="w-4 h-4" />
									</button>
								</div>

								{/* External Link Notice */}
								<div className="text-xs text-center py-2 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
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
