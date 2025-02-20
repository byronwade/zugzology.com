import { getProducts, getSiteSettings } from "@/lib/actions/shopify";
import { notFound } from "next/navigation";
import { ProductList } from "@/components/products/product-list";
import { ProductsHeaderWrapper } from "@/components/products/products-header-wrapper";
import type { Metadata } from "next";
import React from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { jsonLdScriptProps } from "react-schemaorg";
import type { WithContext, ItemList, BreadcrumbList } from "schema-dts";
import type { ShopifyProduct } from "@/lib/types";

interface ProductsPageProps {
	searchParams?: {
		sort?: string;
		availability?: string;
		price?: string;
		category?: string;
	};
}

export async function generateMetadata(): Promise<Metadata> {
	// Get only essential site settings for metadata
	const siteSettings = await getSiteSettings();
	const storeName = siteSettings?.name || "Zugzology";
	const storeDescription = siteSettings?.description || "";

	const title = `${storeName} - Premium Mushroom Growing Supplies & Equipment`;
	const description = `Shop our extensive collection of premium mushroom growing supplies. Find sterile grow bags, substrates, and professional cultivation equipment.`;

	return {
		title,
		description,
		keywords: ["mushroom growing supplies", "mushroom cultivation equipment", "sterile grow bags", "mushroom substrates", "cultivation tools", "mycology supplies", "professional growing equipment"],
		alternates: {
			canonical: `${siteSettings?.primaryDomain?.url || "https://zugzology.com"}/products`,
		},
		openGraph: {
			title,
			description: storeDescription || description,
			type: "website",
			url: `${siteSettings?.primaryDomain?.url || "https://zugzology.com"}/products`,
		},
		twitter: {
			card: "summary_large_image",
			title,
			description: storeDescription || description,
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

// Products content component
const ProductsContent = async ({ searchParams }: ProductsPageProps) => {
	const nextSearchParams = await searchParams;
	console.log("Fetching products and site settings...");
	const [products, siteSettings] = await Promise.all([getProducts(), getSiteSettings()]);
	console.log("Products fetched:", products?.length || 0, "products");

	if (!products?.length) {
		console.log("No products found");
		return (
			<div className="w-full min-h-[50vh] flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-xl font-semibold mb-2">No products found</h2>
					<p className="text-muted-foreground">Please try adjusting your filters</p>
				</div>
			</div>
		);
	}

	const storeName = siteSettings?.name || "Zugzology";

	// Generate structured data for product list
	const itemListStructuredData: WithContext<ItemList> = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		itemListElement: products.slice(0, 24).map((product, index) => ({
			"@type": "ListItem",
			position: index + 1,
			item: {
				"@type": "Product",
				name: product.title,
				description: product.description,
				image: product.images.nodes[0]?.url,
				url: `${siteSettings?.primaryDomain?.url || "https://zugzology.com"}/products/${product.handle}`,
				brand: {
					"@type": "Brand",
					name: product.vendor || storeName,
				},
				offers: {
					"@type": "AggregateOffer",
					priceCurrency: "USD",
					lowPrice: parseFloat(product.priceRange.minVariantPrice.amount),
					highPrice: parseFloat(product.priceRange.maxVariantPrice.amount),
					offerCount: product.variants.nodes.length,
					availability: product.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
				},
			},
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
				item: siteSettings?.primaryDomain?.url || "https://zugzology.com",
			},
			{
				"@type": "ListItem",
				position: 2,
				name: "Products",
				item: `${siteSettings?.primaryDomain?.url || "https://zugzology.com"}/products`,
			},
		],
	};

	return (
		<>
			<script {...jsonLdScriptProps(itemListStructuredData)} />
			<script {...jsonLdScriptProps(breadcrumbStructuredData)} />
			<ProductsHeaderWrapper title={siteSettings?.name || "All Products"} description={siteSettings?.description || "Browse our complete collection of premium mushroom growing supplies and equipment."} count={products.length} />
			<ProductList products={products} />
		</>
	);
};

// Error fallback component
const ProductsError = () => (
	<div className="w-full min-h-[50vh] flex items-center justify-center">
		<div className="text-center">
			<h2 className="text-xl font-semibold mb-2">Unable to load products</h2>
			<p className="text-muted-foreground">Please try refreshing the page</p>
		</div>
	</div>
);

export default async function ProductsPage({ searchParams = {} }: ProductsPageProps) {
	return (
		<ErrorBoundary fallback={<ProductsError />}>
			<div className="product-catalog w-full">
				<section aria-label="Products Catalog" className="products-section w-full" itemScope itemType="https://schema.org/CollectionPage">
					<ProductsContent searchParams={searchParams} />
				</section>
			</div>
		</ErrorBoundary>
	);
}
