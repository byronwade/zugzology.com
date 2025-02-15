import { ShopifyProduct } from "@/lib/types";

export type ProductSource = "history" | "recommended" | "complementary" | "trending" | "popular" | "related";

export type ProductWithSource = {
	product: ShopifyProduct;
	source: ProductSource;
	sectionId: string;
};

export interface RecommendationSection {
	id: string;
	title: string;
	description: string;
	priority: number;
	products: ProductWithSource[];
}
