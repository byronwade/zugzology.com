import { type Collection } from "@/lib/types/shopify";
import { CategoryCard } from "./category-card";

interface CategoriesListProps {
	categories: Collection[];
	priority?: boolean;
}

export function CategoriesList({ categories, priority }: CategoriesListProps) {
	if (!categories?.length) {
		return (
			<div className="text-center py-8">
				<p>No categories found</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
			{categories.map((category) => (
				<CategoryCard key={category.id} category={category} priority={priority} />
			))}
		</div>
	);
}
