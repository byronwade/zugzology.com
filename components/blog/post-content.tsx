"use client";

import Image from "next/image";
import type { Article } from "@/lib/types/shopify";

export function PostContent({ post }: { post: Article }) {
	if (!post) {
		return null;
	}

	const publishedDate = new Date(post.publishedAt);
	const formattedDate = publishedDate.toLocaleDateString(undefined, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	return (
		<article className="prose prose-lg mx-auto">
			{post.image && (
				<div className="relative aspect-[16/9] mb-8">
					<Image src={post.image.url} alt={post.image.altText || post.title} fill className="object-cover rounded-lg" priority />
				</div>
			)}
			<h1>{post.title}</h1>
			<div className="text-sm text-gray-500 mb-8">
				By {post.author.name} • {formattedDate}
			</div>
			<div className="mt-6" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
		</article>
	);
}
