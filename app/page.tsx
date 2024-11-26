import { getProducts, getCollections } from "@/lib/actions/getTaxonomyData";
import { ProductsList } from "@/components/products/products-list";
import { Suspense } from "react";

export default async function Page() {
	const [products, collections] = await Promise.all([getProducts(), getCollections()]);

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-8">Our Products</h1>
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				<aside className="md:col-span-1">
					<nav className="space-y-4">
						<h2 className="font-semibold">Collections</h2>
						<ul className="space-y-2">
							{collections.map((collection) => (
								<li key={collection.id}>
									<a href={`/collections/${collection.handle}`} className="text-gray-600 hover:text-gray-900">
										{collection.title}
									</a>
								</li>
							))}
						</ul>
					</nav>
				</aside>
				<div className="md:col-span-3">
					<Suspense fallback={<div>Loading products...</div>}>
						<ProductsList initialProducts={products} />
					</Suspense>
				</div>
			</div>
		</div>
	);
}
