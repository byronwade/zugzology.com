"use server";

import { getProducts, getAllBlogPosts } from "@/lib/actions/shopify";
import type { Metadata } from "next";
import { ProductsContentClient } from "@/components/products/products-content-client";
import type { ShopifyCollection, ShopifyBlogArticle } from "@/lib/types";
import { InitializeSearch } from "@/components/search/initialize-search";
import { BlogSearchResults } from "@/components/blog/blog-search-results";
import { unstable_cache } from "next/cache";

interface SearchPageProps {
	searchParams?: {
		q?: string;
		sort?: string;
		availability?: string;
		price?: string;
		category?: string;
	};
}

// Generate metadata for the search results
export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
	const nextjs15Search = await searchParams;
	const query = nextjs15Search?.q || "";
	const title = query ? `Search results for "${query}" | Zugzology` : "Search Products | Zugzology";

	return {
		title,
		description: `Browse our selection of premium mushroom growing supplies and equipment${query ? ` matching "${query}"` : ""}. Find everything you need for successful cultivation at Zugzology.`,
		keywords: ["mushroom supplies", "growing equipment", "cultivation tools", query].filter(Boolean),
		openGraph: {
			title,
			description: `Discover premium mushroom growing supplies${query ? ` matching "${query}"` : ""}. Shop at Zugzology for quality cultivation equipment.`,
			type: "website",
			url: `https://zugzology.com/search${query ? `?q=${encodeURIComponent(query)}` : ""}`,
			siteName: "Zugzology",
		},
		alternates: {
			canonical: `https://zugzology.com/search${query ? `?q=${encodeURIComponent(query)}` : ""}`,
		},
		robots: {
			index: true,
			follow: true,
			nocache: true,
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

// Fetch products data with caching
const getSearchData = unstable_cache(
	async (query: string) => {
		if (!query || typeof query !== "string") {
			console.error("Invalid search query:", query);
			return [];
		}

		const startTime = performance.now();

		try {
			const products = await getProducts();

			// Filter products based on search query
			const searchTerms = query.toLowerCase().split(/\s+/);
			const filteredProducts = products.filter((product) => {
				const searchableText = [product.title, product.description, product.productType, product.vendor, ...(product.tags || [])].filter(Boolean).join(" ").toLowerCase();

				return searchTerms.every((term) => searchableText.includes(term));
			});

			const duration = performance.now() - startTime;
			if (duration > 100) {
				console.log(`⚡ [Search Data] ${duration.toFixed(2)}ms | Results: ${filteredProducts.length}`);
			}

			return filteredProducts;
		} catch (error) {
			console.error(
				`Error searching products:`,
				error instanceof Error
					? {
							message: error.message,
							stack: error.stack?.split("\n").slice(0, 3),
					  }
					: "Unknown error"
			);
			return [];
		}
	},
	["search-data"],
	{
		revalidate: 60, // Revalidate every minute
		tags: ["search"],
	}
);

export default async function SearchPage({ searchParams }: SearchPageProps) {
	const nextjs15Search = await searchParams;
	const query = nextjs15Search?.q || "";

	// Fetch both products and blog posts
	const [products, blogPosts] = await Promise.all([getProducts(), getAllBlogPosts()]);

	// Filter products based on search query
	const filteredProducts = query
		? products.filter((product) => {
				const searchableText = [product.title, product.description, product.productType, product.vendor, ...(product.tags || [])].filter(Boolean).join(" ").toLowerCase();
				return query
					.toLowerCase()
					.split(/\s+/)
					.every((term) => searchableText.includes(term));
		  })
		: products;

	// Filter blog posts based on search query
	const filteredBlogPosts = query
		? blogPosts.filter((post) => {
				const searchableText = [post.title, post.excerpt, post.content, post.author.name, ...(post.tags || [])].filter(Boolean).join(" ").toLowerCase();
				return query
					.toLowerCase()
					.split(/\s+/)
					.every((term) => searchableText.includes(term));
		  })
		: blogPosts;

	// Create virtual collection for products
	const searchResults: ShopifyCollection = {
		id: "search-results",
		handle: "search-results",
		title: query ? `Search Results for "${query}"` : "All Products",
		description: query ? `Found ${filteredProducts.length} items matching your search` : "Browse our complete catalog",
		products: {
			nodes: filteredProducts.map((product) => ({
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
					nodes: product.images.nodes.slice(0, 1), // Only keep first image for initial render
				},
				variants: {
					nodes: product.variants.nodes.slice(0, 1), // Only keep first variant for initial render
				},
				media: {
					nodes: product.media?.nodes || [],
				},
				metafields: product.metafields,
			})),
		},
	};

	return (
		<div className="w-full">
			<InitializeSearch products={products} blogPosts={blogPosts} />
			{/* Products Section */}
			<ProductsContentClient collection={searchResults} searchQuery={nextjs15Search?.sort} />

			{/* Blog Posts Section */}
			<BlogSearchResults posts={filteredBlogPosts} searchQuery={query} />
		</div>
	);
}
