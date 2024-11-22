"use client";

import Image from "next/image";
import type { Article } from "@/lib/types/shopify";

export function PostContent({ post }: { post: Article }) {
	return (
		<article className="prose prose-lg dark:prose-invert mx-auto">
			{post.image && (
				<div className="relative aspect-[21/9] mb-8 rounded-lg overflow-hidden">
					<Image src={post.image.url} alt={post.image.altText || post.title} fill className="object-cover" priority sizes="(min-width: 1024px) 1000px, 100vw" />
				</div>
			)}
			<h1 className="text-4xl font-bold mb-4">{post.title}</h1>
			<div className="flex items-center text-gray-600 mb-8">
				<span>By {post.author.name}</span>
				<span className="mx-2">•</span>
				<time dateTime={post.publishedAt}>{new Date(post.publishedAt).toLocaleDateString()}</time>
			</div>
			<div className="mt-8" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
		</article>
	);
}
