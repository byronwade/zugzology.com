import { Suspense } from "react";
import type { ShopifyProduct } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

interface ProductInfoProps {
	product: ShopifyProduct;
}

/**
 * Server Component for static product information
 * This can be pre-rendered and cached, improving performance
 */
export async function ProductInfo({ product }: ProductInfoProps) {
	return (
		<div className="space-y-6">
			{/* Basic product information - all static */}
			<div>
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
					{product.title}
				</h1>
				<div className="mt-3">
					<p className="text-2xl font-semibold text-gray-900 dark:text-white">
						{formatPrice(parseFloat(product.priceRange.minVariantPrice.amount))}
					</p>
				</div>
			</div>

			{/* Product description */}
			{product.description && (
				<div className="prose prose-sm max-w-none">
					<p className="text-gray-600 dark:text-gray-300">
						{product.description}
					</p>
				</div>
			)}

			{/* Product features/tags */}
			{product.tags && product.tags.length > 0 && (
				<div>
					<h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
						Features
					</h3>
					<div className="flex flex-wrap gap-2">
						{product.tags.slice(0, 6).map((tag) => (
							<span
								key={tag}
								className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
							>
								{tag}
							</span>
						))}
					</div>
				</div>
			)}

			{/* Availability info */}
			<div className="space-y-2">
				<div className="flex items-center">
					<span className="text-sm text-gray-600 dark:text-gray-400">
						Availability:
					</span>
					<span className="ml-2 text-sm font-medium text-green-600 dark:text-green-400">
						{product.availableForSale ? "In Stock" : "Out of Stock"}
					</span>
				</div>
				
				{product.vendor && (
					<div className="flex items-center">
						<span className="text-sm text-gray-600 dark:text-gray-400">
							Brand:
						</span>
						<span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
							{product.vendor}
						</span>
					</div>
				)}
			</div>
		</div>
	);
}

/**
 * Server Component for product specifications
 * Can be loaded separately and cached independently
 */
export async function ProductSpecifications({ product }: ProductInfoProps) {
	// In a real app, this might fetch additional specs from a database
	const specs = [
		{ label: "SKU", value: product.id },
		{ label: "Type", value: product.productType || "General" },
		{ label: "Vendor", value: product.vendor || "Unknown" },
	];

	return (
		<div className="border-t border-gray-200 dark:border-gray-700 pt-6">
			<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
				Specifications
			</h3>
			<dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
				{specs.map((spec) => (
					<div key={spec.label}>
						<dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
							{spec.label}
						</dt>
						<dd className="mt-1 text-sm text-gray-900 dark:text-white">
							{spec.value}
						</dd>
					</div>
				))}
			</dl>
		</div>
	);
}

/**
 * Loading skeleton for product info
 */
export function ProductInfoSkeleton() {
	return (
		<div className="space-y-6 animate-pulse">
			<div>
				<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
				<div className="mt-3 h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
			</div>
			<div className="space-y-2">
				<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
				<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
				<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
			</div>
		</div>
	);
}

/**
 * Wrapper component that demonstrates Next.js 15 Partial Prerendering
 */
export function ProductInfoWithSuspense({ product }: ProductInfoProps) {
	return (
		<>
			{/* Static content that can be pre-rendered */}
			<Suspense fallback={<ProductInfoSkeleton />}>
				<ProductInfo product={product} />
			</Suspense>
			
			{/* Specifications can be loaded separately */}
			<Suspense fallback={<div className="h-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />}>
				<ProductSpecifications product={product} />
			</Suspense>
		</>
	);
}