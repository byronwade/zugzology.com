import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getBlogByHandle } from "@/lib/actions/shopify";
import type { ShopifyBlogArticle } from "@/lib/types";
import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { blog: string; slug: string } }): Promise<Metadata> {
	const blog = await getBlogByHandle(params.blog);
	const article = blog?.articles.edges.find(({ node }) => node.handle === params.slug)?.node;

	if (!article) return notFound();

	return {
		title: `${article.title} | Zugzology Blog`,
		description: article.excerpt,
		openGraph: {
			title: article.title,
			description: article.excerpt,
			type: "article",
			authors: [article.author.name],
			publishedTime: article.publishedAt,
			images: article.image
				? [
						{
							url: article.image.url,
							width: article.image.width,
							height: article.image.height,
							alt: article.image.altText,
						},
				  ]
				: [],
		},
	};
}

export default async function BlogPostPage({ params }: { params: { blog: string; slug: string } }) {
	const nextjs15 = await params;
	const blog = await getBlogByHandle(nextjs15.blog);
	const article = blog?.articles.edges.find(({ node }) => node.handle === nextjs15.slug)?.node;

	if (!article) {
		return notFound();
	}

	return (
		<div className="container mx-auto px-4 py-16 max-w-4xl">
			<Link prefetch={true} href={`/blogs/${nextjs15.blog}`} className="inline-flex items-center text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 mb-8 transition-colors">
				<ArrowLeft className="mr-2 h-4 w-4" />
				Back to {nextjs15.blog} articles
			</Link>

			<article className="prose prose-lg dark:prose-invert mx-auto">
				<h1 className="text-4xl font-bold mb-6">{article.title}</h1>

				<div className="flex items-center space-x-4 mb-8">
					<Avatar>
						<AvatarImage src={`https://ui-avatars.com/api/?name=${article.author.name}`} />
						<AvatarFallback>{article.author.name.charAt(0)}</AvatarFallback>
					</Avatar>
					<div>
						<p className="font-medium">{article.author.name}</p>
						<p className="text-sm text-neutral-500">
							{new Date(article.publishedAt).toLocaleDateString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</p>
					</div>
				</div>

				<Suspense fallback={<Skeleton className="w-full aspect-video rounded-lg" />}>
					{article.image && (
						<div className="mb-8 aspect-video relative overflow-hidden rounded-lg">
							<Image src={article.image.url} alt={article.image.altText || article.title} fill className="object-cover" />
						</div>
					)}
				</Suspense>

				<div dangerouslySetInnerHTML={{ __html: article.contentHtml }} className="mt-8 prose-headings:font-semibold prose-a:text-purple-600 dark:prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline" />
			</article>
		</div>
	);
}
