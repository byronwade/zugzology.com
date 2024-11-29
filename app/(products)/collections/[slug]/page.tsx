"use client";

import { Suspense } from "react";
import { getCollection } from "@/lib/actions/shopify";
import { notFound } from "next/navigation";
import FilterSidebar from "@/components/ui/filter-sidebar";
import ProductList from "@/components/ui/product-list";
import type { ShopifyCollection } from "@/lib/types";

export default async function CollectionPage({ params }: { params: { slug: string } }) {
	const collection = await getCollection(params.slug);

	if (!collection) {
		notFound();
	}

	return (
		<div className="container mx-auto px-4">
			<div className="py-8">
				<h1 className="text-3xl font-bold mb-4">{collection.title}</h1>
				{collection.description && <p className="text-muted-foreground mb-6">{collection.description}</p>}
				<div className="flex gap-8">
					<FilterSidebar />
					<Suspense fallback={<div>Loading products...</div>}>
						<ProductList products={collection.products || []} />
					</Suspense>
				</div>
			</div>
		</div>
	);
}
