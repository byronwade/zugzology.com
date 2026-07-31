import { ProductCard } from "@/components/features/products/product-card";
import { SectionHeading } from "@/components/sections/section-heading";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import type { ShopifyProduct } from "@/lib/types";

type BestSellersShowcaseProps = {
	products: ShopifyProduct[];
};

/** Ranks are zero-padded so the column of numerals stays optically even. */
function formatRank(index: number): string {
	return String(index + 1).padStart(2, "0");
}

export function BestSellersShowcase({ products }: BestSellersShowcaseProps) {
	if (!products?.length) {
		return null;
	}

	const ranked = products.slice(0, 5);

	return (
		<section className="lit relative w-full overflow-hidden border-border border-y bg-muted/40">
			<div className="container relative mx-auto px-4 py-16 sm:py-20 md:px-6">
				<SectionHeading
					align="center"
					eyebrow="Ranked by units sold"
					subtitle="Our most popular products, trusted by thousands of cultivators"
					title="Best sellers"
				/>

				{/* Mobile: list view. The rank is real ordering, so it leads each row. */}
				<div className="flex flex-col sm:hidden">
					{ranked.map((product, index) => (
						<div className="relative flex gap-3" key={product.id}>
							<span className="display-wide pt-4 font-display font-semibold text-2xl text-flush/70 tabular-nums leading-none">
								{formatRank(index)}
							</span>
							<div className="min-w-0 flex-1">
								<ProductCard
									product={product}
									quantity={product.variants.nodes[0]?.quantityAvailable}
									variantId={product.variants.nodes[0]?.id}
									view="list"
								/>
							</div>
						</div>
					))}
				</div>

				{/* Desktop: grid view */}
				<div className="hidden gap-6 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
					{ranked.map((product, index) => (
						<div className="group relative" key={product.id}>
							{/* The rank rides the frame edge, half off the card, like a slate number. */}
							<span className="-top-3 -left-1 display-wide pointer-events-none absolute z-20 font-display font-semibold text-[2.75rem] text-flush tabular-nums leading-none drop-shadow-[0_2px_10px_hsl(var(--cast)/0.75)]">
								{formatRank(index)}
							</span>
							<ProductCard
								product={product}
								quantity={product.variants.nodes[0]?.quantityAvailable}
								variantId={product.variants.nodes[0]?.id}
								view="grid"
							/>
						</div>
					))}
				</div>

				<div className="mt-12 flex justify-center">
					<Button asChild size="lg">
						<Link href="/collections/best-sellers">View all best sellers</Link>
					</Button>
				</div>
			</div>
		</section>
	);
}
