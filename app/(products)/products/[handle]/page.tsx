import { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { getProductPageData } from "@/lib/api/shopify/actions";
import { ProductServerWrapper } from "@/components/features/products/product-server-wrapper";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { getEnhancedProductMetadata } from "@/lib/seo/standardized-jsonld";
import { SEOProductWrapper } from "@/components/features/products/seo-product-wrapper";
import { generateEnhancedProductMetadata, generateBreadcrumbItems } from "@/lib/seo/seo-utils";
import { 
  getEnhancedProductSchema, 
  getEnhancedBreadcrumbSchema,
  getEnhancedFAQSchema,
  getEnhancedOrganizationSchema 
} from "@/lib/seo/enhanced-jsonld";

// Dynamic rendering handled by dynamicIO experimental feature

// Define the props for the page
export interface ProductPageProps {
	params: { handle: string };
}

// Generate metadata for the product
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
	try {
		// In Next.js 15, we need to await params
		const { handle } = await params;
		const { product } = await getProductPageData(handle);

		if (!product) {
			return {
				title: "Product Not Found | Zugzology",
				description: "The requested product could not be found. Browse our collection of premium mushroom cultivation supplies.",
				robots: { index: false, follow: true },
			};
		}

		// Use comprehensive SEO metadata generator
		return generateEnhancedProductMetadata(product);
	} catch (error) {
		console.error("Error generating metadata:", error);
		return {
			title: "Premium Mushroom Supplies | Zugzology",
			description: "Explore our collection of premium mushroom cultivation supplies. Expert support, free shipping on orders over $75.",
			robots: { index: true, follow: true },
		};
	}
}

// Error fallback component
function ProductError() {
	return (
		<div className="w-full min-h-[50vh] flex items-center justify-center">
			<div className="text-center">
				<h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
				<p className="text-muted-foreground">Unable to load product information</p>
				<a href="/" className="mt-4 inline-block text-primary hover:underline">
					Return to Home
				</a>
			</div>
		</div>
	);
}

export default async function ProductPage({ params }: ProductPageProps) {
	try {
		const { handle } = await params;
		console.log(`[ProductPage] Loading product with handle: ${handle}`);
		
		const { product, relatedProducts } = await getProductPageData(handle);
		console.log(`[ProductPage] Product found: ${product ? 'Yes' : 'No'}`, product ? { id: product.id, title: product.title } : null);

		if (!product) {
			console.log(`[ProductPage] Product not found for handle: ${handle}, calling notFound()`);
			notFound();
		}

		// Generate breadcrumb items
		const breadcrumbs = generateBreadcrumbItems(`/products/${handle}`, product.title);
		
		// Generate product FAQs
		const productFAQs = [
			{
				question: `What is included with the ${product.title}?`,
				answer: product.description || `The ${product.title} includes everything you need for successful mushroom cultivation. Check the product details for specific contents.`,
			},
			{
				question: "How long does shipping take?",
				answer: "Orders typically ship within 1-2 business days. Standard shipping takes 3-5 business days. We offer free shipping on orders over $75.",
			},
			{
				question: "What is your return policy?",
				answer: "We offer a 30-day satisfaction guarantee. If you're not completely satisfied with your purchase, contact us for a full refund or replacement.",
			},
			{
				question: "Is this product suitable for beginners?",
				answer: "Yes! All our products come with detailed instructions and we provide free expert support to help ensure your success.",
			},
		];

		// Generate structured data
		const structuredData = {
			organization: getEnhancedOrganizationSchema(),
			product: getEnhancedProductSchema(product),
			breadcrumb: getEnhancedBreadcrumbSchema(breadcrumbs),
			faq: getEnhancedFAQSchema(productFAQs),
		};

		return (
			<ErrorBoundary fallback={<ProductError />}>
				<>
					{/* JSON-LD Structured Data */}
					<script
						type="application/ld+json"
						dangerouslySetInnerHTML={{
							__html: JSON.stringify({
								"@context": "https://schema.org",
								"@graph": Object.values(structuredData).filter(Boolean),
							}),
						}}
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
										'currency': '${product.priceRange?.minVariantPrice?.currencyCode || 'USD'}',
										'item_category': '${product.productType || ''}',
										'item_brand': '${product.vendor || 'Zugzology'}',
										'quantity': 1
									}]
								}
							});
						`}
					</Script>

					{/* Dynamic OG Image */}
					<link
						rel="preload"
						as="image"
						href={`/api/og?title=${encodeURIComponent(product.title)}&description=${encodeURIComponent(
							product.description?.substring(0, 100) || ''
						)}&price=${encodeURIComponent(
							`$${product.priceRange?.minVariantPrice?.amount || '0'}`
						)}&image=${encodeURIComponent(
							product.images?.nodes?.[0]?.url || ''
						)}&type=product`}
					/>

					<SEOProductWrapper product={product}>
						<ProductServerWrapper product={product} relatedProducts={relatedProducts} />
					</SEOProductWrapper>
				</>
			</ErrorBoundary>
		);
	} catch (error) {
		console.error("Error loading product page:", error);
		return <ProductError />;
	}
}
