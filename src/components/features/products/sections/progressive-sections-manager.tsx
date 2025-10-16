import type { ShopifyProduct } from "@/lib/types";
import { ProgressiveSectionLoader } from "./progressive-section-loader";

type ProgressiveSectionsManagerProps = {
	product: ShopifyProduct;
	relatedProducts: ShopifyProduct[];
};

/**
 * Progressive sections manager
 * Each section loads independently with its own Suspense boundary
 * Sections stream in as data becomes available, improving perceived performance
 */
export function ProgressiveSectionsManager({ product, relatedProducts }: ProgressiveSectionsManagerProps) {
	// Define section order by priority
	// Each section will fetch its own data and stream in independently
	const sectionConfigs = [
		{ type: "related" as const, priority: 1 },
		{ type: "best-sellers" as const, priority: 2 },
		{ type: "sale" as const, priority: 3 },
		{ type: "latest" as const, priority: 4 },
		{ type: "category" as const, priority: 5 },
		{ type: "collection" as const, priority: 6 },
		{ type: "featured-collections" as const, priority: 7 },
		{ type: "similar-tags" as const, priority: 8 },
		{ type: "random" as const, priority: 9 },
	];

	return (
		<div className="space-y-0">
			{sectionConfigs.map((config) => (
				<ProgressiveSectionLoader
					key={config.type}
					priority={config.priority}
					product={product}
					relatedProducts={relatedProducts}
					sectionType={config.type}
				/>
			))}
		</div>
	);
}
