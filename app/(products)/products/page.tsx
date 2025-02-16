import { getProducts, getSiteSettings } from "@/lib/actions/shopify";
import { notFound } from "next/navigation";
import { ProductsContentClient } from "@/components/products/products-content-client";
import type { Metadata } from "next";
import React from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { jsonLdScriptProps } from "react-schemaorg";
import type { WithContext, ItemList, BreadcrumbList, Product, Thing } from "schema-dts";
import type { ShopifyProduct } from "@/lib/types";
import type { SiteSettings } from "@/lib/actions/shopify";

interface ProductsPageProps {
	searchParams?: {
		sort?: string;
		availability?: string;
		price?: string;
		category?: string;
	};
}

export async function generateMetadata(): Promise<Metadata> {
	// Get total product count and site settings for dynamic metadata
	const [products, siteSettings] = await Promise.all([getProducts(), getSiteSettings()]);
	const productCount = products?.length || 0;
	const storeName = siteSettings?.name || "Zugzology";
	const storeDescription = siteSettings?.description || "";

	const title = `${storeName} - Premium Mushroom Growing Supplies & Equipment`;
	const description = `Shop our extensive collection of premium mushroom growing supplies. Find sterile grow bags, substrates, and professional cultivation equipment. Browse ${productCount}+ quality products for successful mushroom cultivation.`;

	return {
		title,
		description,
		keywords: siteSettings?.keywords || ["mushroom growing supplies", "mushroom cultivation equipment", "sterile grow bags", "mushroom substrates", "cultivation tools", "mycology supplies", "professional growing equipment"],
		alternates: {
			canonical: `${siteSettings?.url || "https://zugzology.com"}/products`,
		},
		openGraph: {
			title,
			description: storeDescription || description,
			type: "website",
			url: `${siteSettings?.url || "https://zugzology.com"}/products`,
			images:
				siteSettings?.images?.map((image: SiteSettings["images"][0]) => ({
					url: image.url,
					width: image.width,
					height: image.height,
					alt: image.altText || title,
				})) || [],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description: storeDescription || description,
			images: siteSettings?.images?.map((image: SiteSettings["images"][0]) => image.url) || [],
		},
		robots: {
			index: true,
			follow: true,
			nocache: false,
			googleBot: {
				index: true,
				follow: true,
				"max-video-preview": -1,
				"max-image-preview": "large",
				"max-snippet": -1,
			},
		},
	};
}

// Error fallback component
const ProductsError = () => (
	<div className="w-full min-h-[50vh] flex items-center justify-center">
		<div className="text-center">
			<h2 className="text-xl font-semibold mb-2">Unable to load products</h2>
			<p className="text-muted-foreground">Please try refreshing the page</p>
		</div>
	</div>
);

// Optimize product data structure and add SEO-friendly attributes
const optimizeProductData = (products: any[]): ShopifyProduct[] => {
	return products.map((product) => ({
		id: product.id,
		title: product.title,
		handle: product.handle,
		description: product.description,
		descriptionHtml: product.descriptionHtml || product.description,
		isGiftCard: product.isGiftCard || false,
		availableForSale: product.availableForSale,
		productType: product.productType || "",
		vendor: product.vendor || "",
		tags: product.tags || [],
		options: product.options || [],
		publishedAt: product.publishedAt || new Date().toISOString(),
		priceRange: product.priceRange,
		images: {
			edges: product.images.edges.slice(0, 1), // Only keep first image for initial render
		},
		variants: {
			edges: [product.variants.edges[0]], // Only keep first variant for initial render
		},
	}));
};

// Products content component
const ProductsContent = async ({ searchParams }: ProductsPageProps) => {
	const nextSearchParams = await searchParams;
	const [products, siteSettings] = await Promise.all([getProducts(), getSiteSettings()]);

	if (!products) {
		return notFound();
	}

	const optimizedProducts = optimizeProductData(products);
	const storeName = siteSettings?.name || "Zugzology";

	// Generate structured data for product list
	const itemListStructuredData: WithContext<ItemList> = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		itemListElement: optimizedProducts.map((product, index) => ({
			"@type": "ListItem",
			position: index + 1,
			item: {
				"@type": "Product",
				name: product.title,
				description: product.description,
				image: product.images.edges[0]?.node.url,
				url: `${siteSettings?.url || "https://zugzology.com"}/products/${product.handle}`,
				brand: {
					"@type": "Brand",
					name: product.vendor || storeName,
				},
				offers: {
					"@type": "AggregateOffer",
					priceCurrency: "USD",
					lowPrice: parseFloat(product.priceRange.minVariantPrice.amount),
					highPrice: parseFloat(product.priceRange.maxVariantPrice.amount),
					offerCount: product.variants.edges.length,
					availability: product.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
				},
			} as Thing,
		})),
	};

	// Generate breadcrumb structured data
	const breadcrumbStructuredData: WithContext<BreadcrumbList> = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{
				"@type": "ListItem",
				position: 1,
				name: "Home",
				item: siteSettings?.url || "https://zugzology.com",
			},
			{
				"@type": "ListItem",
				position: 2,
				name: "Products",
				item: `${siteSettings?.url || "https://zugzology.com"}/products`,
			},
		],
	};

	const virtualCollection = {
		id: "all-products",
		handle: "all-products",
		title: siteSettings?.productsPageTitle || "All Products",
		description: siteSettings?.productsPageDescription || "Browse our complete collection of premium mushroom growing supplies and equipment.",
		products: {
			edges: optimizedProducts.map((product) => ({
				node: product,
			})),
		},
	};

	return (
		<>
			<script {...jsonLdScriptProps(itemListStructuredData)} />
			<script {...jsonLdScriptProps(breadcrumbStructuredData)} />
			<ProductsContentClient collection={virtualCollection} searchQuery={nextSearchParams?.sort || nextSearchParams?.availability || nextSearchParams?.price || nextSearchParams?.category || ""} />
		</>
	);
};

export default async function ProductsPage({ searchParams = {} }: ProductsPageProps) {
	const nextSearchParams = await searchParams;
	const siteSettings = await getSiteSettings();
	const storeName = siteSettings?.name || "Zugzology";

	return (
		<ErrorBoundary fallback={<ProductsError />}>
			<div className="product-catalog">
				<section aria-label="Products Catalog" className="products-section" itemScope itemType="https://schema.org/CollectionPage">
					<ProductsContent searchParams={nextSearchParams} />
				</section>

				<div className="max-w-screen-xl mx-auto px-4 py-8 prose dark:prose-invert">
					{siteSettings?.productsPageSections?.map((section: SiteSettings["productsPageSections"][0], index: number) => (
						<React.Fragment key={index}>
							<h2>{section.title}</h2>
							<p>{section.content}</p>
						</React.Fragment>
					)) || (
						<>
							<h2>Professional Mushroom Growing Supplies</h2>
							<p>At {storeName}, we offer a comprehensive selection of premium mushroom cultivation supplies and equipment. Our products are carefully selected to ensure the highest quality and success in your mushroom growing endeavors.</p>
							<h3>Quality Guaranteed</h3>
							<p>Every product in our catalog is thoroughly tested and verified to meet professional standards. From beginners to experienced cultivators, we provide the tools and supplies needed for successful mushroom cultivation.</p>
							<h3>Expert Support</h3>
							<p>Need help choosing the right supplies? Our expert team is here to assist you. Contact us for personalized recommendations and technical support for your cultivation projects.</p>
						</>
					)}
				</div>
			</div>
		</ErrorBoundary>
	);
}
