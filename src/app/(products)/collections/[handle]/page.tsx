import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import Script from "next/script";
import { cache, Suspense } from "react";
import { ProductGridWithFilters } from "@/components/features/products/product-grid-with-filters";
import { BreadcrumbConfigs, UniversalBreadcrumb } from "@/components/layout";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { getCollection, getPaginatedProducts } from "@/lib/api/shopify/actions";
import type { ShopifyCollectionWithPagination } from "@/lib/api/shopify/types";
import { FAQ_TEMPLATES } from "@/lib/config/wadesdesign.config";
import {
	getEnhancedBreadcrumbSchema,
	getEnhancedCollectionSchema,
	getEnhancedFAQSchema,
	getSearchActionSchema,
} from "@/lib/seo/enhanced-jsonld";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/seo-utils";

// Dynamic rendering handled by opting out of caching at request time

// Define the page props
export type CollectionPageProps = {
	params: { handle: string };
	searchParams?: { sort?: string; page?: string };
};

// Cache the collection data
const getCachedCollection = cache(async (handle: string, sort = "featured", page = 1) => {
	// Opt the collection page into dynamic rendering without route segment config
	noStore();
	try {
		// Check if handle is valid
		if (!handle || typeof handle !== "string") {
			return null;
		}

		// Special case for the "all" or "all-products" collection - create a virtual collection
		if (handle === "all" || handle === "all-products") {
			const { products, totalCount } = await getPaginatedProducts(page, sort, 24);

			// Create a virtual collection object that matches the ShopifyCollectionWithPagination structure
			return {
				id: handle,
				handle,
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
				sort: sort === "featured" ? "BEST_SELLING" : sort.toUpperCase().replace("-", "_"),
				reverse: sort.includes("desc") || sort === "newest",
			});

			if (!collection) {
				// Create a fallback virtual collection with all products if no specific collection exists
				const { products, totalCount } = await getPaginatedProducts(page, sort, 24);

				return {
					id: handle,
					handle,
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

			return collection;
		} catch (_error) {
			// Create a fallback virtual collection with all products if there's an error
			const { products, totalCount } = await getPaginatedProducts(page, sort, 24);

			return {
				id: handle,
				handle,
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
	} catch (_error) {
		return null;
	}
});

export async function generateMetadata({ params, searchParams }: CollectionPageProps): Promise<Metadata> {
	// Await params as required by Next.js 15
	const awaitedParams = await params;
	const awaitedSearchParams = await searchParams;

	const collection = await getCachedCollection(awaitedParams.handle);
	if (!collection) {
		return generateSEOMetadata({
			title: "Collection Not Found",
			description: "The requested collection could not be found.",
			noindex: true,
		});
	}

	const page = awaitedSearchParams?.page ? Number.parseInt(awaitedSearchParams.page, 10) : 1;
	const sort = awaitedSearchParams?.sort || "featured";

	const baseTitle = `${collection.title} Collection - Premium Mushroom Growing Supplies`;
	const title = page > 1 ? `${baseTitle} - Page ${page}` : baseTitle;

	const baseDescription =
		collection.description ||
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
		"mushroom farming supplies",
	];

	// Add sort-specific keywords
	if (sort === "price-asc") {
		keywords.push("affordable", "budget-friendly");
	}
	if (sort === "price-desc") {
		keywords.push("premium", "professional grade");
	}
	if (sort === "newest") {
		keywords.push("latest", "new arrivals");
	}

	// Calculate pagination for alternates
	const totalPages = Math.ceil(collection.productsCount / 24);
	const hasNextPage = page < totalPages;
	const hasPreviousPage = page > 1;

	return generateSEOMetadata({
		title,
		description: baseDescription,
		keywords,
		url: `/collections/${collection.handle}${page > 1 ? `?page=${page}` : ""}${sort !== "featured" ? `${page > 1 ? "&" : "?"}sort=${sort}` : ""}`,
		canonical: `/collections/${collection.handle}`, // Always point to page 1
		alternates: {
			...(hasPreviousPage && {
				types: {
					prev: `/collections/${collection.handle}${page > 2 ? `?page=${page - 1}` : ""}${sort !== "featured" ? `${page > 2 ? "&" : "?"}sort=${sort}` : ""}`,
				},
			}),
			...(hasNextPage && {
				types: {
					next: `/collections/${collection.handle}?page=${page + 1}${sort !== "featured" ? `&sort=${sort}` : ""}`,
				},
			}),
		},
		image: collection.image
			? {
					url: collection.image.url,
					width: collection.image.width || 1200,
					height: collection.image.height || 630,
					alt: collection.image.altText || collection.title,
				}
			: undefined,
		openGraph: {
			type: "website",
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
			return notFound();
		}

		// Get sort and page from searchParams
		const sort = awaitedSearchParams?.sort || "featured";
		const page = awaitedSearchParams?.page ? Number.parseInt(awaitedSearchParams.page, 10) : 1;

		// Fetch collection data with proper error handling
		const collection = await getCachedCollection(awaitedParams.handle, sort, page);

		if (!collection) {
			return notFound();
		}

		// Generate enhanced structured data
		const products = collection.products.edges.map((edge) => edge.node);

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
			faqContent.push(...FAQ_TEMPLATES.collections.substrate);
		} else if (collection.handle.includes("kit") || collection.title.toLowerCase().includes("kit")) {
			faqContent.push(...FAQ_TEMPLATES.collections.kit);
		} else if (collection.handle.includes("equipment") || collection.title.toLowerCase().includes("equipment")) {
			faqContent.push(...FAQ_TEMPLATES.collections.equipment);
		} else if (collection.handle.includes("spawn") || collection.title.toLowerCase().includes("spawn")) {
			faqContent.push(...FAQ_TEMPLATES.collections.spawn);
		} else if (collection.handle.includes("supplies") || collection.title.toLowerCase().includes("supplies")) {
			faqContent.push(...FAQ_TEMPLATES.collections.supplies);
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
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(breadcrumbSchema),
					}}
					type="application/ld+json"
				/>
				<script
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(collectionSchema),
					}}
					type="application/ld+json"
				/>
				<script
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(websiteSchema),
					}}
					type="application/ld+json"
				/>
				{faqSchema && (
					<script
						dangerouslySetInnerHTML={{
							__html: JSON.stringify(faqSchema),
						}}
						type="application/ld+json"
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
							'items': ${JSON.stringify(
								products.slice(0, 10).map((product, index) => ({
									item_id: product.id,
									item_name: product.title,
									item_category: collection.title,
									price: Number.parseFloat(product.priceRange?.minVariantPrice?.amount || "0"),
									index,
								}))
							)}
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
						{/* Breadcrumb Navigation */}
						<UniversalBreadcrumb items={BreadcrumbConfigs.collection(collection.title, collection.handle)} />

						{/* Collection content with filtering */}
						<ProductGridWithFilters
							collectionHandle={collection.handle}
							context="collection"
							currentPage={page}
							description={collection.description || undefined}
							products={products}
							showCollectionFilter={false}
							title={collection.title}
							totalProducts={collection.productsCount}
						/>

						{/* Add FAQ content if available */}
						{faqContent.length > 0 && (
							<div className="container mx-auto px-4 py-12">
								<h2 className="mb-6 font-bold text-2xl">Frequently Asked Questions</h2>
								<div className="space-y-6 divide-y divide-border">
									{faqContent.map((faq, index) => (
										<div className={index > 0 ? "pt-6" : ""} key={index}>
											<h3 className="mb-2 font-medium text-foreground text-lg">{faq.question}</h3>
											<p className="text-muted-foreground">{faq.answer}</p>
										</div>
									))}
								</div>
							</div>
						)}
					</Suspense>
				</ErrorBoundary>
			</>
		);
	} catch (_error) {
		return (
			<div className="container py-10">Sorry, there was an error loading this collection. Please try again later.</div>
		);
	}
}

function CollectionLoading() {
	return (
		<div className="container mx-auto px-4 py-10">
			<div className="animate-pulse space-y-6">
				<div className="mb-8 h-8 w-1/3 rounded bg-muted" />
				<div className="mb-12 h-4 w-2/3 rounded bg-muted" />
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
					{new Array(8).fill(0).map((_, i) => (
						<div className="space-y-3" key={i}>
							<div className="aspect-square rounded-lg bg-muted" />
							<div className="h-4 w-3/4 rounded bg-muted" />
							<div className="h-4 w-1/2 rounded bg-muted" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
