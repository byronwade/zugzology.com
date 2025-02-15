import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getBlogByHandle, getAllBlogPosts, getProducts } from "@/lib/actions/shopify";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { RelatedPosts } from "@/components/blog/related-posts";
import { findRelatedPosts } from "@/lib/utils/related-posts";
import { ProductAd } from "@/components/blog/product-ad";
import { BlogBreadcrumb } from "@/components/blog/blog-breadcrumb";
import { ProductRecommendations } from "@/components/products/sections/recommendations/product-recommendations";

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
	const wordCount = article.contentHtml.replace(/<[^>]*>/g, "").split(/\s+/).length;
	const readingTime = Math.ceil(wordCount / 200);

	const duration = performance.now() - startTime;
	console.log(`⚡ [Blog Post ${article.title}] ${duration.toFixed(2)}ms`, {
		hasImage: !!article.image,
		contentSize: (article.contentHtml.length / 1024).toFixed(2) + "KB",
		relatedPosts: relatedPosts?.length ?? 0,
		featuredProducts: featuredProducts?.length ?? 0,
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
		<section className="w-full min-h-screen bg-gray-100 dark:bg-gray-900">
			{/* Main Content Area */}
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-[minmax(0,650px)_300px] xl:grid-cols-[minmax(0,800px)_300px] gap-8 mx-auto justify-center">
					{/* Main Article Content */}
					<article className="prose prose-neutral dark:prose-invert max-w-none w-full mx-auto">
						<div className="max-w-2xl mx-auto">
							<h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl">{article.title}</h1>

							<div className="not-prose">
								<div className="flex items-center whitespace-nowrap overflow-x-auto scrollbar-hide">
									<BlogBreadcrumb blogHandle={nextjs15Params.blog} blogTitle={blog.title} articleTitle={article.title} />
								</div>
							</div>

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

							{article.image && (
								<div className="not-prose">
									<div className="aspect-[16/9] relative overflow-hidden rounded-lg">
										<Image src={article.image.url} alt={article.image.altText || article.title} width={article.image.width} height={article.image.height} className="object-cover rounded-lg" priority />
									</div>
								</div>
							)}

							<div className="prose prose-neutral dark:prose-invert lg:prose-lg" dangerouslySetInnerHTML={{ __html: article.contentHtml }} />
						</div>
					</article>

					{/* Featured Products Sidebar */}
					<aside className="w-full max-w-[300px] mx-auto lg:max-w-none">
						<div className="sticky top-[126px] space-y-6">{featuredProducts?.length > 0 && <ProductAd products={featuredProducts.slice(0, 3)} />}</div>
					</aside>
				</div>

				{/* Product Recommendations and Related Content Section */}
				<div className="w-full -mx-4 sm:-mx-6 lg:-mx-8">
					<ProductRecommendations featuredProducts={featuredProducts} relatedPosts={relatedPosts} currentPost={currentPostWithBlog} blogHandle={nextjs15Params.blog} />
				</div>
			</div>
		</section>
	);
}
