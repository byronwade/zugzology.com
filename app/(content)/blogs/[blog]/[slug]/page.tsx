"use cache";

import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getBlogByHandle, getAllBlogPosts, getProducts } from "@/lib/api/shopify/actions";
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
import { BlogShareToolbar } from "@/components/blog/blog-share-toolbar";
import { BlogShareToolbarHorizontal } from "@/components/blog/blog-share-toolbar-horizontal";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { jsonLdScriptProps } from "react-schemaorg";
import { BlogPosting, BreadcrumbList, WithContext } from "schema-dts";
import type { ShopifyBlogArticle, ShopifyImage, ShopifyBlog, ShopifyProduct } from "@/lib/types";
import { ProductSection } from "@/components/products/sections/product-section";
import { ProductSource } from "@/components/products/sections/recommendations/types";
import { FrequentlyBoughtTogether } from "@/components/products/sections/frequently-bought-together";
import { RecentPosts } from "@/components/blog/recent-posts";

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

	// Check if blog handle is undefined
	if (!nextParams.blog || nextParams.blog === "undefined") {
		return {
			title: "Blog Not Found",
			description: "The requested blog could not be found.",
			robots: { index: false, follow: true },
		};
	}

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
	const description =
		article.excerpt ||
		`Read about ${article.title} in our ${blog.title} blog. Expert insights and detailed information about mushroom cultivation.`;
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

// Helper function to get article by handle with proper typing - Add caching
async function getArticleByHandle(
	blogHandle: string,
	articleHandle: string
): Promise<ExtendedShopifyBlogArticle | undefined> {
	// Check if blog handle is undefined
	if (!blogHandle || blogHandle === "undefined") {
		console.error("Blog handle is undefined or invalid");
		return undefined;
	}

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

// Add a modified version of FrequentlyBoughtTogether that accepts custom title and description
function BlogProductRecommendations({
	complementaryProducts,
	title = "Products Related to This Article",
	description = "These products are perfect companions for the techniques discussed in this article",
}: {
	complementaryProducts: ShopifyProduct[];
	title?: string;
	description?: string;
}) {
	// Skip if no products
	if (!complementaryProducts.length) return null;

	// Get first product as "main" if we need a placeholder
	const mainProduct = complementaryProducts[0];

	return <FrequentlyBoughtTogether mainProduct={mainProduct} complementaryProducts={complementaryProducts.slice(1)} />;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
	const nextParams = await params;

	// Check if blog handle is undefined
	if (!nextParams.blog || nextParams.blog === "undefined") {
		console.error("Blog not found: undefined");
		notFound();
	}

	const blog = await getBlogByHandle(nextParams.blog);
	const article = (await getArticleByHandle(nextParams.blog, nextParams.slug)) as ExtendedShopifyBlogArticle;

	if (!blog || !article) {
		notFound();
	}

	// Get related posts - optimize with a smaller fetch
	const allPosts = await getAllBlogPosts();

	// Add blogHandle to all posts if it's missing
	const postsWithBlogHandles = allPosts.map((post) => ({
		...post,
		blogHandle: post.blog?.handle || nextParams.blog || "news", // Use post's blog handle, current blog handle, or default to "news"
		blogTitle: post.blog?.title || blog.title,
	}));

	const currentPostWithBlog = {
		...article,
		blogHandle: nextParams.blog,
		blogTitle: blog.title,
	};

	const relatedPosts = findRelatedPosts(currentPostWithBlog, postsWithBlogHandles, 3);

	// Get featured products - Get more products for additional sections
	const allProducts = await getProducts();

	// Only get the products we need instead of slicing a larger array
	const featuredProducts = allProducts.slice(0, 4); // First 4 for featured

	// Filter products with matching tags first before randomizing to improve performance
	const tagMatchedProducts = article.tags
		? allProducts.filter((product) => product.tags?.some((tag) => article.tags?.includes(tag)))
		: [];

	const complementaryProducts = tagMatchedProducts.slice(0, 3); // Products with matching tags

	// Only randomize if we have more than 6 products to avoid unnecessary processing
	const randomProducts =
		allProducts.length > 6 ? [...allProducts].sort(() => 0.5 - Math.random()).slice(0, 6) : allProducts.slice(0, 6);

	// Calculate reading time
	const wordsPerMinute = 200;
	const wordCount = article.content.split(/\s+/).length;
	const readingTime = Math.ceil(wordCount / wordsPerMinute);

	// Add structured data for article
	const articleStructuredData = {
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
				width: 180,
				height: 60,
			},
		},
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": `https://zugzology.com/blogs/${nextParams.blog}/${nextParams.slug}`,
		},
		wordCount: wordCount,
		timeRequired: `PT${readingTime}M`,
		articleSection: blog.title,
		keywords: article.tags ? article.tags.join(", ") : "",
	};

	const breadcrumbStructuredData = {
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
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(articleStructuredData),
				}}
			/>

			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(breadcrumbStructuredData),
				}}
			/>

			<div className="min-h-screen w-full">
				<div className="max-w-[1800px] mx-auto px-4 py-8">
					<Suspense fallback={<div className="h-12 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4 mb-8" />}>
						<BlogBreadcrumb blogHandle={blog.handle} blogTitle={blog.title} articleTitle={article.title} />
					</Suspense>

					<article
						className="w-full bg-white dark:bg-[#121212] relative"
						itemScope
						itemType="https://schema.org/BlogPosting"
					>
						{/* Share Toolbar - Client Component */}
						<BlogShareToolbar
							title={article.title}
							url={`https://zugzology.com/blogs/${nextParams.blog}/${nextParams.slug}`}
							description={article.excerpt || `Read about ${article.title} in our ${blog.title} blog.`}
						/>

						{/* Hero Section */}
						<header className="w-full max-w-screen-md mx-auto px-4 sm:px-6 pt-12 pb-8">
							<div className="space-y-4">
								<div className="flex items-center gap-4">
									<div className="w-12 h-12 rounded-full bg-[#f0f0f0] dark:bg-[#2f2f2f] flex items-center justify-center">
										<span className="text-lg font-medium text-[#6b6b6b] dark:text-[#a8a8a8]">
											{article.author.name.charAt(0)}
										</span>
									</div>
									<div className="flex flex-col">
										<span className="text-[#242424] dark:text-[#e6e6e6] font-medium">{article.author.name}</span>
										<div className="flex items-center gap-2 text-sm text-[#6b6b6b] dark:text-[#a8a8a8]">
											<time dateTime={article.publishedAt}>
												{new Date(article.publishedAt).toLocaleDateString("en-US", {
													month: "long",
													day: "numeric",
													year: "numeric",
												})}
											</time>
											<span>·</span>
											<span>{Math.ceil((article.content?.split(" ").length || 0) / 200)} min read</span>
										</div>
									</div>
								</div>

								<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#242424] dark:text-[#e6e6e6] tracking-tight">
									{article.title}
								</h1>

								{article.excerpt && (
									<p className="text-xl text-[#6b6b6b] dark:text-[#a8a8a8] leading-relaxed">{article.excerpt}</p>
								)}

								{article.image && (
									<div className="mt-8 -mx-4 sm:-mx-6 md:mx-0">
										<div className="aspect-[2/1] relative overflow-hidden rounded-lg md:rounded-xl">
											<Image
												src={article.image.url}
												alt={article.image.altText || article.title}
												fill
												priority
												className="object-cover"
												sizes="(max-width: 768px) 100vw, 720px"
											/>
										</div>
										{article.image.altText && (
											<p className="mt-2 text-sm text-center text-[#6b6b6b] dark:text-[#a8a8a8]">
												{article.image.altText}
											</p>
										)}
									</div>
								)}
							</div>
						</header>

						{/* Featured Products Banner - Show if we have tag-matched products */}
						{complementaryProducts.length > 0 && (
							<div className="w-full bg-[#f7f7f7] dark:bg-[#1a1a1a] py-8 my-8">
								<div className="max-w-screen-lg mx-auto px-4 sm:px-6">
									<div className="flex flex-col items-center text-center mb-8">
										<h2 className="text-2xl font-bold text-[#242424] dark:text-[#e6e6e6] mb-2">
											Products Featured in This Article
										</h2>
										<p className="text-[#6b6b6b] dark:text-[#a8a8a8]">
											Get the supplies you need to follow along with this guide
										</p>
									</div>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
										{complementaryProducts.map((product) => (
											<Link
												key={product.id}
												href={`/products/${product.handle}`}
												className="group block bg-white dark:bg-[#242424] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
											>
												{product.images?.nodes[0] && (
													<div className="aspect-square relative">
														<Image
															src={product.images.nodes[0].url}
															alt={product.images.nodes[0].altText || product.title}
															fill
															className="object-cover transition-transform duration-300 group-hover:scale-105"
															sizes="(max-width: 768px) 100vw, 33vw"
														/>
													</div>
												)}
												<div className="p-4">
													<h3 className="font-medium text-[#242424] dark:text-[#e6e6e6] group-hover:text-[#1a1a1a] dark:group-hover:text-white transition-colors">
														{product.title}
													</h3>
													<p className="text-[#6b6b6b] dark:text-[#a8a8a8] mt-1">
														From {formatPrice(product.priceRange.minVariantPrice.amount)}
													</p>
												</div>
											</Link>
										))}
									</div>
								</div>
							</div>
						)}

						{/* Article Content */}
						<div className="w-full max-w-screen-md mx-auto px-4 sm:px-6 py-8">
							<div className="prose dark:prose-invert prose-lg max-w-none">
								<div
									dangerouslySetInnerHTML={{
										__html: article.contentHtml || "",
									}}
								/>
							</div>

							{/* Horizontal Share Toolbar */}
							<BlogShareToolbarHorizontal
								title={article.title}
								url={`https://zugzology.com/blogs/${nextParams.blog}/${nextParams.slug}`}
								description={article.excerpt || `Read about ${article.title} in our ${blog.title} blog.`}
							/>
						</div>

						{/* Mid-Article Product Recommendation */}
						{featuredProducts.length > 0 && (
							<div className="w-full bg-[#f7f7f7] dark:bg-[#1a1a1a] py-12 my-12">
								<div className="max-w-screen-lg mx-auto px-4 sm:px-6">
									<div className="text-center mb-8">
										<h2 className="text-2xl font-bold text-[#242424] dark:text-[#e6e6e6] mb-2">
											Shop Our Best Sellers
										</h2>
										<p className="text-[#6b6b6b] dark:text-[#a8a8a8]">
											Discover our most popular mushroom growing supplies
										</p>
									</div>
									<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
										{featuredProducts.map((product) => (
											<Link
												key={product.id}
												href={`/products/${product.handle}`}
												className="group block bg-white dark:bg-[#242424] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
											>
												{product.images?.nodes[0] && (
													<div className="aspect-square relative">
														<Image
															src={product.images.nodes[0].url}
															alt={product.images.nodes[0].altText || product.title}
															fill
															className="object-cover transition-transform duration-300 group-hover:scale-105"
															sizes="(max-width: 768px) 50vw, 25vw"
														/>
													</div>
												)}
												<div className="p-4">
													<h3 className="font-medium text-[#242424] dark:text-[#e6e6e6] group-hover:text-[#1a1a1a] dark:group-hover:text-white transition-colors">
														{product.title}
													</h3>
													<p className="text-[#6b6b6b] dark:text-[#a8a8a8] mt-1">
														From {formatPrice(product.priceRange.minVariantPrice.amount)}
													</p>
												</div>
											</Link>
										))}
									</div>
									<div className="text-center mt-8">
										<Link
											href="/products"
											className="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium bg-[#242424] dark:bg-[#e6e6e6] text-white dark:text-[#242424] hover:bg-[#1a1a1a] dark:hover:bg-white transition-colors"
										>
											View All Products
										</Link>
									</div>
								</div>
							</div>
						)}

						{/* Article Footer */}
						<footer className="w-full max-w-screen-md mx-auto px-4 sm:px-6 py-8 border-t border-[#e6e6e6] dark:border-[#2f2f2f]">
							<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
								<div className="flex items-center gap-4">
									<div className="w-16 h-16 rounded-full bg-[#f0f0f0] dark:bg-[#2f2f2f] flex items-center justify-center">
										<span className="text-2xl font-medium text-[#6b6b6b] dark:text-[#a8a8a8]">
											{article.author.name.charAt(0)}
										</span>
									</div>
									<div className="flex flex-col">
										<span className="text-lg font-medium text-[#242424] dark:text-[#e6e6e6]">
											Written by {article.author.name}
										</span>
										<time dateTime={article.publishedAt} className="text-[#6b6b6b] dark:text-[#a8a8a8]">
											Published on{" "}
											{new Date(article.publishedAt).toLocaleDateString("en-US", {
												month: "long",
												day: "numeric",
												year: "numeric",
											})}
										</time>
									</div>
								</div>

								<div className="flex items-center gap-2">
									<Link
										href={`/blogs/${article.blog?.handle || nextParams.blog}`}
										className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-[#f0f0f0] dark:bg-[#2f2f2f] text-[#6b6b6b] dark:text-[#a8a8a8] hover:bg-[#e6e6e6] dark:hover:bg-[#3f3f3f] transition-colors"
									>
										More from {article.blog?.title || "Blog"}
									</Link>
								</div>
							</div>
						</footer>

						{/* Related Articles */}
						{relatedPosts.length > 0 && (
							<section className="w-full max-w-screen-md mx-auto px-4 sm:px-6 py-12 border-t border-[#e6e6e6] dark:border-[#2f2f2f]">
								<h2 className="text-2xl font-bold text-[#242424] dark:text-[#e6e6e6] mb-8">More Articles</h2>
								<div className="grid gap-8 md:grid-cols-2">
									{relatedPosts.map((relatedArticle) => (
										<Link
											key={relatedArticle.id}
											href={`/blogs/${article.blog?.handle || nextParams.blog}/${relatedArticle.handle}`}
											className="group block"
										>
											<article className="space-y-3">
												{relatedArticle.image && (
													<div className="aspect-[2/1] relative overflow-hidden rounded-lg">
														<Image
															src={relatedArticle.image.url}
															alt={relatedArticle.image.altText || relatedArticle.title}
															fill
															className="object-cover transition-transform duration-300 group-hover:scale-105"
															sizes="(max-width: 768px) 100vw, 350px"
														/>
													</div>
												)}
												<div className="space-y-2">
													<h3 className="text-lg font-bold text-[#242424] dark:text-[#e6e6e6] group-hover:text-[#1a1a1a] dark:group-hover:text-white transition-colors">
														{relatedArticle.title}
													</h3>
													{relatedArticle.excerpt && (
														<p className="text-[#6b6b6b] dark:text-[#a8a8a8] line-clamp-2">{relatedArticle.excerpt}</p>
													)}
													<div className="flex items-center gap-2 text-sm text-[#6b6b6b] dark:text-[#a8a8a8]">
														<span>{relatedArticle.author.name}</span>
														<span>·</span>
														<time dateTime={relatedArticle.publishedAt}>
															{new Date(relatedArticle.publishedAt).toLocaleDateString("en-US", {
																month: "short",
																day: "numeric",
															})}
														</time>
													</div>
												</div>
											</article>
										</Link>
									))}
								</div>
							</section>
						)}

						{/* Final CTA Section */}
						<div className="w-full bg-[#f7f7f7] dark:bg-[#1a1a1a] py-16">
							<div className="max-w-screen-md mx-auto px-4 sm:px-6 text-center">
								<h2 className="text-3xl font-bold text-[#242424] dark:text-[#e6e6e6] mb-4">Ready to Start Growing?</h2>
								<p className="text-lg text-[#6b6b6b] dark:text-[#a8a8a8] mb-8">
									Get everything you need to begin your mushroom cultivation journey
								</p>
								<div className="flex flex-col sm:flex-row gap-4 justify-center">
									<Link
										href="/products"
										className="inline-flex items-center px-8 py-4 rounded-full text-base font-medium bg-[#242424] dark:bg-[#e6e6e6] text-white dark:text-[#242424] hover:bg-[#1a1a1a] dark:hover:bg-white transition-colors"
									>
										Shop All Products
									</Link>
									<Link
										href="/collections/starter-kits"
										className="inline-flex items-center px-8 py-4 rounded-full text-base font-medium bg-white dark:bg-[#242424] text-[#242424] dark:text-[#e6e6e6] border border-[#e6e6e6] dark:border-[#2f2f2f] hover:bg-[#f7f7f7] dark:hover:bg-[#1a1a1a] transition-colors"
									>
										View Starter Kits
									</Link>
								</div>
							</div>
						</div>
					</article>
				</div>
			</div>
		</>
	);
}
