"use client";

import Image from "next/image";
import { Link } from "@/components/ui/link";
import type { ShopifyBlogArticle } from "@/lib/types";

type BlogSearchResultsProps = {
	posts: ShopifyBlogArticle[];
	searchQuery?: string;
};

export function BlogSearchResults({ posts, searchQuery }: BlogSearchResultsProps) {
	if (posts.length === 0) {
		return null;
	}

	return (
		<section className="w-full border-t py-12">
			<div className="mx-auto w-full px-4">
				<div className="mb-8">
					<h2 className="font-bold text-2xl text-neutral-900 dark:text-neutral-100">
						{searchQuery ? `Blog Posts matching "${searchQuery}"` : "Latest Blog Posts"}
					</h2>
					<p className="mt-2 text-muted-foreground">
						{searchQuery
							? `Found ${posts.length} article${posts.length === 1 ? "" : "s"} matching your search`
							: "Browse our latest articles and guides"}
					</p>
				</div>

				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
					{posts.map((post) => (
						<Link className="group" href={`/blogs/${post.blogHandle}/${post.handle}`} key={post.id}>
							<article className="space-y-4">
								<div className="not-prose">
									<div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-foreground/10 transition-transform hover:border-foreground/20 group-hover:scale-[1.02]">
										{post.image ? (
											<Image
												alt={post.image.altText || post.title}
												className="rounded-xl object-cover"
												fill
												sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
												src={post.image.url}
											/>
										) : (
											<div className="absolute inset-0 flex items-center justify-center bg-neutral-100 p-4 text-center dark:bg-neutral-800">
												<div className="space-y-2">
													<p className="font-medium text-neutral-500 text-sm dark:text-neutral-400">
														🍄 A Mushroom Pic
													</p>
													<p className="text-neutral-400 text-xs dark:text-neutral-500">Still Growing...</p>
												</div>
											</div>
										)}
									</div>
								</div>
								<div className="space-y-2">
									<div className="space-y-1">
										<p className="font-medium text-primary text-sm">{post.blogTitle}</p>
										<h3 className="font-semibold text-lg text-neutral-900 transition-colors group-hover:text-primary dark:text-neutral-100">
											{post.title}
										</h3>
									</div>
									<p className="line-clamp-2 text-neutral-600 text-sm dark:text-neutral-400">{post.excerpt}</p>
									<div className="flex items-center gap-2 text-neutral-500 text-sm dark:text-neutral-400">
										<span>{post.author.name}</span>
										<span>•</span>
										<time dateTime={post.publishedAt}>
											{new Date(post.publishedAt).toLocaleDateString("en-US", {
												year: "numeric",
												month: "long",
												day: "numeric",
											})}
										</time>
									</div>
								</div>
							</article>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
