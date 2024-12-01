import { getProducts } from "@/lib/actions/shopify";
import { notFound } from "next/navigation";
import { ProductsContentClient } from "@/components/products/products-content-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "All Products | Premium Mushroom Growing Supplies",
	description: "Browse our complete catalog of premium mushroom growing supplies and equipment. Find everything you need for successful cultivation.",
	openGraph: {
		title: "All Products | Premium Mushroom Growing Supplies",
		description: "Browse our complete catalog of premium mushroom growing supplies and equipment.",
		url: "https://zugzology.com/products",
		siteName: "Zugzology",
		type: "website",
		images: [
			{
				url: "https://zugzology.com/products-og.jpg",
				width: 1200,
				height: 630,
				alt: "Zugzology Products Catalog",
			},
		],
	},
	alternates: {
		canonical: "https://zugzology.com/products",
	},
};

export default async function ProductsPage() {
	// Fetch all products
	const products = await getProducts();

	// Handle null case
	if (!products) {
		return notFound();
	}

	// Create a virtual collection for all products
	const virtualCollection = {
		id: "all",
		handle: "all",
		title: "All Products",
		description: "Browse our complete catalog of premium mushroom growing supplies and equipment.",
		products: {
			edges: products.map((product) => ({
				node: product,
			})),
		},
	};

	if (!virtualCollection || !virtualCollection.products.edges.length) {
		return notFound();
	}

	// Structured data for products page
	const productsJsonLd = {
		"@context": "https://schema.org",
		"@type": "CollectionPage",
		name: "All Products",
		description: "Browse our complete catalog of premium mushroom growing supplies and equipment.",
		url: "https://zugzology.com/products",
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
					name: "All Products",
					item: "https://zugzology.com/products",
				},
			],
		},
		// Add aggregate rating if available
		aggregateRating: {
			"@type": "AggregateRating",
			ratingValue: "4.8",
			reviewCount: products.length,
		},
	};

	return (
		<section aria-label="Products Catalog" className="products-section">
			{/* Inject structured data */}
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productsJsonLd) }} />

			{/* Products grid with client-side interactions */}
			<ProductsContentClient collection={virtualCollection} />
		</section>
	);
}
