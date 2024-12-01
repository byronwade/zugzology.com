"use client";

import { ProductList } from "@/components/products/product-list";
import { ProductsHeader } from "@/components/products/products-header";
import { useViewMode } from "@/hooks/use-view-mode";
import type { ShopifyCollection } from "@/lib/types";
import Link from "next/link";

interface ProductsContentClientProps {
	collection: ShopifyCollection;
	searchQuery?: string;
}

export function ProductsContentClient({ collection, searchQuery }: ProductsContentClientProps) {
	const { view, setView, mounted } = useViewMode();

	// Show loading state during hydration
	if (!mounted) {
		return (
			<div className="w-full h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
			</div>
		);
	}

	// Handle empty collection
	if (!collection?.products?.edges) {
		return (
			<div className="w-full">
				<ProductsHeader title={collection?.title || "Products"} description={collection?.description} count={0} view={view} onViewChange={setView} />
				<div className="flex flex-col items-center justify-center py-12 px-4 text-center">
					<p className="text-lg text-muted-foreground mb-4">No products found</p>
					<p className="text-sm text-muted-foreground mb-6">Try adjusting your search or filters to find what you're looking for.</p>
					<Link prefetch={true} href="/products" className="text-primary hover:underline">
						View all products
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full">
			<ProductsHeader title={collection.title} description={collection.description} count={collection.products.edges.length} view={view} onViewChange={setView} />
			<div className="px-4 py-6">
				<ProductList products={collection.products.edges.map(({ node }) => node)} view={view} />
			</div>
		</div>
	);
}
