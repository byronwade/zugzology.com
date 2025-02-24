import { getProducts, getAllBlogPosts } from "@/lib/actions/shopify";
import type { Metadata } from "next";
import { InitializeSearch } from "@/components/search/initialize-search";
import { unstable_cache } from "next/cache";
import { Suspense } from "react";
import { HomeLoading } from "@/components/loading";
import { ProductsContent } from "@/components/products/products-content";

export const runtime = "edge";
export const preferredRegion = "auto";
export const revalidate = 0;

interface SearchPageProps {
	searchParams?: {
		q?: string;
		sort?: string;
		availability?: string;
		price?: string;
		category?: string;
		page?: string;
	};
}

// Optimize search with a worker function and caching
const getSearchData = unstable_cache(
	async (query: string, sort = "featured", page = 1) => {
		if (!query || typeof query !== "string") {
			return { products: [], totalProducts: 0 };
		}

		const startTime = performance.now();

		const products = await getProducts();
		const searchTerms = query.toLowerCase().split(/\s+/);
		const searchCache = new Map<string, boolean>();

		// Filter products
		let filteredProducts = products.filter((product) => {
			const cacheKey = `${product.id}-${query}`;
			const cachedResult = searchCache.get(cacheKey);

			if (cachedResult !== undefined) {
				return cachedResult;
			}

			const searchableText = [product.title, product.productType, product.vendor, ...(product.tags || [])].filter(Boolean).join(" ").toLowerCase();

			const basicMatch = searchTerms.every((term) => searchableText.includes(term));
			const result = basicMatch || (product.description && searchTerms.every((term) => product.description?.toLowerCase().includes(term)));

			searchCache.set(cacheKey, Boolean(result));
			return result;
		});

		// Apply sorting if not featured
		if (sort && sort !== "featured") {
			filteredProducts.sort((a, b) => {
				switch (sort) {
					case "price-asc":
						return parseFloat(a.priceRange.minVariantPrice.amount) - parseFloat(b.priceRange.minVariantPrice.amount);
					case "price-desc":
						return parseFloat(b.priceRange.minVariantPrice.amount) - parseFloat(a.priceRange.minVariantPrice.amount);
					case "title-asc":
						return a.title.localeCompare(b.title);
					case "title-desc":
						return b.title.localeCompare(a.title);
					case "newest":
						return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
					default:
						return 0;
				}
			});
		}

		const duration = performance.now() - startTime;
		if (duration > 100) {
			console.log(`⚡ [Search Data] ${duration.toFixed(2)}ms | Results: ${filteredProducts.length}`);
		}

		// Apply pagination
		const PRODUCTS_PER_PAGE = 50;
		const startIndex = (page - 1) * PRODUCTS_PER_PAGE;
		const endIndex = startIndex + PRODUCTS_PER_PAGE;
		const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

		return {
			products: paginatedProducts,
			totalProducts: filteredProducts.length,
		};
	},
	["search-data"],
	{
		revalidate: 60,
		tags: ["search"],
	}
);

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

// Search content component with optimizations
const SearchContent = async ({ searchParams }: SearchPageProps) => {
	const nextjs15Search = await searchParams;
	const query = nextjs15Search?.q || "";
	const sort = nextjs15Search?.sort || "featured";
	const page = nextjs15Search?.page ? parseInt(nextjs15Search.page) : 1;

	if (!query) {
		return (
			<div className="w-full min-h-[50vh] flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-xl font-semibold mb-2">Enter a search term</h2>
					<p className="text-muted-foreground">Use the search bar above to find products</p>
				</div>
			</div>
		);
	}

	// Get search results with caching
	const { products, totalProducts } = await getSearchData(query, sort, page);

	return <ProductsContent products={products} title={`Search Results for "${query}"`} currentPage={page} defaultSort="featured" totalProducts={totalProducts} />;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
	return (
		<div className="w-full space-y-8">
			<InitializeSearch products={[]} blogPosts={[]} />

			{/* Products Section */}
			<div className="w-full">
				<Suspense fallback={<HomeLoading />}>
					<SearchContent searchParams={searchParams} />
				</Suspense>
			</div>
		</div>
	);
}
