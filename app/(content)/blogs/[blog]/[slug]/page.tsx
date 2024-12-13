"use cache";

import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getBlogByHandle } from "@/lib/actions/shopify";
import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export async function generateMetadata({ params }: { params: { blog: string; slug: string } }): Promise<Metadata> {
	const nextjs15Params = await params;
	const blog = await getBlogByHandle(nextjs15Params.blog);
	const article = blog?.articles.edges.find(({ node }) => node.handle === nextjs15Params.slug)?.node;

	if (!article) return notFound();

	const title = `${article.title} | Zugzology Blog`;
	const description = article.excerpt;

	return {
		title,
		description,
		keywords: `mushroom cultivation, ${article.title.toLowerCase()}, mushroom growing, research`,
		openGraph: {
			title,
			description,
			type: "article",
			url: `https://zugzology.com/blogs/${nextjs15Params.blog}/${nextjs15Params.slug}`,
			siteName: "Zugzology",
			locale: "en_US",
			authors: [article.author.name],
			publishedTime: article.publishedAt,
			modifiedTime: article.publishedAt,
			section: nextjs15Params.blog,
			images: article.image
				? [
						{
							url: article.image.url,
							width: article.image.width,
							height: article.image.height,
							alt: article.image.altText || article.title,
						},
				  ]
				: [],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: article.image ? [article.image.url] : [],
		},
		alternates: {
			canonical: `https://zugzology.com/blogs/${nextjs15Params.blog}/${nextjs15Params.slug}`,
		},
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				"max-video-preview": -1,
				"max-image-preview": "large",
				"max-snippet": -1,
			},
		},
	};
}

export default async function BlogPostPage({ params }: { params: { blog: string; slug: string } }) {
	const startTime = performance.now();
	const nextjs15Params = await params;
	const blog = await getBlogByHandle(nextjs15Params.blog);
	const article = blog?.articles.edges.find(({ node }) => node.handle === nextjs15Params.slug)?.node;

	if (!article || !article.contentHtml) {
		console.log(`❌ [Blog Post] Not found: ${params.blog}/${params.slug}`);
		return notFound();
	}

	const duration = performance.now() - startTime;
	console.log(`⚡ [Blog Post ${article.title}] ${duration.toFixed(2)}ms`, {
		hasImage: !!article.image,
		contentSize: (article.contentHtml.length / 1024).toFixed(2) + "KB",
	});

	const articleJsonLd = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		"@id": `https://zugzology.com/blogs/${nextjs15Params.blog}/${nextjs15Params.slug}`,
		headline: article.title,
		description: article.excerpt,
		articleBody: article.content,
		url: `https://zugzology.com/blogs/${nextjs15Params.blog}/${nextjs15Params.slug}`,
		datePublished: article.publishedAt,
		dateModified: article.publishedAt,
		author: {
			"@type": "Person",
			name: article.author.name,
		},
		publisher: {
			"@type": "Organization",
			name: "Zugzology",
			logo: {
				"@type": "ImageObject",
				url: "https://zugzology.com/logo.png",
			},
		},
		image: article.image
			? {
					"@type": "ImageObject",
					url: article.image.url,
					width: article.image.width,
					height: article.image.height,
					caption: article.image.altText,
			  }
			: undefined,
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": `https://zugzology.com/blogs/${nextjs15Params.blog}/${nextjs15Params.slug}`,
		},
		articleSection: nextjs15Params.blog,
		keywords: ["mushroom cultivation", "mushroom growing", "research", article.title.toLowerCase()],
	};

	return (
		<div className="container mx-auto px-4 py-16 max-w-4xl">
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
			<Link prefetch={true} href={`/blogs/${nextjs15Params.blog}`} className="inline-flex items-center text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 mb-8 transition-colors">
				<ArrowLeft className="mr-2 h-4 w-4" />
				Back to {nextjs15Params.blog} articles
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
							<Image src={article.image.url} alt={article.image.altText || article.title} fill className="object-cover" priority />
						</div>
					)}
				</Suspense>

				<div dangerouslySetInnerHTML={{ __html: article.contentHtml }} className="mt-8 prose-headings:font-semibold prose-a:text-purple-600 dark:prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline" />
			</article>
		</div>
	);
}
