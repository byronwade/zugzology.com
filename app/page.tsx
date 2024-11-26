"use client";

import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getAllProducts } from "@/lib/actions/getTaxonomyData";
import { ProductsList } from "@/components/products/products-list";
import { ProductListLayout } from "@/components/layouts/product-list-layout";
import type { Product } from "@/lib/types/shopify";

export const runtime = "edge";
export const preferredRegion = "auto";
export const revalidate = 0;

// Cache featured products query
const getFeaturedProducts = unstable_cache(
	async (): Promise<Product[]> => {
		const products = await getAllProducts();
		return products.slice(0, 6); // Return first 6 products
	},
	["featured-products"],
	{ revalidate: 3600 } // Cache for 1 hour
);

function FeaturedProducts({ products }: { products: Product[] }) {
	return (
		<ProductListLayout
			filters={{
				categories: ["Mushrooms", "Spores", "Equipment", "Supplies"],
				brands: ["Zugzology", "Other Brands"],
			}}
			header={{
				title: "Featured Products",
				description: "Check out our most popular items",
			}}
		>
			<ProductsList products={products} />
		</ProductListLayout>
	);
}

export default async function Home() {
	const products = await getFeaturedProducts();

	return (
		<main>
			<Suspense fallback={<LoadingSpinner />}>
				<FeaturedProducts products={products} />
			</Suspense>
		</main>
	);
}
