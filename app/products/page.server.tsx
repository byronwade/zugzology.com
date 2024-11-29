import { Suspense } from "react";
import { getProducts } from "@/lib/actions/shopify";
import ProductsPage from "./page";
import type { ShopifyProduct } from "@/lib/types";

async function ProductsContent() {
	const products = await getProducts();
	return <ProductsPage initialProducts={products} />;
}

export default function ProductsServerPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ProductsContent />
		</Suspense>
	);
}
