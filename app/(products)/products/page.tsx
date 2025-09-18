import { Suspense } from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { RealtimeProductsContent } from "@/components/features/products/realtime-products-content";
import { getAllProducts } from "@/lib/api/shopify/actions";
import { ShopifyCollectionWithPagination } from "@/lib/api/shopify/types";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/seo-utils";
import { 
	getEnhancedBreadcrumbSchema, 
	getSearchActionSchema, 
	getEnhancedOrganizationSchema,
	getOfferCatalogSchema 
} from "@/lib/seo/enhanced-jsonld";

export async function generateMetadata(): Promise<Metadata> {
	const title = "All Products - Premium Mushroom Cultivation Supplies | Zugzology";
	const description = "Discover our complete collection of premium mushroom growing supplies. ✓ 500+ Products ✓ Expert Support ✓ Free Shipping Over $75 ✓ 30-Day Returns. Shop growing kits, substrates, equipment & more.";
	
	const keywords = [
		"mushroom growing supplies",
		"mushroom cultivation equipment", 
		"mushroom growing kits",
		"mushroom substrate",
		"mushroom spawn",
		"mycology supplies",
		"mushroom farming equipment",
		"grow mushrooms at home",
		"commercial mushroom growing",
		"sterilized substrate",
		"liquid culture",
		"mushroom cultivation tools",
		"oyster mushroom supplies",
		"shiitake growing supplies",
		"all products",
		"complete collection"
	];
	
	return generateSEOMetadata({
		title,
		description,
		keywords,
		url: "/products",
		openGraph: {
			type: "website",
			images: [{
				url: "/og-products.jpg",
				width: 1200,
				height: 630,
				alt: "Premium Mushroom Cultivation Supplies - Complete Product Collection"
			}]
		},
		twitter: {
			card: "summary_large_image"
		}
	});
}

async function ProductsPageContent({ searchParams }: { searchParams?: { sort?: string; page?: string } }) {
	const page = searchParams?.page ? parseInt(searchParams.page) : 1;
	const sort = searchParams?.sort || "featured";
	
	try {
		// Get products using the working getAllProducts function
		const productsData = await getAllProducts(sort, page, 24);
		
		if (!productsData) {
			return <div>No products found</div>;
		}

		// Create a virtual collection for all products
		const virtualCollection: ShopifyCollectionWithPagination = {
			id: "all-products",
			handle: "all-products", 
			title: "All Products",
			description: "Browse our complete collection of premium mushroom growing supplies and equipment.",
			products: productsData.products,
			productsCount: productsData.productsCount,
			image: null,
		};

		// Generate structured data
		const breadcrumbs = [
			{ name: "Home", url: "/" },
			{ name: "All Products", url: "/products" }
		];
		
		const breadcrumbSchema = getEnhancedBreadcrumbSchema(breadcrumbs);
		const websiteSchema = getSearchActionSchema();
		const organizationSchema = getEnhancedOrganizationSchema();
		const catalogSchema = getOfferCatalogSchema(productsData.products.slice(0, 10));

		return (
			<>
				{/* JSON-LD Structured Data */}
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(breadcrumbSchema),
					}}
				/>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(websiteSchema),
					}}
				/>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(organizationSchema),
					}}
				/>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(catalogSchema),
					}}
				/>
				
				{/* Google Analytics for Products Page */}
				<Script id="products-page-analytics" strategy="afterInteractive">
					{`
						window.dataLayer = window.dataLayer || [];
						window.dataLayer.push({
							'event': 'page_view',
							'page_type': 'products_listing',
							'page_location': window.location.href,
							'content_category': 'product_catalog',
							'current_page': ${page},
							'sort_by': '${sort}',
							'total_products': ${productsData.productsCount},
							'products_per_page': 24,
							'ecommerce': {
								'item_list_name': 'All Products',
								'item_list_id': 'all_products',
								'items': ${JSON.stringify(
									productsData.products.slice(0, 20).map((product, index) => ({
										item_id: product.id,
										item_name: product.title,
										item_category: product.productType || 'General',
										item_brand: product.vendor || 'Zugzology',
										price: product.priceRange?.minVariantPrice?.amount || 0,
										currency: product.priceRange?.minVariantPrice?.currencyCode || 'USD',
										index: index + 1,
										quantity: 1
									}))
								)}
							}
						});
						
						// Track view_item_list event
						window.dataLayer.push({
							'event': 'view_item_list',
							'item_list_name': 'All Products',
							'item_list_id': 'all_products',
							'items': ${JSON.stringify(
								productsData.products.slice(0, 20).map((product, index) => ({
									item_id: product.id,
									item_name: product.title,
									item_category: product.productType || 'General',
									item_brand: product.vendor || 'Zugzology',
									price: product.priceRange?.minVariantPrice?.amount || 0,
									currency: product.priceRange?.minVariantPrice?.currencyCode || 'USD',
									index: index + 1,
								}))
							)}
						});
					`}
				</Script>
				
				<RealtimeProductsContent
					collection={virtualCollection}
					title="All Products"
					description="Browse our complete collection of premium mushroom growing supplies and equipment."
					currentPage={page}
					totalProducts={productsData.productsCount}
					collectionHandle="all-products"
					context="all-products"
				/>
			</>
		);
	} catch (error) {
		console.error("Error loading products:", error);
		return <div>Error loading products. Please try again later.</div>;
	}
}

export default function ProductsPage({ searchParams }: { searchParams?: { sort?: string; page?: string } }) {
	return (
		<Suspense fallback={<div>Loading products...</div>}>
			<ProductsPageContent searchParams={searchParams} />
		</Suspense>
	);
}
