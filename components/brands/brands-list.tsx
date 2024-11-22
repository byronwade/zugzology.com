import { type Brand } from "@/lib/types/shopify";
import { BrandCard } from "./brand-card";

interface BrandsListProps {
	brands: Brand[];
	priority?: boolean;
}

export function BrandsList({ brands, priority }: BrandsListProps) {
	if (!brands?.length) {
		return (
			<div className="text-center py-8">
				<p>No brands found</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
			{brands.map((brand) => (
				<BrandCard key={brand.id} brand={brand} priority={priority} />
			))}
		</div>
	);
}
