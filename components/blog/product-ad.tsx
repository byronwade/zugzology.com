import Link from "next/link";
import Image from "next/image";
import type { ShopifyProduct } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

interface ProductAdProps {
	products: ShopifyProduct[];
}

export function ProductAd({ products }: ProductAdProps) {
	if (!products.length) return null;

	return (
		<aside className="w-full lg:w-80 xl:w-96 flex-shrink-0">
			<div className="sticky top-[120px] bg-white dark:bg-neutral-900 rounded-xl border dark:border-neutral-800 p-6">
				<h2 className="text-lg font-semibold mb-6 text-neutral-900 dark:text-neutral-100">Featured Products</h2>
				<div className="space-y-6">
					{products.map((product) => {
						const firstImage = product.images.edges[0]?.node;
						const firstVariant = product.variants.edges[0]?.node;
						const price = firstVariant?.price;

						return (
							<Link key={product.id} href={`/products/${product.handle}`} className="group flex gap-4 items-start">
								{firstImage && (
									<div className="relative w-20 h-20 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
										<div className="w-full h-full rounded-lg overflow-hidden">
											<Image src={firstImage.url} alt={firstImage.altText || product.title} fill className="object-cover transition-transform group-hover:scale-105 rounded-lg" sizes="80px" />
										</div>
									</div>
								)}
								<div className="flex-1 min-w-0">
									<h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">{product.title}</h3>
									{price && <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{formatPrice(parseFloat(price.amount), price.currencyCode)}</p>}
								</div>
							</Link>
						);
					})}
				</div>
				<Link href="/products" className="inline-block w-full text-center mt-6 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium">
					View All Products →
				</Link>
			</div>
		</aside>
	);
}
