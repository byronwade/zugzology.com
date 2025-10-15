"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Image cache to track prefetched images
const imageCache = new Set<string>();
const seen = new Set<string>();

// Prefetch a single image
async function prefetchImage(url: string): Promise<void> {
	if (!url || imageCache.has(url)) {
		return;
	}

	try {
		const img = new Image();
		img.src = url;
		await new Promise((resolve, reject) => {
			img.onload = resolve;
			img.onerror = reject;
		});
		imageCache.add(url);
	} catch (error) {
		console.warn(`Failed to prefetch image: ${url}`, error);
	}
}

// Prefetch multiple images with priority control
async function prefetchImages(urls: string[], options: { priority?: "high" | "low" } = {}): Promise<void> {
	const { priority = "low" } = options;

	// Filter out already cached images
	const uncachedUrls = urls.filter((url) => url && !imageCache.has(url));

	if (uncachedUrls.length === 0) {
		return;
	}

	// Use low priority fetching to avoid blocking main thread
	if (priority === "low") {
		await Promise.allSettled(uncachedUrls.map((url) => prefetchImage(url)));
	} else {
		// High priority - fetch immediately
		await Promise.all(uncachedUrls.map((url) => prefetchImage(url)));
	}
}

export interface PrefetchLinkProps extends React.ComponentPropsWithoutRef<typeof NextLink> {
	/**
	 * Image URLs to prefetch when link becomes visible or is hovered
	 */
	prefetchImages?: string | string[];

	/**
	 * Disable image prefetching (still prefetches the route)
	 */
	disableImagePrefetch?: boolean;

	/**
	 * Disable viewport-based prefetching
	 */
	disableViewportPrefetch?: boolean;

	/**
	 * Prefetch priority - 'high' for above-the-fold links, 'low' for others
	 */
	prefetchPriority?: "high" | "low";
}

/**
 * Enhanced Link component inspired by NextMaster
 *
 * Features:
 * - Prefetches images when link enters viewport or on hover
 * - Navigates on mousedown instead of click (100ms faster)
 * - Intelligent caching to avoid redundant prefetches
 * - Intersection Observer for viewport-based prefetching
 *
 * Usage:
 * ```tsx
 * <PrefetchLink
 *   href="/products/mushroom-kit"
 *   prefetchImages={[productImage1, productImage2]}
 * >
 *   View Product
 * </PrefetchLink>
 * ```
 */
export const PrefetchLink = forwardRef<HTMLAnchorElement, PrefetchLinkProps>(
	(
		{
			href,
			prefetchImages: imagesToPrefetch,
			disableImagePrefetch = false,
			disableViewportPrefetch = false,
			prefetchPriority = "low",
			onClick,
			onMouseEnter,
			onMouseDown,
			children,
			className,
			...props
		},
		ref
	) => {
		const router = useRouter();
		const linkRef = useRef<HTMLAnchorElement>(null);
		const [hasBeenVisible, setHasBeenVisible] = useState(false);
		const [hasPrefetchedImages, setHasPrefetchedImages] = useState(false);

		// Normalize href to string
		const hrefString = typeof href === "string" ? href : href.pathname || "/";

		// Handle image prefetching
		const handleImagePrefetch = useCallback(async () => {
			if (disableImagePrefetch || hasPrefetchedImages || !imagesToPrefetch) {
				return;
			}

			const urls = Array.isArray(imagesToPrefetch) ? imagesToPrefetch : [imagesToPrefetch];
			const validUrls = urls.filter((url) => url && typeof url === "string");

			if (validUrls.length === 0) {
				return;
			}

			setHasPrefetchedImages(true);
			await prefetchImages(validUrls, { priority: prefetchPriority });
		}, [disableImagePrefetch, hasPrefetchedImages, imagesToPrefetch, prefetchPriority]);

		// Intersection Observer for viewport-based prefetching
		useEffect(() => {
			if (disableViewportPrefetch || hasBeenVisible || typeof window === "undefined") {
				return;
			}

			const currentLinkRef = linkRef.current;
			if (!currentLinkRef) {
				return;
			}

			const observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting && !seen.has(hrefString)) {
							setHasBeenVisible(true);
							seen.add(hrefString);

							// Prefetch images when link enters viewport
							handleImagePrefetch();
						}
					});
				},
				{
					rootMargin: "200px", // Start prefetching 200px before link enters viewport
					threshold: 0.01,
				}
			);

			observer.observe(currentLinkRef);

			return () => {
				if (currentLinkRef) {
					observer.unobserve(currentLinkRef);
				}
			};
		}, [disableViewportPrefetch, hasBeenVisible, hrefString, handleImagePrefetch]);

		// Handle mouse enter - prefetch images on hover
		const handleMouseEnter = useCallback(
			(e: React.MouseEvent<HTMLAnchorElement>) => {
				onMouseEnter?.(e);

				// Prefetch images on hover for even faster loading
				if (!hasPrefetchedImages) {
					handleImagePrefetch();
				}
			},
			[onMouseEnter, hasPrefetchedImages, handleImagePrefetch]
		);

		// Handle mouse down - navigate on mousedown instead of click (100ms faster)
		const handleMouseDown = useCallback(
			(e: React.MouseEvent<HTMLAnchorElement>) => {
				onMouseDown?.(e);

				// Only handle left clicks (button 0)
				if (e.button !== 0) {
					return;
				}

				// Don't intercept modified clicks
				if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
					return;
				}

				// Check if this is an internal link
				const url = new URL(hrefString, window.location.href);
				const isSameOrigin = url.origin === window.location.origin;

				if (!isSameOrigin) {
					return;
				}

				// Prevent default and navigate immediately
				e.preventDefault();
				router.push(hrefString);
			},
			[onMouseDown, hrefString, router]
		);

		// Handle click - prevent default if already handled by mousedown
		const handleClick = useCallback(
			(e: React.MouseEvent<HTMLAnchorElement>) => {
				onClick?.(e);

				// The mousedown handler already navigated, so prevent default click behavior
				// This is necessary to avoid double navigation
				if (!e.defaultPrevented && e.button === 0) {
					// Check if this is an internal link
					const url = new URL(hrefString, window.location.href);
					const isSameOrigin = url.origin === window.location.origin;

					if (isSameOrigin && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
						e.preventDefault();
					}
				}
			},
			[onClick, hrefString]
		);

		// Merge refs
		useEffect(() => {
			if (ref && linkRef.current) {
				if (typeof ref === "function") {
					ref(linkRef.current);
				} else {
					ref.current = linkRef.current;
				}
			}
		}, [ref]);

		return (
			<NextLink
				ref={linkRef}
				href={href}
				onClick={handleClick}
				onMouseEnter={handleMouseEnter}
				onMouseDown={handleMouseDown}
				className={cn("transition-colors hover:text-primary", className)}
				{...props}
			>
				{children}
			</NextLink>
		);
	}
);

PrefetchLink.displayName = "PrefetchLink";

// Re-export as default for convenience
export default PrefetchLink;
