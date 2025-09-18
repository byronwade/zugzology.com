

import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getBlogByHandle, getAllBlogPosts } from "@/lib/api/shopify/actions";
import { getProducts } from "@/lib/api/shopify/actions";
import { getLimitedProducts, getProductsByTags } from "@/lib/actions/shopify/index";
import { ArrowLeft, CalendarDays, Clock, Percent, ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { RelatedPosts } from "@/components/blog/related-posts";
import { findRelatedPosts } from "@/lib/utils/related-posts";
import { ProductAd } from "@/components/blog/product-ad";
import { BlogBreadcrumb } from "@/components/blog/blog-breadcrumb";
import { ProductRecommendations } from "@/components/features/products/sections/recommendations/product-recommendations";
import { AdPlaceholder } from "@/components/ads/ad-placeholder";
import { BlogQuickActions } from "@/components/blog/blog-quick-actions";
import { BlogTableOfContents } from "@/components/blog/blog-table-of-contents";
import { BlogPostClient } from "@/components/blog/blog-post-client";
import { BlogShareToolbar } from "@/components/blog/blog-share-toolbar";
import { BlogShareToolbarHorizontal } from "@/components/blog/blog-share-toolbar-horizontal";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ShopifyBlogArticle, ShopifyImage, ShopifyBlog, ShopifyProduct } from "@/lib/types";
import { ProductSection } from "@/components/features/products/sections/product-section";
import { ProductSource } from "@/components/features/products/sections/recommendations/types";
import { FrequentlyBoughtTogether } from "@/components/features/products/sections/frequently-bought-together";
import { RecentPosts } from "@/components/blog/recent-posts";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/seo-utils";
import { getEnhancedBreadcrumbSchema, getEnhancedBlogPostSchema, getSearchActionSchema, getEnhancedOrganizationSchema } from "@/lib/seo/enhanced-jsonld";
import Script from "next/script";

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
		return generateSEOMetadata({
			title: "Blog Article Not Found",
			description: "The requested blog article could not be found.",
			noindex: true,
		});
	}

	const blog = await getBlogByHandle(nextParams.blog);
	const article = (await getArticleByHandle(nextParams.blog, nextParams.slug)) as ExtendedShopifyBlogArticle;

	if (!blog || !article) {
		return generateSEOMetadata({
			title: "Article Not Found",
			description: "The requested article could not be found.",
			noindex: true,
		});
	}

	const wordCount = article.content?.split(/\s+/).length || 0;
	const readingTime = Math.ceil(wordCount / 200);
	
	const title = `${article.title} - Expert Mushroom Cultivation Guide`;
	const description = article.excerpt || 
		`Discover expert insights about ${article.title.toLowerCase()}. Comprehensive guide covering advanced mushroom cultivation techniques, professional tips, and industry best practices.`;

	const keywords = [
		...(article.tags || []),
		"mushroom cultivation",
		"growing guide",
		"expert advice",
		"cultivation techniques",
		"mushroom farming",
		"growing tips",
		blog.title.toLowerCase(),
		"professional growing",
		"cultivation tutorial"
	];

	return generateSEOMetadata({
		title,
		description,
		keywords,
		url: `/blogs/${blog.handle}/${article.handle}`,
		authors: [{ name: article.author.name }],
		openGraph: {
			type: "article",
			publishedTime: new Date(article.publishedAt).toISOString(),
			modifiedTime: article.updatedAt ? new Date(article.updatedAt).toISOString() : new Date(article.publishedAt).toISOString(),
			authors: [article.author.name],
			tags: article.tags,
			images: article.image ? [{
				url: article.image.url,
				width: article.image.width || 1200,
				height: article.image.height || 630,
				alt: article.image.altText || article.title,
			}] : [],
			section: blog.title,
		},
		twitter: {
			card: "summary_large_image",
			creator: "@zugzology",
			site: "@zugzology",
		},
		other: {
			"article:published_time": new Date(article.publishedAt).toISOString(),
			"article:modified_time": article.updatedAt ? new Date(article.updatedAt).toISOString() : new Date(article.publishedAt).toISOString(),
			"article:author": article.author.name,
			"article:section": blog.title,
			"article:tag": article.tags ? article.tags.join(",") : "",
			"article:reading_time": `${readingTime} minutes`,
			"article:word_count": wordCount.toString(),
		},
	});
}

// Helper function to get article by handle with proper typing
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
	mainProduct,
	complementaryProducts,
	title = "Products Related to This Article",
	description = "These products are perfect companions for the techniques discussed in this article",
}: {
	mainProduct: ShopifyProduct;
	complementaryProducts: ShopifyProduct[];
	title?: string;
	description?: string;
}) {
	// Skip if no products
	if (!complementaryProducts.length) return null;

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

	// Get all blog categories - Removed

	if (!blog || !article) {
		notFound();
	}

	// Get related posts - optimize with a smaller fetch
	const allPosts = await getAllBlogPosts();

	// Add blogHandle to all posts if it's missing
	const postsWithBlogHandles = allPosts.map((post: ShopifyBlogArticle) => ({
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

	// Performance optimization: Use specialized functions to fetch only the products we need
	console.time("blogPostProductFetch");

	// Get tag-matched products using the optimized function
	const tagMatchedProducts = article.tags && article.tags.length > 0 ? await getProductsByTags(article.tags, 3) : [];

	// Get featured products - only fetch what we need
	const featuredProducts = await getLimitedProducts(4);

	// Log performance metrics
	console.timeEnd("blogPostProductFetch");

	// Get complementary products from tag-matched products
	const complementaryProducts = tagMatchedProducts.length > 0 ? tagMatchedProducts : featuredProducts.slice(0, 3);

	// No need to randomize products since we're already getting best sellers
	const randomProducts = featuredProducts.slice(0, 6);

	// Calculate reading time
	const wordsPerMinute = 200;
	const wordCount = article.content.split(/\s+/).length;
	const readingTime = Math.ceil(wordCount / wordsPerMinute);

	// Generate enhanced structured data
	const breadcrumbs = [
		{ name: "Home", url: "/" },
		{ name: "Blog", url: "/blogs" },
		{ name: blog.title, url: `/blogs/${nextParams.blog}` },
		{ name: article.title, url: `/blogs/${nextParams.blog}/${nextParams.slug}` },
	];
	
	const breadcrumbSchema = getEnhancedBreadcrumbSchema(breadcrumbs);
	const websiteSchema = getSearchActionSchema();
	const organizationSchema = getEnhancedOrganizationSchema();
	
	// Enhanced blog post schema using the enhanced function
	const blogPostSchema = getEnhancedBlogPostSchema({
		...article,
		blog: {
			handle: nextParams.blog,
			title: blog.title,
		}
	});

	return (
		<>
			{/* JSON-LD Structured Data */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(breadcrumbSchema),
				}}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(blogPostSchema),
				}}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(websiteSchema),
				}}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(organizationSchema),
				}}
			/>
			
			{/* Google Analytics for Blog Post */}
			<Script id="blog-post-analytics" strategy="afterInteractive">
				{`
					window.dataLayer = window.dataLayer || [];
					window.dataLayer.push({
						'event': 'page_view',
						'page_type': 'blog_post',
						'page_location': window.location.href,
						'content_category': 'blog',
						'blog_category': '${blog.title.replace(/'/g, "\\'")}',
						'blog_handle': '${nextParams.blog}',
						'article_title': '${article.title.replace(/'/g, "\\'")}',
						'article_author': '${article.author.name.replace(/'/g, "\\'")}',
						'article_published_date': '${article.publishedAt}',
						'reading_time': ${readingTime},
						'word_count': ${wordCount}
					});
					
					// Track blog post view event
					window.dataLayer.push({
						'event': 'view_item',
						'item_id': '${article.id}',
						'item_name': '${article.title.replace(/'/g, "\\'")}',
						'item_category': 'blog_post',
						'item_brand': 'Zugzology',
						'item_list_name': '${blog.title.replace(/'/g, "\\'")} Articles'
					});
				`}
			</Script>

			<div className="min-h-screen w-full bg-white dark:bg-black">
				<div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<article
						className="w-full bg-white dark:bg-black relative"
						itemScope
						itemType="https://schema.org/BlogPosting"
					>
						{/* Breadcrumb - moved inside article */}
						<div className="max-w-4xl mx-auto mb-6">
							<Suspense fallback={<div className="h-12 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4 mb-8" />}>
								<BlogBreadcrumb blogHandle={blog.handle} blogTitle={blog.title} articleTitle={article.title} />
							</Suspense>
						</div>

						{/* Share Toolbar - Client Component */}
						<BlogShareToolbar
							title={article.title}
							url={`https://zugzology.com/blogs/${nextParams.blog}/${nextParams.slug}`}
							description={article.excerpt || `Read about ${article.title} in our ${blog.title} blog.`}
						/>

						{/* Hero Section */}
						<header className="w-full max-w-4xl mx-auto pt-12 pb-8 px-4 sm:px-6">
							<div className="space-y-6">
								<div className="flex items-center gap-4">
									<div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
										<span className="text-lg font-medium text-neutral-600 dark:text-neutral-400">
											{article.author.name.charAt(0)}
										</span>
									</div>
									<div className="flex flex-col">
										<span className="text-neutral-900 dark:text-neutral-100 font-medium">{article.author.name}</span>
										<div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
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

								<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
									{article.title}
								</h1>

								{article.excerpt && (
									<p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-4xl">
										{article.excerpt}
									</p>
								)}

								{article.image && (
									<div className="mt-8 -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-16 xl:-mx-24">
										<div className="aspect-[21/9] relative overflow-hidden rounded-xl">
											<Image
												src={article.image.url}
												alt={article.image.altText || article.title}
												fill
												priority
												className="object-cover"
												sizes="100vw"
											/>
										</div>
										{article.image.altText && (
											<p className="mt-3 text-sm text-center text-neutral-600 dark:text-neutral-400">
												{article.image.altText}
											</p>
										)}
									</div>
								)}
							</div>
						</header>

						{/* Featured Products Banner - Show if we have tag-matched products */}
						{complementaryProducts.length > 0 && (
							<div className="w-full bg-neutral-50 dark:bg-neutral-900 py-12 my-12 rounded-2xl">
								<div className="w-full px-4 sm:px-6 lg:px-8">
									<div className="max-w-[1800px] mx-auto">
										<div className="flex flex-col items-center text-center mb-10">
											<h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
												Featured Zugzology Products
											</h2>
											<p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl">
												Quality supplies for your mushroom cultivation journey
											</p>
										</div>
										<div
											className={`grid gap-6 ${
												complementaryProducts.length === 1
													? "grid-cols-1 max-w-xs mx-auto"
													: complementaryProducts.length === 2
													? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto"
													: complementaryProducts.length === 3
													? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-4xl mx-auto"
													: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
											}`}
										>
											{complementaryProducts.map((product) => (
												<Link
													key={product.id}
													href={`/products/${product.handle}`}
													className="group block bg-white dark:bg-neutral-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-4px] border border-neutral-200 dark:border-neutral-700"
												>
													{product.images?.nodes[0] && (
														<div className="aspect-square relative rounded-t-xl overflow-hidden">
															<Image
																src={product.images.nodes[0].url}
																alt={product.images.nodes[0].altText || product.title}
																fill
																className="object-cover transition-transform duration-300 group-hover:scale-105"
																sizes="(max-width: 768px) 50vw, 33vw"
															/>
														</div>
													)}
													<div className="p-4">
														<h3 className="font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
															{product.title}
														</h3>
														<p className="text-neutral-600 dark:text-neutral-400 mt-1">
															From {formatPrice(product.priceRange.minVariantPrice.amount)}
														</p>
													</div>
												</Link>
											))}
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Article Content */}
						<div className="w-full px-4 sm:px-6 lg:px-8 py-12">
							<div className="max-w-4xl mx-auto">
								<div className="prose dark:prose-invert prose-lg md:prose-xl max-w-none prose-headings:text-neutral-900 prose-headings:dark:text-neutral-100 prose-p:text-neutral-700 prose-p:dark:text-neutral-300 prose-a:text-purple-600 prose-a:dark:text-purple-400 prose-a:font-medium">
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
						</div>

						{/* Mid-Article Product Recommendation */}
						{featuredProducts.length > 0 && (
							<div className="w-full bg-neutral-50 dark:bg-neutral-900 py-16 my-16 rounded-2xl">
								<div className="w-full px-4 sm:px-6 lg:px-8">
									<div className="max-w-[1800px] mx-auto">
										<div className="text-center mb-10">
											<h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
												Shop Our Best Sellers
											</h2>
											<p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
												Discover our most popular mushroom growing supplies
											</p>
										</div>
										<div
											className={`grid gap-6 ${
												featuredProducts.length === 1
													? "grid-cols-1 max-w-xs mx-auto"
													: featuredProducts.length === 2
													? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto"
													: featuredProducts.length === 3
													? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-4xl mx-auto"
													: "grid-cols-2 md:grid-cols-4"
											}`}
										>
											{featuredProducts.map((product: ShopifyProduct) => (
												<Link
													key={product.id}
													href={`/products/${product.handle}`}
													className="group block bg-white dark:bg-neutral-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-4px] border border-neutral-200 dark:border-neutral-700"
												>
													{product.images?.nodes[0] && (
														<div className="aspect-square relative rounded-t-xl overflow-hidden">
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
														<h3 className="font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
															{product.title}
														</h3>
														<p className="text-neutral-600 dark:text-neutral-400 mt-1">
															From {formatPrice(product.priceRange.minVariantPrice.amount)}
														</p>
													</div>
												</Link>
											))}
										</div>
										<div className="text-center mt-10">
											<Link
												href="/products"
												className="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-white transition-colors"
											>
												View All Products
											</Link>
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Article Footer */}
						<footer className="w-full px-4 sm:px-6 lg:px-8 py-12 border-t border-neutral-200 dark:border-neutral-800">
							<div className="max-w-4xl mx-auto">
								<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
									<div className="flex items-center gap-5">
										<div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
											<span className="text-3xl font-medium text-neutral-600 dark:text-neutral-400">
												{article.author.name.charAt(0)}
											</span>
										</div>
										<div className="flex flex-col">
											<span className="text-xl font-medium text-neutral-900 dark:text-neutral-100">
												Written by {article.author.name}
											</span>
											<time dateTime={article.publishedAt} className="text-neutral-600 dark:text-neutral-400">
												Published on{" "}
												{new Date(article.publishedAt).toLocaleDateString("en-US", {
													month: "long",
													day: "numeric",
													year: "numeric",
												})}
											</time>
										</div>
									</div>

									<div className="flex items-center gap-3">
										<Link
											href={`/blogs/${article.blog?.handle || nextParams.blog}`}
											className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
										>
											More from {article.blog?.title || "Blog"}
										</Link>
									</div>
								</div>
							</div>
						</footer>

						{/* Related Articles */}
						{relatedPosts.length > 0 && (
							<section className="w-full bg-neutral-50 dark:bg-neutral-900 py-16 rounded-2xl">
								<div className="w-full px-4 sm:px-6 lg:px-8">
									<div className="max-w-[1800px] mx-auto">
										<h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-10">
											More Articles You Might Enjoy
										</h2>
										<div
											className={`grid gap-8 ${
												relatedPosts.length === 1
													? "grid-cols-1 max-w-md mx-auto"
													: relatedPosts.length === 2
													? "grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto"
													: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
											}`}
										>
											{relatedPosts.map((relatedArticle) => (
												<Link
													key={relatedArticle.id}
													href={`/blogs/${article.blog?.handle || nextParams.blog}/${relatedArticle.handle}`}
													className="group block bg-white dark:bg-neutral-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-4px] border border-neutral-200 dark:border-neutral-700"
												>
													<article className="h-full flex flex-col">
														{relatedArticle.image && (
															<div className="aspect-[16/9] relative overflow-hidden rounded-t-xl">
																<Image
																	src={relatedArticle.image.url}
																	alt={relatedArticle.image.altText || relatedArticle.title}
																	fill
																	className="object-cover transition-transform duration-300 group-hover:scale-105"
																	sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
																/>
															</div>
														)}
														<div className="p-5 flex flex-col flex-grow">
															<h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mb-2">
																{relatedArticle.title}
															</h3>
															{relatedArticle.excerpt && (
																<p className="text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-4 flex-grow">
																	{relatedArticle.excerpt}
																</p>
															)}
															<div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-500 pt-2 border-t border-neutral-200 dark:border-neutral-700">
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
									</div>
								</div>
							</section>
						)}

						{/* Final CTA Section */}
						<div className="w-full bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-black py-24 rounded-2xl my-16">
							<div className="w-full px-4 sm:px-6 lg:px-8">
								<div className="max-w-[1800px] mx-auto text-center">
									<h2 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
										Ready to Start Growing?
									</h2>
									<p className="text-xl text-neutral-600 dark:text-neutral-400 mb-10 max-w-2xl mx-auto">
										Get everything you need to begin your mushroom cultivation journey
									</p>
									<div className="flex flex-col sm:flex-row gap-4 justify-center">
										<Link
											href="/products"
											className="inline-flex items-center px-8 py-4 rounded-full text-base font-medium bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-white transition-colors"
										>
											Shop All Products
										</Link>
										<Link
											href="/collections/starter-kits"
											className="inline-flex items-center px-8 py-4 rounded-full text-base font-medium bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
										>
											View Starter Kits
										</Link>
									</div>
								</div>
							</div>
						</div>
					</article>
				</div>
			</div>
		</>
	);
}
