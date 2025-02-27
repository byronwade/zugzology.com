import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getBlogByHandle, getAllBlogPosts, getProducts } from "@/lib/actions/shopify";
import { ArrowLeft, CalendarDays, Clock, Percent, ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { RelatedPosts } from "@/components/blog/related-posts";
import { findRelatedPosts } from "@/lib/utils/related-posts";
import { ProductAd } from "@/components/blog/product-ad";
import { BlogBreadcrumb } from "@/components/blog/blog-breadcrumb";
import { ProductRecommendations } from "@/components/products/sections/recommendations/product-recommendations";
import { AdPlaceholder } from "@/components/ads/ad-placeholder";
import { BlogQuickActions } from "@/components/blog/blog-quick-actions";
import { BlogTableOfContents } from "@/components/blog/blog-table-of-contents";
import { BlogPostClient } from "@/components/blog/blog-post-client";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { jsonLdScriptProps } from "react-schemaorg";
import { BlogPosting, BreadcrumbList, WithContext } from "schema-dts";
import type { ShopifyBlogArticle, ShopifyImage, ShopifyBlog } from "@/lib/types";

interface BlogArticleAuthor {
	name: string;
	email?: string;
}

interface ExtendedShopifyBlogArticle extends Omit<ShopifyBlogArticle, "image" | "articles"> {
	author: BlogArticleAuthor;
	image?: ShopifyImage;
	tags?: string[];
	updatedAt?: string;
	content: string;
	excerpt?: string;
	handle: string;
}

interface BlogPostPageProps {
	params: Promise<{
		blog: string;
		slug: string;
	}>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
	const nextParams = await params;
	const blog = await getBlogByHandle(nextParams.blog);
	const article = (await getArticleByHandle(nextParams.blog, nextParams.slug)) as ExtendedShopifyBlogArticle;

	if (!blog || !article) {
		return {
			title: "Article Not Found",
			description: "The requested article could not be found.",
			robots: { index: false, follow: true },
		};
	}

	const title = article.title;
	const description = article.excerpt || `Read about ${article.title} in our ${blog.title} blog. Expert insights and detailed information about mushroom cultivation.`;
	const url = `https://zugzology.com/blogs/${blog.handle}/${article.handle}`;
	const publishDate = new Date(article.publishedAt);
	const modifyDate = article.updatedAt ? new Date(article.updatedAt) : publishDate;

	return {
		title,
		description,
		authors: [{ name: article.author.name }],
		publisher: "Zugzology",
		alternates: {
			canonical: url,
		},
		openGraph: {
			title,
			description,
			type: "article",
			url,
			publishedTime: publishDate.toISOString(),
			modifiedTime: modifyDate.toISOString(),
			authors: [article.author.name],
			tags: article.tags,
			images: article.image
				? [
						{
							url: article.image.url,
							width: article.image.width,
							height: article.image.height,
							alt: article.image.altText,
						},
				  ]
				: undefined,
			siteName: "Zugzology",
			locale: "en_US",
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: article.image ? [article.image.url] : undefined,
			creator: "@zugzology",
			site: "@zugzology",
		},
		other: {
			"article:published_time": publishDate.toISOString(),
			"article:modified_time": modifyDate.toISOString(),
			"article:author": article.author.name,
			"article:section": blog.title,
			"article:tag": article.tags ? article.tags.join(",") : "",
		},
	};
}

// Helper function to get article by handle with proper typing
async function getArticleByHandle(blogHandle: string, articleHandle: string): Promise<ExtendedShopifyBlogArticle | undefined> {
	const blog = await getBlogByHandle(blogHandle);
	if (!blog) return undefined;

	// Transform the articles array into the expected structure
	const articles = blog.articles.map((article) => ({
		...article,
		author: article.author || { name: "Anonymous" },
		content: article.contentHtml || article.content || "",
	})) as ExtendedShopifyBlogArticle[];

	return articles.find((article) => article.handle === articleHandle);
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
	const nextParams = await params;
	const blog = await getBlogByHandle(nextParams.blog);
	const article = (await getArticleByHandle(nextParams.blog, nextParams.slug)) as ExtendedShopifyBlogArticle;

	if (!blog || !article) {
		notFound();
	}

	// Get related posts
	const allPosts = await getAllBlogPosts();
	const currentPostWithBlog = {
		...article,
		blogHandle: nextParams.blog,
		blogTitle: blog.title,
	};
	const relatedPosts = findRelatedPosts(currentPostWithBlog, allPosts, 3);

	// Get featured products
	const featuredProducts = await getProducts();

	// Calculate reading time
	const wordsPerMinute = 200;
	const wordCount = article.content.split(/\s+/).length;
	const readingTime = Math.ceil(wordCount / wordsPerMinute);

	// Generate structured data for SEO
	const articleStructuredData: WithContext<BlogPosting> = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: article.title,
		description: article.excerpt || "",
		image: article.image ? [article.image.url] : [],
		datePublished: article.publishedAt,
		dateModified: article.updatedAt || article.publishedAt,
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
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": `https://zugzology.com/blogs/${nextParams.blog}/${nextParams.slug}`,
		},
	};

	const breadcrumbStructuredData: WithContext<BreadcrumbList> = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{
				"@type": "ListItem",
				position: 1,
				name: "Home",
				item: "https://zugzology.com",
			},
			{
				"@type": "ListItem",
				position: 2,
				name: "Blogs",
				item: "https://zugzology.com/blogs",
			},
			{
				"@type": "ListItem",
				position: 3,
				name: blog.title,
				item: `https://zugzology.com/blogs/${nextParams.blog}`,
			},
			{
				"@type": "ListItem",
				position: 4,
				name: article.title,
				item: `https://zugzology.com/blogs/${nextParams.blog}/${nextParams.slug}`,
			},
		],
	};

	return (
		<>
			<script {...jsonLdScriptProps(articleStructuredData)} />
			<script {...jsonLdScriptProps(breadcrumbStructuredData)} />
			{/* Main Article Section with Sidebar */}
			<section className="w-full min-h-screen">
				<div className="w-full px-4 sm:px-6 lg:px-8 py-8">
					<BlogPostClient featuredProducts={featuredProducts}>
						<article>
							<h1 className="mb-4 text-5xl font-black text-gray-900 dark:text-gray-100 sm:text-5xl">{article.title}</h1>

							<div className="not-prose">
								<div className="flex items-center whitespace-nowrap overflow-x-auto scrollbar-hide">
									<BlogBreadcrumb blogHandle={nextParams.blog} blogTitle={blog.title} articleTitle={article.title} />
								</div>
							</div>

							{/* Author Info and Article Meta */}
							<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mb-8 text-sm">
								<div className="flex items-center gap-3">
									<div className="h-8 w-8 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500">
										{article.author.email ? (
											<Image src={`https://gravatar.com/avatar/${article.author.email}?s=96&d=mp`} alt={article.author.name} width={32} height={32} className="h-full w-full object-cover" />
										) : (
											<div className="h-full w-full flex items-center justify-center">
												<span className="text-sm font-medium text-white">
													{article.author.name
														.split(" ")
														.map((name) => name[0])
														.join("")}
												</span>
											</div>
										)}
									</div>
									<span className="font-medium text-gray-900 dark:text-gray-100">{article.author.name}</span>
								</div>
								<div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
									<time dateTime={article.publishedAt} className="tabular-nums">
										{new Date(article.publishedAt).toLocaleDateString("en-US", {
											year: "numeric",
											month: "long",
											day: "numeric",
										})}
									</time>
									<span>·</span>
									<span className="tabular-nums">{readingTime} min read</span>
								</div>
							</div>

							{/* Quick Actions */}
							<div className="not-prose mb-8">
								<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
									<BlogQuickActions title={article.title} url={`https://zugzology.com/blogs/${nextParams.blog}/${nextParams.slug}`} content={article.contentHtml} image={article.image} />
								</div>
							</div>

							{article.image && (
								<div className="not-prose mb-8">
									<div className="aspect-[16/9] relative overflow-hidden rounded-lg">
										<Image src={article.image.url} alt={article.image.altText || article.title} width={article.image.width} height={article.image.height} className="object-cover rounded-lg" priority />
									</div>
								</div>
							)}

							{/* Table of Contents */}
							<div className="w-full space-y-2 mb-8">
								<div className="border rounded-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
									<BlogTableOfContents contentHtml={article.contentHtml} />
								</div>
							</div>

							{/* Article Content */}
							<div className="prose prose-neutral dark:prose-invert lg:prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: article.contentHtml }} />
						</article>

						{/* Related Posts */}
						{relatedPosts.length > 0 && (
							<div className="mt-16">
								<h2 className="text-2xl font-bold mb-6">Related Articles</h2>
								<RelatedPosts currentPost={currentPostWithBlog} relatedPosts={relatedPosts} blogHandle={nextParams.blog} />
							</div>
						)}
					</BlogPostClient>
				</div>
			</section>
		</>
	);
}
