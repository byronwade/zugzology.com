"use client";

import React, { useState, useEffect } from "react";
import type { ShopifyCollection, ShopifyProduct } from "@/lib/types";
import { ProductsContent } from "@/components/products/products-content";

interface CollectionContentClientProps {
	collection: ShopifyCollection & {
		products: {
			nodes: ShopifyProduct[];
		};
	};
}

export function CollectionContentClient({ collection }: CollectionContentClientProps) {
	const [currentSort, setCurrentSort] = useState("featured");

	// Always call all hooks, even if we return early
	// This ensures consistent hook calls between renders
	useEffect(() => {
		// Track collection view
		if (collection?.handle) {
			// Analytics tracking could go here
		}
	}, [collection?.handle]);

	// Handle the case where collection might be null or undefined
	if (!collection) {
		return (
			<div className="min-h-[400px] flex items-center justify-center">
				<p className="text-muted-foreground">Collection not found</p>
			</div>
		);
	}

	return <ProductsContent products={collection.products.nodes} title={collection.title} description={collection.description || undefined} defaultSort={currentSort} totalProducts={collection.products.nodes.length} />;
}
