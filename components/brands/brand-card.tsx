"use client";

import Image from "next/image";
import Link from "next/link";
import { type Brand } from "@/lib/types/shopify";
import { shimmer, toBase64 } from "@/lib/utils";

interface BrandCardProps {
	brand: Brand;
	priority?: boolean;
}

export function BrandCard({ brand, priority }: BrandCardProps) {
	return (
		<Link prefretch={true} href={`/brands/${brand.handle}` as `/brands/${string}`} className="group block">
			<div className="border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
				{brand.image && (
					<div className="relative aspect-[16/9]">
						<Image src={brand.image.transformedSrc || brand.image.url} alt={brand.image.altText || brand.title} fill className="object-cover transform group-hover:scale-105 transition-transform duration-300" sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" quality={85} priority={priority} loading={priority ? "eager" : "lazy"} placeholder="blur" blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(800, 400))}`} />
					</div>
				)}
				<div className="p-4">
					<h2 className="text-xl font-semibold group-hover:text-blue-600 transition-colors">{brand.title}</h2>
					{brand.description && <p className="mt-2 text-gray-600 line-clamp-2">{brand.description}</p>}
				</div>
			</div>
		</Link>
	);
}
