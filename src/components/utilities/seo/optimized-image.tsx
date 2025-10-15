"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";

interface OptimizedImageProps extends Omit<ImageProps, "src"> {
	src: string;
	fallbackSrc?: string;
	loading?: "lazy" | "eager";
	priority?: boolean;
	quality?: number;
	formats?: ("webp" | "avif")[];
	onLoadingComplete?: () => void;
	aspectRatio?: number;
	objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
	fadeIn?: boolean;
	blur?: boolean;
	blurDataURL?: string;
}

/**
 * Optimized image component with WebP/AVIF support and lazy loading
 */
export function OptimizedImage({
	src,
	fallbackSrc = "/placeholder.svg",
	alt,
	width,
	height,
	loading = "lazy",
	priority = false,
	quality = 85,
	formats = ["webp", "avif"],
	onLoadingComplete,
	aspectRatio,
	objectFit = "cover",
	fadeIn = true,
	blur = true,
	blurDataURL,
	className = "",
	...props
}: OptimizedImageProps) {
	const [imageSrc, setImageSrc] = useState(src);
	const [isLoading, setIsLoading] = useState(true);
	const [isInView, setIsInView] = useState(false);
	const imgRef = useRef<HTMLDivElement>(null);

	// Handle image errors
	const handleError = () => {
		if (imageSrc !== fallbackSrc) {
			setImageSrc(fallbackSrc);
		}
	};

	// Handle loading complete
	const handleLoadingComplete = () => {
		setIsLoading(false);
		onLoadingComplete?.();
	};

	// Intersection Observer for lazy loading
	useEffect(() => {
		if (!imgRef.current || loading !== "lazy") {
			setIsInView(true);
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsInView(true);
					observer.disconnect();
				}
			},
			{
				rootMargin: "50px",
				threshold: 0.01,
			}
		);

		observer.observe(imgRef.current);

		return () => observer.disconnect();
	}, [loading]);

	// Generate srcSet for different formats
	const _generateSrcSet = () => {
		if (!formats.length) {
			return;
		}

		const srcSets: string[] = [];

		// Add AVIF format if supported
		if (formats.includes("avif") && isShopifyImage(src)) {
			srcSets.push(`${transformShopifyUrl(src, { format: "avif" })} 1x`);
			srcSets.push(`${transformShopifyUrl(src, { format: "avif", scale: 2 })} 2x`);
		}

		// Add WebP format if supported
		if (formats.includes("webp") && isShopifyImage(src)) {
			srcSets.push(`${transformShopifyUrl(src, { format: "webp" })} 1x`);
			srcSets.push(`${transformShopifyUrl(src, { format: "webp", scale: 2 })} 2x`);
		}

		return srcSets.length ? srcSets.join(", ") : undefined;
	};

	// Check if URL is a Shopify image
	const isShopifyImage = (url: string): boolean => url.includes("cdn.shopify.com") || url.includes("shopifycdn.com");

	// Transform Shopify URL for different formats
	const transformShopifyUrl = (
		url: string,
		options: { format?: string; scale?: number; width?: number; height?: number }
	): string => {
		if (!isShopifyImage(url)) {
			return url;
		}

		let transformedUrl = url;

		// Add format parameter
		if (options.format) {
			const formatParam = `format=${options.format}`;
			transformedUrl = url.includes("?") ? `${url}&${formatParam}` : `${url}?${formatParam}`;
		}

		// Add scale parameter
		if (options.scale) {
			const scaleParam = `scale=${options.scale}`;
			transformedUrl = transformedUrl.includes("?")
				? `${transformedUrl}&${scaleParam}`
				: `${transformedUrl}?${scaleParam}`;
		}

		// Add width parameter
		if (options.width) {
			const widthParam = `width=${options.width}`;
			transformedUrl = transformedUrl.includes("?")
				? `${transformedUrl}&${widthParam}`
				: `${transformedUrl}?${widthParam}`;
		}

		return transformedUrl;
	};

	// Generate blur placeholder
	const generateBlurDataURL = (): string | undefined => {
		if (blurDataURL) {
			return blurDataURL;
		}
		if (!blur) {
			return;
		}

		// Simple SVG blur placeholder
		const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <filter id="blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="20" />
        </filter>
        <rect width="100%" height="100%" fill="#e5e7eb" filter="url(#blur)" />
      </svg>
    `;

		return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
	};

	// Calculate dimensions for responsive images
	const calculateDimensions = () => {
		if (width && height) {
			return { width, height };
		}

		if (width && aspectRatio) {
			return {
				width,
				height: Math.round(Number(width) / aspectRatio),
			};
		}

		if (height && aspectRatio) {
			return {
				width: Math.round(Number(height) * aspectRatio),
				height,
			};
		}

		return { width: width || 500, height: height || 500 };
	};

	const dimensions = calculateDimensions();

	return (
		<div
			className={`relative overflow-hidden ${className}`}
			ref={imgRef}
			style={{
				aspectRatio: aspectRatio ? `${aspectRatio}` : undefined,
			}}
		>
			{isInView && (
				<>
					{/* Modern format images */}
					{formats.includes("avif") && isShopifyImage(imageSrc) && (
						<picture>
							<source srcSet={`${transformShopifyUrl(imageSrc, { format: "avif" })}`} type="image/avif" />
						</picture>
					)}

					{formats.includes("webp") && isShopifyImage(imageSrc) && (
						<picture>
							<source srcSet={`${transformShopifyUrl(imageSrc, { format: "webp" })}`} type="image/webp" />
						</picture>
					)}

					{/* Main image with Next.js Image component */}
					<Image
						alt={alt}
						blurDataURL={generateBlurDataURL()}
						className={`
              ${fadeIn && isLoading ? "opacity-0" : "opacity-100"}transition-opacity duration-300 ease-in-out`}
						height={dimensions.height}
						loading={priority ? "eager" : "lazy"}
						onError={handleError}
						onLoadingComplete={handleLoadingComplete}
						placeholder={blur ? "blur" : "empty"}
						priority={priority}
						quality={quality}
						src={imageSrc}
						style={{
							objectFit,
						}}
						width={dimensions.width}
						{...props}
					/>
				</>
			)}

			{/* Loading skeleton */}
			{!isInView && (
				<div
					className="absolute inset-0 animate-pulse bg-gray-200"
					style={{
						width: dimensions.width,
						height: dimensions.height,
					}}
				/>
			)}
		</div>
	);
}

/**
 * Responsive image with srcset for different screen sizes
 */
export function ResponsiveImage({
	src,
	alt,
	sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
	...props
}: OptimizedImageProps & { sizes?: string }) {
	const _generateResponsiveSrcSet = () => {
		if (!isShopifyImage(src)) {
			return src;
		}

		const widths = [320, 640, 768, 1024, 1280, 1536, 1920];
		const srcSet = widths.map((w) => `${transformShopifyUrl(src, { width: w })} ${w}w`).join(", ");

		return srcSet;
	};

	const isShopifyImage = (url: string): boolean => url.includes("cdn.shopify.com") || url.includes("shopifycdn.com");

	const transformShopifyUrl = (url: string, options: { width: number }): string => {
		if (!isShopifyImage(url)) {
			return url;
		}

		const widthParam = `width=${options.width}`;
		return url.includes("?") ? `${url}&${widthParam}` : `${url}?${widthParam}`;
	};

	return <OptimizedImage alt={alt} sizes={sizes} src={src} {...props} />;
}

/**
 * Hero image with priority loading and largest contentful paint optimization
 */
export function HeroImage(props: OptimizedImageProps) {
	return <OptimizedImage {...props} fadeIn={false} fetchPriority="high" loading="eager" priority quality={90} />;
}

/**
 * Product image with zoom capabilities
 */
export function ProductImage({
	enableZoom = true,
	zoomLevel = 2,
	...props
}: OptimizedImageProps & { enableZoom?: boolean; zoomLevel?: number }) {
	const [isZoomed, setIsZoomed] = useState(false);
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!enableZoom) {
			return;
		}

		const rect = e.currentTarget.getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width) * 100;
		const y = ((e.clientY - rect.top) / rect.height) * 100;

		setMousePosition({ x, y });
	};

	return (
		<div
			className="relative cursor-zoom-in overflow-hidden"
			onMouseEnter={() => enableZoom && setIsZoomed(true)}
			onMouseLeave={() => setIsZoomed(false)}
			onMouseMove={handleMouseMove}
		>
			<OptimizedImage
				{...props}
				className={`
          ${props.className || ""}
          ${isZoomed ? "scale-150" : "scale-100"}transition-transform duration-300`}
				style={{
					transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
				}}
			/>
		</div>
	);
}
