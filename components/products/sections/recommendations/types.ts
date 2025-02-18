import { ShopifyProduct } from "@/lib/types";

export type ProductSource = "history" | "recommended" | "related" | "trending" | "best-seller" | "new" | "sale" | "complementary" | "popular";

export interface ProductWithSource {
	product: ShopifyProduct;
	source: ProductSource;
	sectionId: string;
}

export interface RecommendationSection {
	id: string;
	title: string;
	description: string;
	priority: number;
	products: ProductWithSource[];
}
