import { Metadata } from "next";
import React, { Suspense } from "react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { cache } from "react";
import { notFound } from "next/navigation";
import { ProductsContent } from "@/components/products/products-content";
import type { ShopifyCollectionWithPagination } from "@/lib/api/shopify/types";
import { getCollection, getSiteSettings } from "@/lib/actions/shopify";

// Tell Next.js this is a dynamic route that shouldn't be prerendered
export const dynamic = "force-dynamic";

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

		// Special case for the "all" collection - create a virtual collection
		if (handle === "all") {
			// Import the getProducts function which should fetch all products
			const { getProducts } = await import("@/lib/actions/shopify");
			const products = await getProducts();

			// Create a virtual collection object that matches the ShopifyCollectionWithPagination structure
			return {
				id: "all",
				handle: "all",
				title: "All Products",
				description: "Browse our complete collection of premium mushroom growing supplies and equipment.",
				products: {
					// Provide both nodes and edges to satisfy TypeScript
					nodes: products || [],
					edges: (products || []).map((product, index) => ({
						node: product,
						cursor: `product-${index}`, // Add a mock cursor value
					})),
					pageInfo: {
						hasNextPage: false,
						hasPreviousPage: false,
						startCursor: "",
						endCursor: "",
					},
				},
				productsCount: products?.length || 0,
				image: null,
			} as unknown as ShopifyCollectionWithPagination; // Use unknown to bypass type checking
		}

		// Normal case - call getCollection with the handle
		const collection = await getCollection(handle);

		if (!collection) {
			console.error("Collection not found:", handle);
			return null;
		}

		// Add default pageInfo if missing
		if (!collection.products.pageInfo) {
			collection.products.pageInfo = {
				hasNextPage: false,
				hasPreviousPage: false,
				startCursor: "", // Use empty string instead of null
				endCursor: "", // Use empty string instead of null
			};
		}

		// Add default endCursor if missing
		if (!collection.products.pageInfo.endCursor) {
			collection.products.pageInfo.endCursor = "";
		}

		return collection;
	} catch (error) {
		console.error("Error fetching collection:", error);
		return null;
	}
});

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
	const collection = await getCachedCollection(params.handle);
	if (!collection)
		return {
			title: "Collection Not Found",
			description: "The requested collection could not be found.",
			robots: { index: false, follow: true },
		};

	const title = `${collection.title} | Zugzology`;
	const description =
		collection.description ||
		`Shop our premium ${collection.title.toLowerCase()} collection. High-quality mushroom growing supplies and equipment with fast shipping and expert support.`;
	const keywords = [
		`${collection.title} mushroom supplies`,
		"mushroom cultivation",
		"growing equipment",
		"mushroom growing",
		collection.title.toLowerCase(),
	].join(", ");

	return {
		title,
		description,
		keywords,
		openGraph: {
			title,
			description,
			type: "website",
			url: `https://zugzology.com/collections/${collection.handle}`,
			images: collection.image
				? [
						{
							url: collection.image.url,
							width: collection.image.width || 1200,
							height: collection.image.height || 630,
							alt: collection.image.altText || collection.title,
						},
				  ]
				: [],
		},
		twitter: {
			card: "summary_large_image",
			title: `${collection.title} - Mushroom Growing Supplies | Zugzology`,
			description,
			images: collection.image ? [collection.image.url] : [],
		},
		alternates: {
			canonical: `https://zugzology.com/collections/${collection.handle}`,
		},
	};
}

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
	try {
		if (!params.handle) {
			console.error("Collection handle is missing");
			return notFound();
		}

		// Get sort and page from searchParams
		const sort = searchParams?.sort || "featured";
		const page = searchParams?.page ? parseInt(searchParams.page) : 1;

		// Fetch collection data with proper error handling
		const collection = await getCachedCollection(params.handle);

		if (!collection) {
			console.error("Failed to load collection:", params.handle);
			return notFound();
		}

		// Get site settings for SEO
		const siteSettings = await getSiteSettings();

		// Create structured data for SEO
		const structuredData = {
			"@context": "https://schema.org",
			"@type": "CollectionPage",
			name: collection.title,
			description: collection.description || `Shop our premium ${collection.title.toLowerCase()} collection.`,
			url: `https://zugzology.com/collections/${collection.handle}`,
			breadcrumb: {
				"@type": "BreadcrumbList",
				itemListElement: [
					{
						"@type": "ListItem",
						position: 1,
						name: "Home",
						item: "https://zugzology.com",
					},
					{
						"@type": "ListItem",
						position: 2,
						name: "Collections",
						item: "https://zugzology.com/collections",
					},
					{
						"@type": "ListItem",
						position: 3,
						name: collection.title,
						item: `https://zugzology.com/collections/${collection.handle}`,
					},
				],
			},
		};

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

		// Create the FAQ structured data outside the condition
		let faqStructuredData = null;
		if (faqContent.length > 0) {
			faqStructuredData = {
				"@context": "https://schema.org",
				"@type": "FAQPage",
				mainEntity: faqContent.map((faq) => ({
					"@type": "Question",
					name: faq.question,
					acceptedAnswer: {
						"@type": "Answer",
						text: faq.answer,
					},
				})),
			};
		}

		return (
			<ErrorBoundary
				fallback={
					<div className="container py-10">
						Sorry, there was an error loading this collection. Please try again later.
					</div>
				}
			>
				<Suspense fallback={<CollectionLoading />}>
					{/* Add structured data via script tag */}
					<script
						type="application/ld+json"
						dangerouslySetInnerHTML={{
							__html: JSON.stringify(structuredData),
						}}
					/>

					{/* Add FAQ structured data separately */}
					{faqStructuredData && (
						<script
							type="application/ld+json"
							dangerouslySetInnerHTML={{
								__html: JSON.stringify(faqStructuredData),
							}}
						/>
					)}

					{/* Collection content with original component */}
					<ProductsContent
						collection={collection}
						title={collection.title}
						description={collection.description || undefined}
						currentPage={page}
						defaultSort={sort}
						totalProducts={collection.productsCount}
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
				</Suspense>
			</ErrorBoundary>
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
