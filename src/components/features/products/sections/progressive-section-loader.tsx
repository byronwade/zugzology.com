import { Suspense } from "react";
import type { ProductSection } from "@/lib/api/shopify/product-sections";
import {
	getBestSellers,
	getCollectionProducts,
	getFeaturedCollections,
	getLatestProducts,
	getRandomProducts,
	getSaleProducts,
	getSameCategoryProducts,
	getSimilarTagProducts,
} from "@/lib/api/shopify/product-sections";
import type { ShopifyProduct } from "@/lib/types";
import { ProductSectionsRenderer } from "./product-sections-renderer";

type SectionLoaderProps = {
	product: ShopifyProduct;
	relatedProducts: ShopifyProduct[];
	sectionType:
		| "related"
		| "best-sellers"
		| "sale"
		| "latest"
		| "category"
		| "collection"
		| "featured-collections"
		| "similar-tags"
		| "random";
	priority: number;
};

// Individual section loader - fetches its own data
async function SectionContent({ product, relatedProducts, sectionType, priority }: SectionLoaderProps) {
	let section: ProductSection | null = null;

	const productCollection = product.collections?.edges?.[0]?.node?.handle || "";

	try {
		switch (sectionType) {
			case "related":
				if (relatedProducts?.length > 0) {
					section = {
						id: "related-products",
						title: "You May Also Like",
						description: "Products similar to this one",
						products: relatedProducts,
						type: "products",
						priority,
					};
				}
				break;

			case "best-sellers": {
				const products = await getBestSellers(8);
				if (products.length > 0) {
					section = {
						id: "best-sellers",
						title: "Best Sellers",
						description: "Our most popular products",
						products,
						type: "products",
						priority,
					};
				}
				break;
			}

			case "sale": {
				const products = await getSaleProducts(8);
				if (products.length > 0) {
					section = {
						id: "sale-products",
						title: "On Sale Now",
						description: "Limited time offers",
						products,
						type: "products",
						priority,
					};
				}
				break;
			}

			case "latest": {
				const products = await getLatestProducts(8);
				if (products.length > 0) {
					section = {
						id: "latest-products",
						title: "New Arrivals",
						description: "Check out our newest products",
						products,
						type: "products",
						priority,
					};
				}
				break;
			}

			case "category": {
				const products = await getSameCategoryProducts(product.productType || "", product.id, 8);
				if (products.length > 0) {
					section = {
						id: "same-category",
						title: `More ${product.productType}`,
						description: `Explore other ${product.productType} products`,
						products,
						type: "products",
						priority,
					};
				}
				break;
			}

			case "collection": {
				const products = await getCollectionProducts(productCollection, product.id, 8);
				if (products.length > 0) {
					section = {
						id: "collection-products",
						title: "From This Collection",
						description: "More products from the same collection",
						products,
						type: "products",
						priority,
					};
				}
				break;
			}

			case "featured-collections": {
				const collections = await getFeaturedCollections(4);
				if (collections.length > 0) {
					section = {
						id: "featured-collections",
						title: "Shop by Category",
						description: "Explore our collections",
						collections,
						type: "collections",
						priority,
					};
				}
				break;
			}

			case "similar-tags": {
				const products = await getSimilarTagProducts(product.tags || [], product.id, 8);
				if (products.length > 0) {
					section = {
						id: "similar-tags",
						title: "Similar Products",
						description: "Products with similar features",
						products,
						type: "products",
						priority,
					};
				}
				break;
			}

			case "random": {
				const products = await getRandomProducts(product.id, 8);
				if (products.length > 0) {
					section = {
						id: "random-products",
						title: "You Might Also Like",
						description: "Discover more products",
						products,
						type: "products",
						priority,
					};
				}
				break;
			}
		}
	} catch (_error) {
		return null;
	}

	if (!section) {
		return null;
	}

	return <ProductSectionsRenderer currentProductId={product.id} sections={[section]} />;
}

// Progressive section loader with independent Suspense boundaries
export function ProgressiveSectionLoader({ product, relatedProducts, sectionType, priority }: SectionLoaderProps) {
	return (
		<Suspense fallback={null}>
			<SectionContent
				priority={priority}
				product={product}
				relatedProducts={relatedProducts}
				sectionType={sectionType}
			/>
		</Suspense>
	);
}
