import { getProducts } from "@/lib/actions/shopify";
import { ProductsContentClient } from "@/components/products/products-content-client";
import type { Metadata } from "next";
import { ProductsHeader } from "@/components/products/products-header";

export const metadata: Metadata = {
	title: "Search Products | Premium Mushroom Growing Supplies",
	description: "Search through our catalog of premium mushroom growing supplies and equipment.",
	openGraph: {
		title: "Search Products | Premium Mushroom Growing Supplies",
		description: "Search through our catalog of premium mushroom growing supplies and equipment.",
		url: "https://zugzology.com/search",
		siteName: "Zugzology",
		type: "website",
	},
	alternates: {
		canonical: "https://zugzology.com/search",
	},
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SearchPage({ searchParams }: { searchParams?: { q?: string } }) {
	const nextjs15 = await searchParams;
	const products = await getProducts();
	const query = nextjs15?.q || "";

	// Create empty collection if no products found
	if (!products) {
		const emptyCollection = {
			id: "search",
			handle: "search",
			title: query ? `No Results for "${query}"` : "All Products",
			description: "",
			products: {
				edges: [],
			},
		};

		return (
			<section aria-label="Search Results" className="search-section">
				<ProductsContentClient collection={emptyCollection} />
			</section>
		);
	}

	const filteredProducts = query
		? products.filter((product) => {
				const searchLower = query.toLowerCase();
				return product.title.toLowerCase().includes(searchLower) || product.description?.toLowerCase().includes(searchLower) || product.productType?.toLowerCase().includes(searchLower) || product.vendor?.toLowerCase().includes(searchLower);
		  })
		: products;

	const virtualCollection = {
		id: "search",
		handle: "search",
		title: query ? `Search Results for "${query}"` : "All Products",
		description: filteredProducts.length === 0 ? "No products found matching your search." : "",
		products: {
			edges: filteredProducts.map((product) => ({
				node: product,
			})),
		},
	};

	const searchJsonLd = {
		"@context": "https://schema.org",
		"@type": "SearchResultsPage",
		name: "Product Search",
		description: "Search through our catalog of products",
		url: "https://zugzology.com/search",
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
					name: "Search",
					item: "https://zugzology.com/search",
				},
			],
		},
	};

	return (
		<section aria-label="Search Results" className="search-section">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(searchJsonLd),
				}}
			/>
			<ProductsContentClient collection={virtualCollection} />
		</section>
	);
}
