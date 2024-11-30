import React, { Suspense } from "react";
import { getCollection, getProducts } from "@/lib/actions/shopify";
import { notFound } from "next/navigation";
import { ErrorBoundary } from "@/components/error-boundary";
import { CollectionContentClient } from "@/components/collections/collection-content-client";

async function ProductsContent() {
	// Get both the "all" collection and direct products
	const [allCollection, allProducts] = await Promise.all([getCollection("all").catch(() => null), getProducts()]);

	// Create a virtual collection that combines both sources
	const virtualCollection = {
		id: "all",
		handle: "all",
		title: "All Products",
		description: "All available products",
		products: {
			edges: allProducts.map((product) => ({
				node: product,
			})),
		},
	};

	// Use the actual collection if available, otherwise use virtual collection
	const collection = allCollection || virtualCollection;

	return <CollectionContentClient collection={collection} />;
}

export default async function ProductsPage() {
	return (
		<div className="w-full px-4 py-8">
			<ErrorBoundary fallback={<div>Error loading products</div>}>
				<Suspense fallback={<div>Loading...</div>}>
					<ProductsContent />
				</Suspense>
			</ErrorBoundary>
		</div>
	);
}
