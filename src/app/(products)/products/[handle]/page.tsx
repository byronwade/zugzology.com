import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { ProductServerWrapper } from "@/components/features/products/product-server-wrapper";
import { SEOProductWrapper } from "@/components/features/products/seo-product-wrapper";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { getShopifyUnavailableFallback, ShopifyUnavailable } from "@/components/ui/shopify-unavailable";
import { getProductPageData } from "@/lib/api/shopify/actions";
import { FAQ_TEMPLATES } from "@/lib/config/wadesdesign.config";
import {
	getEnhancedBreadcrumbSchema,
	getEnhancedFAQSchema,
	getEnhancedOrganizationSchema,
	getEnhancedProductSchema,
} from "@/lib/seo/enhanced-jsonld";
import { generateBreadcrumbItems, generateEnhancedProductMetadata } from "@/lib/seo/seo-utils";

// Dynamic rendering handled by dynamicIO experimental feature

// Define the props for the page
export type ProductPageProps = {
	params: { handle: string };
};

// Generate metadata for the product
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
	try {
		// In Next.js 15, we need to await params
		const { handle } = await params;
		const { product } = await getProductPageData(handle);

		if (!product) {
			return {
				title: "Product Not Found | Zugzology",
				description:
					"The requested product could not be found. Browse our collection of premium mushroom cultivation supplies.",
				robots: { index: false, follow: true },
			};
		}

		// Use comprehensive SEO metadata generator
		return generateEnhancedProductMetadata(product);
	} catch (_error) {
		return {
			title: "Premium Mushroom Supplies | Zugzology",
			description:
				"Explore our collection of premium mushroom cultivation supplies. Expert support, free shipping on orders over $75.",
			robots: { index: true, follow: true },
		};
	}
}

function ProductError(): React.ReactElement {
	return (
		<ShopifyUnavailable
			description="Unable to load product information right now. You can keep browsing other pages while we reconnect."
			title="Something went wrong"
		/>
	);
}

export default async function ProductPage({ params }: ProductPageProps) {
	try {
		const { handle } = await params;

		const { product, relatedProducts } = await getProductPageData(handle);

		if (!product) {
			return (
				(await getShopifyUnavailableFallback({
					description:
						"We can't load product details because Shopify is unreachable right now. You can keep browsing the site and try again shortly.",
					title: "Product unavailable right now",
				})) ?? notFound()
			);
		}

		// Generate breadcrumb items
		const breadcrumbs = generateBreadcrumbItems(`/products/${handle}`, product.title);

		// Generate product FAQs
		const productFAQs = FAQ_TEMPLATES.product.map((faq) => ({
			...faq,
			question: faq.question.replace("{product}", product.title),
		}));

		// Check for product videos in media
		const productVideos =
			product.media?.nodes?.filter(
				(media: any) => media.mediaContentType === "VIDEO" || media.mediaContentType === "EXTERNAL_VIDEO"
			) || [];

		// Generate structured data
		const structuredData = {
			organization: getEnhancedOrganizationSchema(),
			product: getEnhancedProductSchema(product),
			breadcrumb: getEnhancedBreadcrumbSchema(breadcrumbs),
			faq: getEnhancedFAQSchema(productFAQs),
			// Add video schema if product has videos
			...(productVideos.length > 0 && {
				video: productVideos.map((video: any) => ({
					"@type": "VideoObject",
					name: `${product.title} - Product Video`,
					description: product.description || `Watch ${product.title} in action`,
					thumbnailUrl: video.previewImage?.url || product.images?.nodes?.[0]?.url,
					uploadDate: product.publishedAt,
					contentUrl: video.sources?.[0]?.url,
					embedUrl: video.embedUrl,
					duration: "PT2M", // Placeholder - update if you have actual duration
				})),
			}),
		};

		return (
			<ErrorBoundary fallback={<ProductError />}>
				{/* JSON-LD Structured Data */}
				<script
					// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data is safe with JSON.stringify
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@graph": Object.values(structuredData).filter(Boolean),
						}),
					}}
					type="application/ld+json"
				/>

				{/* Google Analytics Enhanced Ecommerce */}
				<Script id="product-analytics" strategy="afterInteractive">
					{`
							window.dataLayer = window.dataLayer || [];
							window.dataLayer.push({
								'event': 'view_item',
								'ecommerce': {
									'items': [{
										'item_id': '${product.id}',
										'item_name': '${product.title.replace(/'/g, "\\'")}',
										'price': ${product.priceRange?.minVariantPrice?.amount || 0},
										'currency': '${product.priceRange?.minVariantPrice?.currencyCode || "USD"}',
										'item_category': '${product.productType || ""}',
										'item_brand': '${product.vendor || "Zugzology"}',
										'quantity': 1
									}]
								}
							});
						`}
				</Script>

				<SEOProductWrapper product={product}>
					<ProductServerWrapper product={product} relatedProducts={relatedProducts} />
				</SEOProductWrapper>
			</ErrorBoundary>
		);
	} catch (_error) {
		return <ProductError />;
	}
}
