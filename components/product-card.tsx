"use client";

import Image from "next/image";
import { ValidatedLink } from "@/components/ui/validated-link";
import { PrefetchLink } from "@/components/ui/prefetch-link";
import { useProductPrefetch } from "@/hooks/use-enhanced-prefetch";
import { useRef } from "react";
import { advancedBehaviorTracker } from '@/lib/services/advanced-behavior-tracker';
import type { AIFilteredProduct } from '@/hooks/use-realtime-ai-filtering';

interface ProductCardProps {
	id: string;
	name: string;
	description?: string;
	price: number;
	image: string;
	isFeatured?: boolean;
}

interface OptimizedProduct {
	id: string;
	title: string;
	handle: string;
	description: string;
	price: string;
	compareAtPrice: string | null;
	isOnSale: boolean;
	featuredImage?: {
		url: string;
		altText?: string;
		blurDataURL?: string;
	};
	tags?: string[];
}

function formatProductPrice(price: string): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
	}).format(parseFloat(price));
}

export function ProductCard({ id, name, description, price, image, isFeatured }: ProductCardProps) {
	return (
		<ValidatedLink 
			href={`/products/${id}`} 
			className="group block"
			data-product-id={id}
			data-product-price={price}
			data-product-name={name}
		>
			<div className="relative overflow-hidden rounded-lg mb-3 bg-gray-100">
				<Image
					src={image}
					alt={name}
					width={500}
					height={500}
					className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
					sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
					loading="lazy"
				/>
				{isFeatured && (
					<div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
						Featured
					</div>
				)}
			</div>
			<h3 className="text-lg font-medium text-gray-900 group-hover:text-primary transition-colors">{name}</h3>
			{description && <p className="mt-1 text-sm text-gray-600 line-clamp-2">{description}</p>}
			<div className="mt-2 font-semibold text-gray-900">${price.toFixed(2)}</div>
		</ValidatedLink>
	);
}

export function ShopifyProductCard({ product }: { product: OptimizedProduct }) {
	const isFeatured = product.tags?.includes("featured") || product.tags?.includes("best-seller");
	const { createProductHoverHandlers } = useProductPrefetch();
	const hoverStartTime = useRef<number>(0);

	// Create hover handlers for enhanced prefetching
	const hoverHandlers = createProductHoverHandlers(product.handle, {
		images: product.featuredImage ? [{ url: product.featuredImage.url }] : [],
		title: product.title,
		price: product.price,
		description: product.description
	});

	// Track real user interactions
	const handleMouseEnter = () => {
		hoverStartTime.current = Date.now();
		hoverHandlers.onMouseEnter?.();
	};

	const handleMouseLeave = () => {
		if (hoverStartTime.current > 0) {
			const hoverDuration = Date.now() - hoverStartTime.current;
			if (hoverDuration > 200) { // Only track meaningful hovers
				advancedBehaviorTracker.trackHover(product.id, hoverDuration);
			}
			hoverStartTime.current = 0;
		}
		hoverHandlers.onMouseLeave?.();
	};

	const handleClick = () => {
		// Track product view
		advancedBehaviorTracker.trackProductView(product.id, {
			category: product.tags?.[0] || 'Unknown',
			price: product.price,
			title: product.title,
			isOnSale: product.isOnSale,
			isFeatured
		});
	};

	return (
		<ValidatedLink 
			href={`/products/${product.handle}`} 
			className="group block"
			data-product-id={product.id}
			data-product-handle={product.handle}
			data-product-price={product.price}
			data-product-name={product.title}
			data-product-sale={product.isOnSale ? "true" : "false"}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onClick={handleClick}
		>
			<div className="relative overflow-hidden rounded-lg mb-3 bg-gray-100">
				<Image
					src={product.featuredImage?.url || "/placeholder-product.png"}
					alt={product.featuredImage?.altText || product.title}
					width={500}
					height={500}
					className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
					sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
					loading="lazy"
					blurDataURL={product.featuredImage?.blurDataURL}
					placeholder={product.featuredImage?.blurDataURL ? "blur" : "empty"}
				/>
				{product.isOnSale && (
					<div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">Sale</div>
				)}
				{isFeatured && !product.isOnSale && (
					<div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
						Featured
					</div>
				)}
			</div>
			<h3 className="text-lg font-medium text-gray-900 group-hover:text-primary transition-colors">{product.title}</h3>
			<div className="mt-1 flex items-center">
				<span className={`text-gray-900 ${product.isOnSale ? "font-bold text-red-600" : ""}`}>
					{formatProductPrice(product.price)}
				</span>
				{product.isOnSale && product.compareAtPrice && (
					<span className="ml-2 text-sm text-gray-500 line-through">{formatProductPrice(product.compareAtPrice)}</span>
				)}
			</div>
		</ValidatedLink>
	);
}

/**
 * Enhanced Product Card with advanced prefetching
 * Use this for high-performance product listings
 */
export function EnhancedProductCard({ product }: { product: OptimizedProduct }) {
	const isFeatured = product.tags?.includes("featured") || product.tags?.includes("best-seller");
	const hoverStartTime = useRef<number>(0);

	// No image prefetching - removed

	// Track real user interactions
	const handleMouseEnter = () => {
		hoverStartTime.current = Date.now();
	};

	const handleMouseLeave = () => {
		if (hoverStartTime.current > 0) {
			const hoverDuration = Date.now() - hoverStartTime.current;
			if (hoverDuration > 200) { // Only track meaningful hovers
				advancedBehaviorTracker.trackHover(product.id, hoverDuration);
			}
			hoverStartTime.current = 0;
		}
	};

	const handleClick = () => {
		// Track product view
		advancedBehaviorTracker.trackProductView(product.id, {
			category: product.tags?.[0] || 'Unknown',
			price: product.price,
			title: product.title,
			isOnSale: product.isOnSale,
			isFeatured
		});
	};

	return (
		<PrefetchLink 
			href={`/products/${product.handle}`}
			className="group block"
			data-product-id={product.id}
			data-product-handle={product.handle}
			data-product-price={product.price}
			data-product-name={product.title}
			data-product-sale={product.isOnSale ? "true" : "false"}
			data-product-featured={isFeatured ? "true" : "false"}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onClick={handleClick}
		>
			<div className="relative overflow-hidden rounded-lg mb-3 bg-gray-100">
				<Image
					src={product.featuredImage?.url || "/placeholder-product.png"}
					alt={product.featuredImage?.altText || product.title}
					width={500}
					height={500}
					className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
					sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
					loading="lazy"
					blurDataURL={product.featuredImage?.blurDataURL}
					placeholder={product.featuredImage?.blurDataURL ? "blur" : "empty"}
					fetchPriority={isFeatured ? "high" : "low"}
				/>
				{product.isOnSale && (
					<div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">Sale</div>
				)}
				{isFeatured && !product.isOnSale && (
					<div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
						Featured
					</div>
				)}
			</div>
			<h3 className="text-lg font-medium text-gray-900 group-hover:text-primary transition-colors">{product.title}</h3>
			<div className="mt-1 flex items-center">
				<span className={`text-gray-900 ${product.isOnSale ? "font-bold text-red-600" : ""}`}>
					{formatProductPrice(product.price)}
				</span>
				{product.isOnSale && product.compareAtPrice && (
					<span className="ml-2 text-sm text-gray-500 line-through">{formatProductPrice(product.compareAtPrice)}</span>
				)}
			</div>
		</PrefetchLink>
	);
}

/**
 * AI-Enhanced Product Card that maintains the original design
 * while showing AI-powered insights in development mode
 */
export function AIEnhancedProductCard({ 
	aiProduct 
}: { 
	aiProduct: AIFilteredProduct 
}) {
	const { product } = aiProduct;
	const isFeatured = product.tags?.includes("featured") || product.tags?.includes("best-seller");
	const hoverStartTime = useRef<number>(0);
	const isDev = process.env.NODE_ENV === 'development';

	const handleMouseEnter = () => {
		hoverStartTime.current = Date.now();
	};

	const handleMouseLeave = () => {
		if (hoverStartTime.current > 0) {
			const hoverDuration = Date.now() - hoverStartTime.current;
			if (hoverDuration > 200) {
				advancedBehaviorTracker.trackHover(product.id, hoverDuration);
			}
			hoverStartTime.current = 0;
		}
	};

	const handleClick = () => {
		advancedBehaviorTracker.trackProductView(product.id, {
			category: product.tags?.[0] || 'Unknown',
			price: product.priceRange?.minVariantPrice?.amount || '0',
			title: product.title,
			isOnSale: product.tags?.includes('sale') || false,
			isFeatured
		});
	};

	return (
		<ValidatedLink 
			href={`/products/${product.handle}`} 
			className="group block"
			data-product-id={product.id}
			data-product-handle={product.handle}
			data-product-price={product.priceRange?.minVariantPrice?.amount}
			data-product-name={product.title}
			data-ai-score={aiProduct.aiScore}
			data-ai-confidence={aiProduct.aiConfidence}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onClick={handleClick}
		>
			<div className="relative overflow-hidden rounded-lg mb-3 bg-gray-100">
				<Image
					src={product.featuredImage?.url || "/placeholder-product.png"}
					alt={product.featuredImage?.altText || product.title}
					width={500}
					height={500}
					className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
					sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
					loading="lazy"
				/>
				{/* Existing badges unchanged */}
				{product.tags?.includes('sale') && (
					<div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">Sale</div>
				)}
				{isFeatured && !product.tags?.includes('sale') && (
					<div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
						Featured
					</div>
				)}
				{/* AI insights badge - only shown in development */}
				{isDev && aiProduct.aiScore > 70 && (
					<div className="absolute bottom-2 left-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded opacity-75">
						AI: {aiProduct.aiScore}
					</div>
				)}
				{/* Trend indicator - only in development */}
				{isDev && aiProduct.trend !== 'stable' && (
					<div className={`absolute bottom-2 right-2 text-xs font-bold px-1 py-0.5 rounded ${
						aiProduct.trend === 'rising' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
					}`}>
						{aiProduct.trend === 'rising' ? '↗️' : '↘️'}
					</div>
				)}
			</div>
			
			{/* Original content layout unchanged */}
			<h3 className="text-lg font-medium text-gray-900 group-hover:text-primary transition-colors">
				{product.title}
			</h3>
			
			{/* AI confidence and reasons - only in development */}
			{isDev && aiProduct.aiConfidence !== 'low' && (
				<div className="mt-1 text-xs text-purple-600">
					{aiProduct.aiConfidence} confidence • Rank #{aiProduct.rank}
				</div>
			)}
			
			<div className="mt-1 flex items-center">
				<span className={`text-gray-900 ${product.tags?.includes('sale') ? "font-bold text-red-600" : ""}`}>
					{formatProductPrice(product.priceRange?.minVariantPrice?.amount || '0')}
				</span>
				{product.compareAtPriceRange?.minVariantPrice?.amount && 
				 parseFloat(product.compareAtPriceRange.minVariantPrice.amount) > parseFloat(product.priceRange?.minVariantPrice?.amount || '0') && (
					<span className="ml-2 text-sm text-gray-500 line-through">
						{formatProductPrice(product.compareAtPriceRange.minVariantPrice.amount)}
					</span>
				)}
			</div>
			
			{/* AI reasons tooltip - only in development */}
			{isDev && aiProduct.aiReasons.length > 0 && (
				<div className="mt-1 text-xs text-gray-500 truncate" title={aiProduct.aiReasons.join(', ')}>
					{aiProduct.aiReasons[0]}
				</div>
			)}
		</ValidatedLink>
	);
}
