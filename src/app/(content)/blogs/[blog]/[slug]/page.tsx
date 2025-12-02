import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Script from "next/script";
import { Suspense } from "react";
import { BlogShareToolbar } from "@/components/features/blog/blog-share-toolbar";
import { BlogShareToolbarHorizontal } from "@/components/features/blog/blog-share-toolbar-horizontal";
import { FrequentlyBoughtTogether } from "@/components/features/products/sections/frequently-bought-together";
import { BreadcrumbConfigs, UniversalBreadcrumb } from "@/components/layout";
import { Link } from "@/components/ui/link";
import { getLimitedProducts, getProductsByTags } from "@/lib/actions/shopify/index";
import { getAllBlogPosts, getArticleByHandles, getBlogByHandle } from "@/lib/api/shopify/actions";
import {
	getEnhancedBlogPostSchema,
	getEnhancedBreadcrumbSchema,
	getEnhancedOrganizationSchema,
	getSearchActionSchema,
} from "@/lib/seo/enhanced-jsonld";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/seo-utils";
import type { ShopifyBlogArticle, ShopifyImage, ShopifyProduct } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { findRelatedPosts } from "@/lib/utils/related-posts";

// Regex patterns (moved to top level for performance)
const WHITESPACE_REGEX = /\s+/;
const HOW_TO_GUIDE_REGEX = /how to|guide|tutorial|step[- ]by[- ]step/;

type BlogArticleAuthor = {
	name: string;
	email?: string;
};

interface ExtendedShopifyBlogArticle extends Omit<ShopifyBlogArticle, "image" | "articles"> {
	author: BlogArticleAuthor;
	image?: ShopifyImage;
	tags?: string[];
	updatedAt?: string;
	content: string;
	excerpt?: string;
	handle: string;
}

type BlogPostPageProps = {
	params: Promise<{
		blog: string;
		slug: string;
	}>;
};

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

	if (!(blog && article)) {
		return generateSEOMetadata({
			title: "Article Not Found",
			description: "The requested article could not be found.",
			noindex: true,
		});
	}

	const wordCount = article.content?.split(WHITESPACE_REGEX).length || 0;
	const _readingTime = Math.ceil(wordCount / 200);

	const title = `${article.title} - Expert Mushroom Cultivation Guide`;
	const description =
		article.excerpt ||
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
		"cultivation tutorial",
	];

	return generateSEOMetadata({
		title,
		description,
		keywords,
		url: `/blogs/${blog.handle}/${article.handle}`,
		image: article.image
			? {
					url: article.image.url,
					width: article.image.width || 1200,
					height: article.image.height || 630,
					alt: article.image.altText || article.title,
				}
			: undefined,
		article: {
			publishedTime: new Date(article.publishedAt).toISOString(),
			modifiedTime: article.updatedAt
				? new Date(article.updatedAt).toISOString()
				: new Date(article.publishedAt).toISOString(),
			authors: [article.author.name],
			section: blog.title,
			tags: article.tags,
		},
		twitter: {
			card: "summary_large_image",
			creator: "@zugzology",
			site: "@zugzology",
		},
	});
}

// Helper function to get article by handle - now uses direct Shopify query
async function getArticleByHandle(
	blogHandle: string,
	articleHandle: string
): Promise<ExtendedShopifyBlogArticle | undefined> {
	// Check if blog handle is undefined
	if (!blogHandle || blogHandle === "undefined") {
		return;
	}

	// Use direct Shopify query instead of searching through all articles
	const article = await getArticleByHandles(blogHandle, articleHandle);

	if (!article) {
		return;
	}

	// Transform to expected structure
	return {
		...article,
		author: article.author || { name: "Anonymous" },
		content: article.contentHtml || article.content || "",
	} as ExtendedShopifyBlogArticle;
}

// Add a modified version of FrequentlyBoughtTogether that accepts custom title and description
// Helper function to get grid classes based on product count
function getProductGridClasses(count: number): string {
	if (count === 1) {
		return "mx-auto max-w-xs grid-cols-1";
	}
	if (count === 2) {
		return "mx-auto max-w-2xl grid-cols-1 sm:grid-cols-2";
	}
	if (count === 3) {
		return "mx-auto max-w-4xl grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
	}
	return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
}

// Helper function to get grid classes for featured products
function getFeaturedProductGridClasses(count: number): string {
	if (count === 1) {
		return "mx-auto max-w-xs grid-cols-1";
	}
	if (count === 2) {
		return "mx-auto max-w-2xl grid-cols-1 sm:grid-cols-2";
	}
	if (count === 3) {
		return "mx-auto max-w-4xl grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
	}
	return "grid-cols-2 md:grid-cols-4";
}

// Helper function to get grid classes for related posts
function getRelatedPostsGridClasses(count: number): string {
	if (count === 1) {
		return "mx-auto max-w-md grid-cols-1";
	}
	if (count === 2) {
		return "mx-auto max-w-3xl grid-cols-1 md:grid-cols-2";
	}
	return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
}

function _BlogProductRecommendations({
	complementaryProducts,
	mainProduct,
}: {
	mainProduct: ShopifyProduct;
	complementaryProducts: ShopifyProduct[];
	title?: string;
	description?: string;
}) {
	// title and description are kept in the type for API compatibility but not used in this component
	// Skip if no products
	if (!complementaryProducts.length) {
		return null;
	}

	return <FrequentlyBoughtTogether complementaryProducts={complementaryProducts.slice(1)} mainProduct={mainProduct} />;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
	const nextParams = await params;

	// Check if blog handle is undefined
	if (!nextParams.blog || nextParams.blog === "undefined") {
		notFound();
	}

	const blog = await getBlogByHandle(nextParams.blog);

	const article = (await getArticleByHandle(nextParams.blog, nextParams.slug)) as ExtendedShopifyBlogArticle;

	// Get all blog categories - Removed

	if (!(blog && article)) {
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
	// Get tag-matched products using the optimized function
	const tagMatchedProducts = article.tags && article.tags.length > 0 ? await getProductsByTags(article.tags, 3) : [];

	// Get featured products - only fetch what we need
	const featuredProducts = await getLimitedProducts(4);

	// Get complementary products from tag-matched products
	const complementaryProducts = tagMatchedProducts.length > 0 ? tagMatchedProducts : featuredProducts.slice(0, 3);

	// No need to randomize products since we're already getting best sellers
	const _randomProducts = featuredProducts.slice(0, 6);

	// Calculate reading time
	const wordsPerMinute = 200;
	const wordCount = article.content.split(WHITESPACE_REGEX).length;
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
		},
	});

	// Check if article is a how-to guide and add HowTo schema
	const isHowToGuide = HOW_TO_GUIDE_REGEX.test(article.title.toLowerCase());
	const howToSchema = isHowToGuide
		? {
				"@context": "https://schema.org",
				"@type": "HowTo",
				name: article.title,
				description: article.excerpt || `Learn ${article.title}`,
				totalTime: `PT${readingTime}M`,
				estimatedCost: {
					"@type": "MonetaryAmount",
					currency: "USD",
					value: "0",
				},
				step: [
					{
						"@type": "HowToStep",
						name: "Read the complete guide",
						text: article.excerpt || article.title,
						url: `https://zugzology.com/blogs/${nextParams.blog}/${nextParams.slug}`,
						image: article.image?.url,
					},
				],
				supply:
					article.tags?.filter(
						(tag: string) => tag.includes("substrate") || tag.includes("kit") || tag.includes("equipment")
					) || [],
			}
		: null;

	return (
		<>
			{/* JSON-LD Structured Data */}
			<script
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data is safe with JSON.stringify
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(breadcrumbSchema),
				}}
				type="application/ld+json"
			/>
			<script
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data is safe with JSON.stringify
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(blogPostSchema),
				}}
				type="application/ld+json"
			/>
			<script
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data is safe with JSON.stringify
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(websiteSchema),
				}}
				type="application/ld+json"
			/>
			<script
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data is safe with JSON.stringify
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(organizationSchema),
				}}
				type="application/ld+json"
			/>
			{howToSchema && (
				<script
					// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data is safe with JSON.stringify
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(howToSchema),
					}}
					type="application/ld+json"
				/>
			)}

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

			<div className="min-h-screen w-full bg-background">
				<div className="container mx-auto px-4 py-12">
					<article className="relative w-full bg-background" itemScope itemType="https://schema.org/BlogPosting">
						{/* Breadcrumb - moved inside article */}
						<div className="mx-auto mb-6 max-w-4xl">
							<Suspense fallback={<div className="mb-8 h-12 w-1/4 rounded bg-neutral-200 dark:bg-neutral-700" />}>
								<UniversalBreadcrumb
									className="mb-4 hidden md:block"
									items={BreadcrumbConfigs.blogArticle(blog.title, blog.handle, article.title)}
								/>
							</Suspense>
						</div>

						{/* Share Toolbar - Client Component */}
						<BlogShareToolbar
							description={article.excerpt || `Read about ${article.title} in our ${blog.title} blog.`}
							title={article.title}
							url={`https://zugzology.com/blogs/${nextParams.blog}/${nextParams.slug}`}
						/>

						{/* Hero Section */}
						<header className="mx-auto w-full max-w-4xl px-4 pt-12 pb-8 sm:px-6">
							<div className="space-y-6">
								<div className="flex items-center gap-4">
									<div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
										<span className="font-medium text-lg text-neutral-600 dark:text-neutral-400">
											{article.author.name.charAt(0)}
										</span>
									</div>
									<div className="flex flex-col">
										<span className="font-medium text-neutral-900 dark:text-neutral-100">{article.author.name}</span>
										<div className="flex items-center gap-2 text-neutral-600 text-sm dark:text-neutral-400">
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

								<h1 className="font-bold text-4xl text-neutral-900 tracking-tight md:text-5xl lg:text-6xl dark:text-neutral-100">
									{article.title}
								</h1>

								{article.excerpt && (
									<p className="max-w-4xl text-neutral-600 text-xl leading-relaxed md:text-2xl dark:text-neutral-400">
										{article.excerpt}
									</p>
								)}

								{article.image && (
									<div className="-mx-4 sm:-mx-6 md:-mx-8 lg:-mx-16 xl:-mx-24 mt-8">
										<div className="relative aspect-[21/9] overflow-hidden rounded-xl">
											<Image
												alt={article.image.altText || article.title}
												className="object-cover"
												fill
												priority
												sizes="100vw"
												src={article.image.url}
											/>
										</div>
										{article.image.altText && (
											<p className="mt-3 text-center text-neutral-600 text-sm dark:text-neutral-400">
												{article.image.altText}
											</p>
										)}
									</div>
								)}
							</div>
						</header>

						{/* Featured Products Banner - Show if we have tag-matched products */}
						{complementaryProducts.length > 0 && (
							<div className="my-12 w-full rounded-2xl bg-neutral-50 dark:bg-neutral-900">
								<div className="container mx-auto px-4 py-12">
									<div className="mx-auto max-w-[1800px]">
										<div className="mb-10 flex flex-col items-center text-center">
											<h2 className="mb-3 font-bold text-2xl text-neutral-900 md:text-3xl dark:text-neutral-100">
												Featured Zugzology Products
											</h2>
											<p className="max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
												Quality supplies for your mushroom cultivation journey
											</p>
										</div>
										<div className={`grid gap-6 ${getProductGridClasses(complementaryProducts.length)}`}>
											{complementaryProducts.map((product) => (
												<Link
													className="group block overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:translate-y-[-4px] hover:shadow-md"
													href={`/products/${product.handle}`}
													key={product.id}
												>
													{product.images?.nodes[0] && (
														<div className="relative aspect-square overflow-hidden rounded-t-xl">
															<Image
																alt={product.images.nodes[0].altText || product.title}
																className="object-cover transition-transform duration-300 group-hover:scale-105"
																fill
																sizes="(max-width: 768px) 50vw, 33vw"
																src={product.images.nodes[0].url}
															/>
														</div>
													)}
													<div className="p-4">
														<h3 className="font-medium text-neutral-900 transition-colors group-hover:text-primary dark:text-neutral-100">
															{product.title}
														</h3>
														<p className="mt-1 text-neutral-600 dark:text-neutral-400">
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
						<div className="container mx-auto px-4 py-12">
							<div className="mx-auto max-w-4xl">
								<div className="prose dark:prose-invert prose-lg md:prose-xl max-w-none prose-a:font-medium prose-a:text-primary prose-headings:text-neutral-900 prose-p:text-neutral-700 prose-headings:dark:text-neutral-100 prose-p:dark:text-neutral-300">
									<div
										// biome-ignore lint/security/noDangerouslySetInnerHtml: Content from Shopify CMS is trusted
										dangerouslySetInnerHTML={{
											__html: article.contentHtml || "",
										}}
									/>
								</div>

								{/* Horizontal Share Toolbar */}
								<BlogShareToolbarHorizontal
									description={article.excerpt || `Read about ${article.title} in our ${blog.title} blog.`}
									title={article.title}
									url={`https://zugzology.com/blogs/${nextParams.blog}/${nextParams.slug}`}
								/>
							</div>
						</div>

						{/* Mid-Article Product Recommendation */}
						{featuredProducts.length > 0 && (
							<div className="my-16 w-full rounded-2xl bg-neutral-50 dark:bg-neutral-900">
								<div className="container mx-auto px-4 py-12">
									<div className="mx-auto max-w-[1800px]">
										<div className="mb-10 text-center">
											<h2 className="mb-3 font-bold text-2xl text-neutral-900 md:text-3xl dark:text-neutral-100">
												Shop Our Best Sellers
											</h2>
											<p className="mx-auto max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
												Discover our most popular mushroom growing supplies
											</p>
										</div>
										<div className={`grid gap-6 ${getFeaturedProductGridClasses(featuredProducts.length)}`}>
											{featuredProducts.map((product: ShopifyProduct) => (
												<Link
													className="group block overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:translate-y-[-4px] hover:shadow-md"
													href={`/products/${product.handle}`}
													key={product.id}
												>
													{product.images?.nodes[0] && (
														<div className="relative aspect-square overflow-hidden rounded-t-xl">
															<Image
																alt={product.images.nodes[0].altText || product.title}
																className="object-cover transition-transform duration-300 group-hover:scale-105"
																fill
																sizes="(max-width: 768px) 50vw, 25vw"
																src={product.images.nodes[0].url}
															/>
														</div>
													)}
													<div className="p-4">
														<h3 className="font-medium text-neutral-900 transition-colors group-hover:text-primary dark:text-neutral-100">
															{product.title}
														</h3>
														<p className="mt-1 text-neutral-600 dark:text-neutral-400">
															From {formatPrice(product.priceRange.minVariantPrice.amount)}
														</p>
													</div>
												</Link>
											))}
										</div>
										<div className="mt-10 text-center">
											<Link
												className="inline-flex items-center rounded-full bg-neutral-900 px-6 py-3 font-medium text-sm text-white transition-colors hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
												href="/products"
											>
												View All Products
											</Link>
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Article Footer */}
						<footer className="w-full border-neutral-200 border-t dark:border-neutral-800">
							<div className="container mx-auto px-4 py-12">
								<div className="max-w-4xl">
									<div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
										<div className="flex items-center gap-5">
											<div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
												<span className="font-medium text-3xl text-neutral-600 dark:text-neutral-400">
													{article.author.name.charAt(0)}
												</span>
											</div>
											<div className="flex flex-col">
												<span className="font-medium text-neutral-900 text-xl dark:text-neutral-100">
													Written by {article.author.name}
												</span>
												<time className="text-neutral-600 dark:text-neutral-400" dateTime={article.publishedAt}>
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
												className="inline-flex items-center rounded-full bg-neutral-100 px-5 py-2.5 font-medium text-neutral-600 text-sm transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
												href={`/blogs/${article.blog?.handle || nextParams.blog}`}
											>
												More from {article.blog?.title || "Blog"}
											</Link>
										</div>
									</div>
								</div>
							</div>
						</footer>

						{/* Related Articles */}
						{relatedPosts.length > 0 && (
							<section className="w-full rounded-2xl bg-neutral-50 dark:bg-neutral-900">
								<div className="container mx-auto px-4 py-12">
									<div className="mx-auto max-w-[1800px]">
										<h2 className="mb-10 font-bold text-3xl text-neutral-900 dark:text-neutral-100">
											More Articles You Might Enjoy
										</h2>
										<div className={`grid gap-8 ${getRelatedPostsGridClasses(relatedPosts.length)}`}>
											{relatedPosts.map((relatedArticle) => (
												<Link
													className="group block overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:translate-y-[-4px] hover:shadow-md"
													href={`/blogs/${article.blog?.handle || nextParams.blog}/${relatedArticle.handle}`}
													key={relatedArticle.id}
												>
													<article className="flex h-full flex-col">
														{relatedArticle.image && (
															<div className="relative aspect-[16/9] overflow-hidden rounded-t-xl">
																<Image
																	alt={relatedArticle.image.altText || relatedArticle.title}
																	className="object-cover transition-transform duration-300 group-hover:scale-105"
																	fill
																	sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
																	src={relatedArticle.image.url}
																/>
															</div>
														)}
														<div className="flex flex-grow flex-col p-5">
															<h3 className="mb-2 font-bold text-neutral-900 text-xl transition-colors group-hover:text-primary dark:text-neutral-100">
																{relatedArticle.title}
															</h3>
															{relatedArticle.excerpt && (
																<p className="mb-4 line-clamp-2 flex-grow text-neutral-600 dark:text-neutral-400">
																	{relatedArticle.excerpt}
																</p>
															)}
															<div className="flex items-center gap-2 border-neutral-200 border-t pt-2 text-neutral-500 text-sm dark:border-neutral-700 dark:text-neutral-500">
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
						<div className="my-16 w-full rounded-2xl bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-black">
							<div className="container mx-auto px-4 py-12">
								<div className="mx-auto max-w-[1800px] text-center">
									<h2 className="mb-6 font-bold text-4xl text-neutral-900 dark:text-neutral-100">
										Ready to Start Growing?
									</h2>
									<p className="mx-auto mb-10 max-w-2xl text-neutral-600 text-xl dark:text-neutral-400">
										Get everything you need to begin your mushroom cultivation journey
									</p>
									<div className="flex flex-col justify-center gap-4 sm:flex-row">
										<Link
											className="inline-flex items-center rounded-full bg-neutral-900 px-8 py-4 font-medium text-base text-white transition-colors hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
											href="/products"
										>
											Shop All Products
										</Link>
										<Link
											className="inline-flex items-center rounded-full border bg-card px-8 py-4 font-medium text-base text-foreground transition-all duration-200 hover:border-primary/30 hover:bg-primary/5"
											href="/collections/starter-kits"
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
