import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Link } from "@/components/ui/link";
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

export async function generateMetadata({ params }: { params: { blog: string; slug: string } }): Promise<Metadata> {
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

export default async function BlogPostPage({ params }: { params: { blog: string; slug: string } }) {
	const startTime = performance.now();
	const nextjs15Params = await params;
	const blog = await getBlogByHandle(nextjs15Params.blog);
	const article = await getArticleByHandle(nextjs15Params.blog, nextjs15Params.slug);

	if (!blog || !article) {
		console.log(`❌ [Blog Post] Not found: ${params.blog}/${params.slug}`);
		return notFound();
	}

	// Get all posts from all blogs for related posts
	const allPosts = await getAllBlogPosts();
	const currentPostWithBlog = {
		...article,
		blogHandle: nextjs15Params.blog,
		blogTitle: blog.title,
	};
	const relatedPosts = allPosts?.length > 0 ? findRelatedPosts(currentPostWithBlog, allPosts) : [];

	// Get featured products
	const allProducts = await getProducts();
	const featuredProducts =
		allProducts?.length > 0
			? allProducts
					.filter((product) => product && !product.isGiftCard) // Only show non-gift card products and ensure product exists
					.sort(() => Math.random() - 0.5) // Randomize order
					.slice(0, 5) // Take first 5 products
			: [];

	// Calculate reading time (assuming average reading speed of 200 words per minute)
	const wordCount = article.content.split(/\s+/).length;
	const readingTime = Math.ceil(wordCount / 200);

	const duration = performance.now() - startTime;
	console.log(`⚡ [Blog Post ${article.title}] ${duration.toFixed(2)}ms`, {
		hasImage: !!article.image,
		contentSize: (article.content.length / 1024).toFixed(2) + "KB",
		relatedPosts: relatedPosts?.length ?? 0,
		featuredProducts: featuredProducts?.length ?? 0,
	});

	// Generate structured data
	const articleStructuredData: WithContext<BlogPosting> = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: article.title,
		description: article.excerpt,
		articleBody: article.content,
		wordCount: wordCount,
		datePublished: new Date(article.publishedAt).toISOString(),
		dateModified: article.updatedAt ? new Date(article.updatedAt).toISOString() : new Date(article.publishedAt).toISOString(),
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
			"@id": `https://zugzology.com/blogs/${blog.handle}/${article.handle}`,
		},
		image: article.image ? article.image.url : undefined,
		keywords: [blog.title, "mushroom cultivation", "mycology", "growing guide"].concat(article.tags || []),
		inLanguage: "en-US",
		isAccessibleForFree: true,
		license: "https://creativecommons.org/licenses/by-nc/4.0/",
		timeRequired: `PT${readingTime}M`,
		articleSection: blog.title,
	};

	// Update the breadcrumb structured data
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
				item: `https://zugzology.com/blogs/${blog.handle}`,
			},
			{
				"@type": "ListItem",
				position: 4,
				name: article.title,
				item: `https://zugzology.com/blogs/${blog.handle}/${article.handle}`,
			},
		],
	};

	return (
		<>
			<script {...jsonLdScriptProps(articleStructuredData)} />
			<script {...jsonLdScriptProps(breadcrumbStructuredData)} />
			{/* Main Article Section with Sidebar */}
			<section className="w-full min-h-screen">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="grid grid-cols-1 xl:grid-cols-[70%_30%] gap-8 max-w-7xl mx-auto">
						<div className="w-full">
							<article>
								<h1 className="mb-4 text-5xl font-black text-gray-900 dark:text-gray-100 sm:text-5xl">{article.title}</h1>

								<div className="not-prose">
									<div className="flex items-center whitespace-nowrap overflow-x-auto scrollbar-hide">
										<BlogBreadcrumb blogHandle={nextjs15Params.blog} blogTitle={blog.title} articleTitle={article.title} />
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
										<BlogQuickActions title={article.title} url={`https://zugzology.com/blogs/${nextjs15Params.blog}/${nextjs15Params.slug}`} />
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
						</div>

						{/* Sidebar */}
						<aside className="hidden xl:block">
							<div className="space-y-6">
								{/* Featured Products */}
								{featuredProducts?.length > 0 && <ProductAd products={featuredProducts.slice(0, 6)} />}

								{/* Advertisement */}
								<AdPlaceholder type="advertise" />

								{/* Bulk Discount Advertisement */}
								<a href="https://allinonegrowbags.com" target="_blank" rel="noopener noreferrer sponsored" className="block w-full rounded-xl overflow-hidden border border-foreground/10 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
									<div className="relative">
										{/* Advertisement Label */}
										<div className="bg-purple-600 text-white text-center py-2 text-sm font-bold">ADVERTISEMENT</div>

										{/* Product Image */}
										<div className="relative aspect-square">
											<Image src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sterile-all-in-one-mushroom-grow-bag-4-lbs-substrate-and-grain-filter-patch-112491-Hkoucg5alJXunr83eIolGhCMiHCxR3-FeibS7qNAKjyL9XrVQosZdlm9U2qlF.webp" alt="All-in-One Mushroom Grow Bag" fill className="object-cover" priority />
											<div className="absolute top-2 right-2 p-2 rounded-full bg-purple-500">
												<Percent className="w-6 h-6 text-white" />
											</div>
										</div>

										{/* Content */}
										<div className="p-4 space-y-4">
											<div>
												<h3 className="text-xl font-bold tracking-tight leading-tight mb-1">All-in-One Mushroom Grow Bags</h3>
												<p className="text-sm text-gray-600 dark:text-gray-400">Premium 4 lbs bags with sterilized substrate</p>
											</div>

											{/* Bulk Discount Information */}
											<div className="p-3 rounded-lg border border-purple-200 bg-purple-50 dark:border-purple-700 dark:bg-gray-800">
												<h4 className="font-bold mb-2 text-purple-600">Bulk Discounts:</h4>
												<ul className="text-sm space-y-1">
													<li>2+ Bags: 15% OFF</li>
													<li>5+ Bags: 25% OFF</li>
													<li>10+ Bags: 30% OFF</li>
													<li>20+ Bags: 35% OFF</li>
												</ul>
											</div>

											<div className="flex items-center justify-between">
												<span className="text-2xl font-bold">$24.95</span>
												<span className="text-sm text-purple-600">Free Shipping</span>
											</div>

											<button className="w-full py-2 rounded-md font-medium flex items-center justify-center gap-2 bg-purple-600 text-white">
												Shop Now <ExternalLink className="w-4 h-4" />
											</button>
										</div>

										{/* External Link Notice */}
										<div className="text-xs text-center py-2 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">Links to: allinonegrowbags.com</div>
									</div>
								</a>
							</div>
						</aside>
					</div>
				</div>
			</section>

			{/* Related Content Sections */}
			<ProductRecommendations featuredProducts={featuredProducts} relatedPosts={relatedPosts} currentPost={currentPostWithBlog} blogHandle={nextjs15Params.blog} />
		</>
	);
}
