import { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { Suspense } from "react";

interface SearchResult {
	id: string;
	title: string;
	description: string;
	price: number;
	image: string;
	type: "product" | "collection" | "blog";
	url: string;
}

// Mock search data
const mockSearchResults: Record<string, SearchResult[]> = {
	backpack: [
		{
			id: "1",
			title: "Vintage Leather Backpack",
			description: "Handcrafted genuine leather backpack with antique brass hardware.",
			price: 129.99,
			image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80",
			type: "product",
			url: "/products/vintage-leather-backpack",
		},
	],
	tech: [
		{
			id: "4",
			title: "Wireless Noise-Canceling Headphones",
			description: "Premium wireless headphones with active noise cancellation.",
			price: 299.99,
			image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
			type: "product",
			url: "/products/wireless-headphones",
		},
		{
			id: "col_2",
			title: "Tech Gadgets Collection",
			description: "The latest and greatest in technology.",
			price: 0,
			image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&q=80",
			type: "collection",
			url: "/collections/tech-gadgets",
		},
		{
			id: "blog_3",
			title: "The Future of Smart Home Technology",
			description: "Explore the latest innovations in smart home technology.",
			price: 0,
			image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=500&q=80",
			type: "blog",
			url: "/blogs/tech/future-smart-home-technology",
		},
	],
	summer: [
		{
			id: "col_1",
			title: "Summer Essentials",
			description: "Everything you need for the perfect summer.",
			price: 0,
			image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80",
			type: "collection",
			url: "/collections/summer-essentials",
		},
	],
};

const searchItems = unstable_cache(
	async (query: string) => {
		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 1000));
		return mockSearchResults[query.toLowerCase()] || [];
	},
	["search"],
	{
		revalidate: 60,
		tags: ["search"],
	}
);

function SearchLoading() {
	return <div className="animate-pulse">Searching...</div>;
}

function SearchResultCard({ result }: { result: SearchResult }) {
	return (
		<a href={result.url} className="block border rounded-lg p-4 hover:shadow-md transition-shadow">
			<div className="flex items-center space-x-4">
				<img src={result.image} alt={result.title} className="w-20 h-20 object-cover rounded" />
				<div>
					<div className="flex items-center space-x-2">
						<span className="text-sm font-medium px-2 py-1 bg-gray-100 rounded capitalize">{result.type}</span>
						<h3 className="font-semibold">{result.title}</h3>
					</div>
					<p className="text-gray-600 mt-1">{result.description}</p>
					{result.type === "product" && <p className="font-bold mt-2">${result.price.toFixed(2)}</p>}
				</div>
			</div>
		</a>
	);
}

async function SearchResults({ query }: { query: string }) {
	const results = await searchItems(query);

	if (results.length === 0) {
		return (
			<div className="text-center py-12">
				<h2 className="text-2xl font-semibold mb-4">No results found for &ldquo;{query}&rdquo;</h2>
				<p className="text-gray-600">Try searching with different keywords or browse our products.</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{results.map((result) => (
				<SearchResultCard key={result.id} result={result} />
			))}
		</div>
	);
}

export const metadata: Metadata = {
	title: "Search Products | Mushroom Growing Supplies",
	description: "Search our complete catalog of mushroom growing supplies and equipment. Find exactly what you need for successful cultivation.",
	robots: {
		index: false, // Usually better to not index search pages
	},
};

// Add JSON-LD for search
const searchJsonLd = {
	"@context": "https://schema.org",
	"@type": "WebSite",
	url: "https://zugzology.com",
	potentialAction: {
		"@type": "SearchAction",
		target: {
			"@type": "EntryPoint",
			urlTemplate: "https://zugzology.com/search?q={search_term_string}",
		},
		"query-input": "required name=search_term_string",
	},
};

export default function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
	const query = searchParams.q || "";

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-2xl mx-auto">
				<h1 className="text-3xl font-bold mb-8">Search Results</h1>
				<form action="/search" method="GET" className="mb-8">
					<div className="flex gap-2">
						<input type="search" name="q" defaultValue={query} placeholder="Try searching for 'tech', 'backpack', or 'summer'..." className="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
						<button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
							Search
						</button>
					</div>
				</form>
				<Suspense fallback={<SearchLoading />}>
					<SearchResults query={query} />
				</Suspense>
			</div>
		</div>
	);
}
