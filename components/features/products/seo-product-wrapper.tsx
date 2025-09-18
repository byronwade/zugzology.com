"use client";

import { Fragment } from "react";
import { ShopifyProduct } from "@/lib/types";
import { SEO } from "@/components/seo/seo";
import { ProductFAQs, getProductFAQsForSchema } from "@/components/faq/product-faqs";
import { TrustIndicators } from "@/components/trust/trust-indicators";

interface SEOProductWrapperProps {
	product: ShopifyProduct;
	children: React.ReactNode;
}

export function SEOProductWrapper({ product, children }: SEOProductWrapperProps) {
	if (!product) return <>{children}</>;

	// Generate breadcrumbs for the product
	const breadcrumbs = [
		{ name: "Home", url: "https://zugzology.com" },
		{ name: "Products", url: "https://zugzology.com/products" },
	];

	// Add category to breadcrumbs if available
	if (product.productType) {
		breadcrumbs.push({
			name: product.productType,
			url: `https://zugzology.com/search?q=${encodeURIComponent(product.productType)}`,
		});
	}

	// Add the current product to breadcrumbs
	breadcrumbs.push({
		name: product.title,
		url: `https://zugzology.com/products/${product.handle}`,
	});

	// Get FAQs based on product type for schema
	const faqs = getProductFAQsForSchema(product);

	// Get review data if available from product.metafields
	const reviewCount = product.metafields?.find((m) => m?.key === "review_count")?.value || "0";
	const ratingValue = product.metafields?.find((m) => m?.key === "rating")?.value || "0";
	const hasReviews = parseInt(reviewCount || "0") > 0 && parseFloat(ratingValue || "0") > 0;

	return (
		<Fragment>
			{/* Enhanced SEO with structured data */}
			<SEO type="product" data={product} breadcrumbs={breadcrumbs} faq={faqs} />

			{/* Original product content */}
			{children}

			{/* Trust indicators to boost confidence */}
			<div className="my-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<TrustIndicators
					variant="full"
					showQuickDelivery={product.availableForSale}
					showSustainable={product.tags?.some(
						(tag) =>
							typeof tag === "string" &&
							(tag.toLowerCase().includes("eco") || tag.toLowerCase().includes("sustainable"))
					)}
					showPopular={hasReviews && parseFloat(ratingValue || "0") >= 4.5}
				/>
			</div>

			{/* FAQs section */}
			<div className="my-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<ProductFAQs product={product} />
			</div>
		</Fragment>
	);
}
