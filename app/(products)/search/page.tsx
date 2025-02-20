"use server";

import { getProducts, getAllBlogPosts } from "@/lib/actions/shopify";
import type { Metadata } from "next";
import { ProductList } from "@/components/products/product-list";
import type { ShopifyBlogArticle } from "@/lib/types";
import { InitializeSearch } from "@/components/search/initialize-search";
import { BlogSearchResults } from "@/components/blog/blog-search-results";
import { unstable_cache } from "next/cache";
import { ProductsHeaderWrapper } from "@/components/products/products-header-wrapper";

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

	return (
		<div className="w-full space-y-8">
			<InitializeSearch products={products} blogPosts={blogPosts} />

			{/* Products Section */}
			<div className="w-full">
				<ProductsHeaderWrapper title={query ? `Search Results for "${query}"` : "All Products"} description={query ? `Found ${filteredProducts.length} items matching your search` : "Browse our complete catalog"} count={filteredProducts.length} />
				<ProductList products={filteredProducts} />
			</div>

			{/* Blog Posts Section */}
			<div className="w-full">
				<BlogSearchResults posts={filteredBlogPosts} searchQuery={query} />
			</div>
		</div>
	);
}
