"use client";

import { useEnhancedNavigation } from "@/lib/providers/enhanced-navigation-provider";
import { EnhancedNavigation } from "./enhanced-navigation";
import { EnhancedSearch, type SearchResult } from "./enhanced-search";
import { useSearch } from "@/lib/providers/search-provider";
import { ShopifyProduct, ShopifyBlogArticle } from "@/lib/types";

export function EnhancedLayout() {
	const { isEnhancedSearchOpen, closeEnhancedSearch } = useEnhancedNavigation();
	const { searchResults } = useSearch();

	// Transform search results to match EnhancedSearch component's format
	const transformedResults: SearchResult[] = searchResults.map((result) => {
		const item = result.item as ShopifyProduct | ShopifyBlogArticle;
		const isProduct = result.type === "product";

		// Get the image URL safely
		let imageUrl: string | undefined;
		if (isProduct) {
			const productItem = item as ShopifyProduct;
			imageUrl = productItem.images?.nodes?.[0]?.url || productItem.media?.nodes?.[0]?.previewImage?.url;
		} else {
			const blogItem = item as ShopifyBlogArticle;
			imageUrl = blogItem.image?.url;
		}

		return {
			id: item.handle || String(item.id),
			title: item.title,
			type: isProduct ? "product" : "article",
			category: isProduct ? (item as ShopifyProduct).productType : undefined,
			image: imageUrl,
		};
	});

	return (
		<>
			<EnhancedNavigation />
			{isEnhancedSearchOpen && (
				<div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
					<div className="fixed left-[50%] top-[20%] z-50 grid w-full max-w-lg translate-x-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg">
						<EnhancedSearch isOpen={isEnhancedSearchOpen} onClose={closeEnhancedSearch} initialResults={transformedResults} />
					</div>
				</div>
			)}
		</>
	);
}
