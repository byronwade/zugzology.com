"use client";

import Image from "next/image";
import Link from "next/link";
import { type Article } from "@/lib/types/shopify";

export function MyceliumsGambitPostCard({ post }: { post: Article }) {
	if (!post) return null;

	const postUrl = `/myceliums-gambit/${post.handle}` as const;

	return (
		<Link prefetch={true} href={postUrl} className="group block">
			<div className="border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
				{post.image && (
					<div className="relative aspect-[16/9]">
						<Image src={post.image.url} alt={post.image.altText || post.title} fill className="object-cover transform group-hover:scale-105 transition-transform duration-300" sizes="(min-width: 768px) 33vw, 100vw" loading="lazy" quality={85} />
					</div>
				)}
				<div className="p-4">
					<h2 className="text-xl font-semibold group-hover:text-blue-600 transition-colors">{post.title}</h2>
					<p className="text-sm text-gray-500 mt-1">
						By {post.author.name} • {new Date(post.publishedAt).toLocaleDateString()}
					</p>
					{post.excerpt && <p className="mt-2 text-gray-600 line-clamp-2">{post.excerpt}</p>}
				</div>
			</div>
		</Link>
	);
}
