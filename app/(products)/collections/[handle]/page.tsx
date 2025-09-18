import { Metadata } from "next";
import React, { Suspense } from "react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { cache } from "react";
import { notFound } from "next/navigation";
import { RealtimeProductsContent } from "@/components/features/products/realtime-products-content";
import type { ShopifyCollectionWithPagination } from "@/lib/api/shopify/types";
import { getCollection, getSiteSettings, getPaginatedProducts } from "@/lib/api/shopify/actions";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/seo-utils";
import { getEnhancedBreadcrumbSchema, getEnhancedCollectionSchema, getSearchActionSchema, getEnhancedFAQSchema } from "@/lib/seo/enhanced-jsonld";
import Script from "next/script";
import Link from "next/link";

// Dynamic rendering handled by dynamicIO experimental feature

// Define the page props
export interface CollectionPageProps {
	params: { handle: string };
	searchParams?: { sort?: string; page?: string };
}

// Cache the collection data
const getCachedCollection = cache(async (handle: string, sort = "featured", page = 1) => {
	

	try {
		// Check if handle is valid
		if (!handle || typeof handle !== "string") {
			console.error("Invalid handle:", handle);
			return null;
		}

		// Get timestamp for performance tracking
		const startTime = typeof window !== 'undefined' ? Date.now() : 0;

		// Special case for the "all" or "all-products" collection - create a virtual collection
		if (handle === "all" || handle === "all-products") {
			// Use the imported getPaginatedProducts function

			// Removed console.log for performance

			const { products, totalCount } = await getPaginatedProducts(page, sort, 24);

			// Removed console.log for performance
			const endTime = typeof window !== 'undefined' ? Date.now() : 0;

			// Create a virtual collection object that matches the ShopifyCollectionWithPagination structure
			return {
				id: handle,
				handle: handle,
				title: "All Products",
				description: "Browse our complete collection of premium mushroom growing supplies and equipment.",
				products: {
					edges: (products || []).map((product, index) => ({
						node: product,
						cursor: `product-${index}`, // Add a mock cursor value
					})),
					pageInfo: {
						hasNextPage: page * 24 < totalCount,
						hasPreviousPage: page > 1,
						startCursor: products?.length > 0 ? "product-0" : "",
						endCursor: products?.length > 0 ? `product-${products.length - 1}` : "",
					},
				},
				productsCount: totalCount,
				image: null,
			} as ShopifyCollectionWithPagination;
		}

		// Normal case - call getCollection with the handle and pagination options
		// Removed console.log for performance

		try {
			const collection = await getCollection(handle, {
				page,
				limit: 24,
				sort: sort === "featured" ? "MANUAL" : sort.toUpperCase().replace("-", "_"),
				reverse: sort.includes("desc") || sort === "newest",
			});

			if (!collection) {
				console.error("Collection not found:", handle);
				// Create a fallback virtual collection with all products if no specific collection exists
				const { products, totalCount } = await getPaginatedProducts(page, sort, 24);

				const endTime = typeof window !== 'undefined' ? Date.now() : 0;
				console.log(
					`[getCachedCollection] Collection not found, using fallback with ${products?.length || 0} products in ${
						endTime - startTime
					}ms`
				);

				return {
					id: handle,
					handle: handle,
					title: handle.charAt(0).toUpperCase() + handle.slice(1).replace(/-/g, " "),
					description: `Browse our ${handle.replace(/-/g, " ")} collection of premium mushroom growing supplies.`,
					products: {
						edges: (products || []).map((product, index) => ({
							node: product,
							cursor: `product-${index}`,
						})),
						pageInfo: {
							hasNextPage: page * 24 < totalCount,
							hasPreviousPage: page > 1,
							startCursor: products?.length > 0 ? "product-0" : "",
							endCursor: products?.length > 0 ? `product-${products.length - 1}` : "",
						},
					},
					productsCount: totalCount,
					image: null,
				} as ShopifyCollectionWithPagination;
			}

			const endTime = typeof window !== 'undefined' ? Date.now() : 0;
			// Removed console.log for performance
			return collection;
		} catch (error) {
			console.error("Error fetching collection, falling back to all products:", error);
			// Create a fallback virtual collection with all products if there's an error
			const { products, totalCount } = await getPaginatedProducts(page, sort, 24);

			const endTime = typeof window !== 'undefined' ? Date.now() : 0;
			// Removed console.log for performance

			return {
				id: handle,
				handle: handle,
				title: handle.charAt(0).toUpperCase() + handle.slice(1).replace(/-/g, " "),
				description: `Browse our ${handle.replace(/-/g, " ")} collection of premium mushroom growing supplies.`,
				products: {
					edges: (products || []).map((product, index) => ({
						node: product,
						cursor: `product-${index}`,
					})),
					pageInfo: {
						hasNextPage: page * 24 < totalCount,
						hasPreviousPage: page > 1,
						startCursor: products?.length > 0 ? "product-0" : "",
						endCursor: products?.length > 0 ? `product-${products.length - 1}` : "",
					},
				},
				productsCount: totalCount,
				image: null,
			} as ShopifyCollectionWithPagination;
		}
	} catch (error) {
		console.error("Error fetching collection:", error);
		return null;
	}
});

export async function generateMetadata({ params, searchParams }: CollectionPageProps): Promise<Metadata> {
	// Await params as required by Next.js 15
	const awaitedParams = await params;
	const awaitedSearchParams = await searchParams;

	const collection = await getCachedCollection(awaitedParams.handle);
	if (!collection)
		return generateSEOMetadata({
			title: "Collection Not Found",
			description: "The requested collection could not be found.",
			noindex: true,
		});

	const page = awaitedSearchParams?.page ? parseInt(awaitedSearchParams.page) : 1;
	const sort = awaitedSearchParams?.sort || "featured";

	const baseTitle = `${collection.title} Collection - Premium Mushroom Growing Supplies`;
	const title = page > 1 ? `${baseTitle} - Page ${page}` : baseTitle;
	
	const baseDescription = collection.description || 
		`Discover our premium ${collection.title.toLowerCase()} collection. High-quality mushroom growing supplies and equipment with fast shipping and expert support. Perfect for beginners and professionals.`;

	const keywords = [
		`${collection.title} mushroom supplies`,
		"mushroom cultivation",
		"growing equipment",
		"mushroom growing",
		collection.title.toLowerCase(),
		"premium growing supplies",
		"mushroom cultivation equipment",
		"organic growing supplies",
		"professional mushroom equipment",
		"mushroom farming supplies"
	];

	// Add sort-specific keywords
	if (sort === "price-asc") keywords.push("affordable", "budget-friendly");
	if (sort === "price-desc") keywords.push("premium", "professional grade");
	if (sort === "newest") keywords.push("latest", "new arrivals");

	return generateSEOMetadata({
		title,
		description: baseDescription,
		keywords,
		url: `/collections/${collection.handle}${page > 1 ? `?page=${page}` : ''}${sort !== 'featured' ? `${page > 1 ? '&' : '?'}sort=${sort}` : ''}`,
		openGraph: {
			type: "website",
			images: collection.image ? [{
				url: collection.image.url,
				width: collection.image.width || 1200,
				height: collection.image.height || 630,
				alt: collection.image.altText || collection.title,
			}] : [],
		},
		...(page > 1 && { noindex: true }), // Don't index pagination pages beyond page 1
	});
}

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
	try {
		// Await params and searchParams as required by Next.js 15
		const awaitedParams = await params;
		const awaitedSearchParams = await searchParams;

		if (!awaitedParams.handle) {
			console.error("Collection handle is missing");
			return notFound();
		}

		// Get sort and page from searchParams
		const sort = awaitedSearchParams?.sort || "featured";
		const page = awaitedSearchParams?.page ? parseInt(awaitedSearchParams.page) : 1;

		// Fetch collection data with proper error handling
		const collection = await getCachedCollection(awaitedParams.handle, sort, page);

		if (!collection) {
			console.error("Failed to load collection:", awaitedParams.handle);
			return notFound();
		}

		// Generate enhanced structured data
		const products = collection.products.edges.map(edge => edge.node);
		
		const breadcrumbs = [
			{ name: "Home", url: "/" },
			{ name: "Products", url: "/products" },
			{ name: collection.title, url: `/collections/${collection.handle}` },
		];
		
		const breadcrumbSchema = getEnhancedBreadcrumbSchema(breadcrumbs);
		const collectionSchema = getEnhancedCollectionSchema(collection, products);
		const websiteSchema = getSearchActionSchema();

		// Create FAQ content for specific collection types
		const faqContent: Array<{ question: string; answer: string }> = [];

		// Add collection-specific FAQs based on the type of collection
		if (collection.handle.includes("substrate") || collection.title.toLowerCase().includes("substrate")) {
			faqContent.push(
				{
					question: "What kind of mushrooms can I grow with this substrate?",
					answer:
						"Our substrates are formulated to support a wide variety of gourmet and medicinal mushrooms, including oyster, shiitake, lion's mane, and reishi varieties. Check each product description for specific compatibility details.",
				},
				{
					question: "How should I store the substrate before use?",
					answer:
						"Store your substrate in a cool, dry place away from direct sunlight. Unopened substrate bags can typically be stored for 3-6 months when kept in proper conditions.",
				},
				{
					question: "Do I need to pasteurize or sterilize the substrate before use?",
					answer:
						"Our substrates come fully pasteurized and ready to use. Simply open in a clean environment and proceed with inoculation according to the included instructions.",
				}
			);
		} else if (collection.handle.includes("kit") || collection.title.toLowerCase().includes("kit")) {
			faqContent.push(
				{
					question: "Are your growing kits suitable for beginners?",
					answer:
						"Yes! Our kits are designed with beginners in mind and include detailed step-by-step instructions. They require minimal setup and maintenance, making them perfect for first-time growers.",
				},
				{
					question: "How long until I see mushrooms with a growing kit?",
					answer:
						"Most of our kits will produce their first flush of mushrooms within 10-14 days after setting up, depending on environmental conditions and the mushroom variety.",
				},
				{
					question: "What temperature and humidity levels are required?",
					answer:
						"Most mushroom varieties prefer temperatures between 65-75°F (18-24°C) and humidity levels of 80-95%. Each kit includes specific instructions for the particular mushroom variety.",
				}
			);
		}

		// Create the FAQ structured data using enhanced schema
		let faqSchema = null;
		if (faqContent.length > 0) {
			faqSchema = getEnhancedFAQSchema(faqContent);
		}

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
						__html: JSON.stringify(collectionSchema),
					}}
				/>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(websiteSchema),
					}}
				/>
				{faqSchema && (
					<script
						type="application/ld+json"
						dangerouslySetInnerHTML={{
							__html: JSON.stringify(faqSchema),
						}}
					/>
				)}
				
				{/* Google Analytics for Collection */}
				<Script id="collection-analytics" strategy="afterInteractive">
					{`
						window.dataLayer = window.dataLayer || [];
						window.dataLayer.push({
							'event': 'page_view',
							'page_type': 'collection',
							'page_location': window.location.href,
							'collection_title': '${collection.title.replace(/'/g, "\\'")}',
							'collection_handle': '${collection.handle}',
							'products_count': ${collection.productsCount},
							'current_page': ${page},
							'sort_order': '${sort.replace(/'/g, "\\'")}'
						});
						
						// Track collection view event
						window.dataLayer.push({
							'event': 'view_item_list',
							'item_list_id': '${collection.handle}',
							'item_list_name': '${collection.title.replace(/'/g, "\\'")}',
							'items': ${JSON.stringify(products.slice(0, 10).map((product, index) => ({
								item_id: product.id,
								item_name: product.title,
								item_category: collection.title,
								price: parseFloat(product.priceRange?.minVariantPrice?.amount || '0'),
								index: index,
							})))}
						});
					`}
				</Script>
				
				<ErrorBoundary
					fallback={
						<div className="container py-10">
							Sorry, there was an error loading this collection. Please try again later.
						</div>
					}
				>
					<Suspense fallback={<CollectionLoading />}>
						<div className="w-full">
							{/* Breadcrumb Navigation */}
							<nav className="px-4 pt-4" aria-label="Breadcrumb">
								<ol className="flex items-center space-x-2 text-sm text-gray-600">
									<li>
										<Link href="/" className="hover:text-gray-900">Home</Link>
									</li>
									<li className="text-gray-400">/</li>
									<li>
										<Link href="/products" className="hover:text-gray-900">Products</Link>
									</li>
									<li className="text-gray-400">/</li>
									<li className="text-gray-900 font-medium">{collection.title}</li>
								</ol>
							</nav>
							
							{/* Collection content with real-time AI */}
							<RealtimeProductsContent
								collection={collection}
								title={collection.title}
								description={collection.description || undefined}
								currentPage={page}
								totalProducts={collection.productsCount}
								collectionHandle={collection.handle}
								context="collection"
							/>

							{/* Add FAQ content if available */}
							{faqContent.length > 0 && (
								<div className="container mx-auto px-4 py-12">
									<h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
									<div className="space-y-6 divide-y">
										{faqContent.map((faq, index) => (
											<div key={index} className={index > 0 ? "pt-6" : ""}>
												<h3 className="text-lg font-medium text-gray-900 mb-2">{faq.question}</h3>
												<p className="text-gray-600">{faq.answer}</p>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					</Suspense>
				</ErrorBoundary>
			</>
		);
	} catch (error) {
		console.error("Error in collection page:", error);
		return (
			<div className="container py-10">Sorry, there was an error loading this collection. Please try again later.</div>
		);
	}
}

function CollectionLoading() {
	return (
		<div className="container mx-auto py-10 px-4">
			<div className="animate-pulse space-y-6">
				<div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
				<div className="h-4 bg-gray-200 rounded w-2/3 mb-12"></div>
				<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
					{Array(8)
						.fill(0)
						.map((_, i) => (
							<div key={i} className="space-y-3">
								<div className="bg-gray-200 rounded-lg aspect-square"></div>
								<div className="h-4 bg-gray-200 rounded w-3/4"></div>
								<div className="h-4 bg-gray-200 rounded w-1/2"></div>
							</div>
						))}
				</div>
			</div>
		</div>
	);
}
