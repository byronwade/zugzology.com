"use client";

import Image from "next/image";
import Link from "next/link";
import { type Collection } from "@/lib/types/shopify";
import { shimmer, toBase64 } from "@/lib/utils";

interface CategoryCardProps {
	category: Collection;
	priority?: boolean;
}

export function CategoryCard({ category, priority }: CategoryCardProps) {
	return (
		<Link href={`/categories/${category.handle}` as `/categories/${string}`} className="group block">
			<div className="border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
				{category.image && (
					<div className="relative aspect-[16/9]">
						<Image src={category.image.transformedSrc || category.image.url} alt={category.image.altText || category.title} fill className="object-cover transform group-hover:scale-105 transition-transform duration-300" sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" quality={85} priority={priority} loading={priority ? "eager" : "lazy"} placeholder="blur" blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(800, 400))}`} />
					</div>
				)}
				<div className="p-4">
					<h2 className="text-xl font-semibold group-hover:text-blue-600 transition-colors">{category.title}</h2>
					{category.description && <p className="mt-2 text-gray-600 line-clamp-2">{category.description}</p>}
				</div>
			</div>
		</Link>
	);
}
