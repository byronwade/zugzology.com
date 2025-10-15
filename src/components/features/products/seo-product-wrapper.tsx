"use client";

import { getProductFAQsForSchema, ProductFAQs } from "@/components/utilities/product-faqs";
import { SEO } from "@/components/utilities/seo/seo";
import { TrustIndicators } from "@/components/utilities/trust-indicators";
import type { ShopifyProduct } from "@/lib/types";

type SEOProductWrapperProps = {
	product: ShopifyProduct;
	children: React.ReactNode;
};

export function SEOProductWrapper({ product, children }: SEOProductWrapperProps) {
	if (!product) {
		return <>{children}</>;
	}

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
	const hasReviews = Number.parseInt(reviewCount || "0", 10) > 0 && Number.parseFloat(ratingValue || "0") > 0;

	return (
		<>
			{/* Enhanced SEO with structured data */}
			<SEO breadcrumbs={breadcrumbs} data={product} faq={faqs} type="product" />

			{/* Original product content */}
			{children}

			{/* Trust indicators to boost confidence */}
			<div className="container mx-auto my-8 px-4">
				<TrustIndicators
					showPopular={hasReviews && Number.parseFloat(ratingValue || "0") >= 4.5}
					showQuickDelivery={product.availableForSale}
					showSustainable={product.tags?.some(
						(tag) =>
							typeof tag === "string" &&
							(tag.toLowerCase().includes("eco") || tag.toLowerCase().includes("sustainable"))
					)}
					variant="full"
				/>
			</div>

			{/* FAQs section */}
			<div className="container mx-auto my-8 px-4">
				<ProductFAQs product={product} />
			</div>
		</>
	);
}
