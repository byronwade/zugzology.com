import { type Product } from "@/lib/types/shopify";
import { ProductCard } from "./product-card";

interface ProductsListProps {
	products: Product[];
	priority?: boolean;
}

export function ProductsList({ products, priority }: ProductsListProps) {
	if (!products?.length) {
		return (
			<div className="text-center py-8">
				<p>No products found</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
			{products.map((product) => (
				<ProductCard key={product.id} product={product} priority={priority} />
			))}
		</div>
	);
}
