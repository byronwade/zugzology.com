import { Suspense } from "react";
import { getAllBlogPosts } from "@/lib/api/shopify/actions";
import type { ShopifyProduct } from "@/lib/types";
import { ProductContentClient } from "./product-content-client";
import { ProgressiveSectionsManager } from "./sections/progressive-sections-manager";

interface ProductWithRecommendations extends ShopifyProduct {
	recommendations?: {
		nodes: ShopifyProduct[];
	};
}

type ProductServerWrapperProps = {
	product: ProductWithRecommendations;
	relatedProducts: ShopifyProduct[];
};

// Loading fallback component
function ProductLoading() {
	return (
		<div className="w-full animate-pulse space-y-8">
			<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
				<div className="aspect-square rounded-lg bg-muted" />
				<div className="space-y-4">
					<div className="h-8 w-3/4 rounded bg-muted" />
					<div className="h-4 w-1/2 rounded bg-muted" />
					<div className="h-24 w-full rounded bg-muted" />
				</div>
			</div>
		</div>
	);
}

// Server component to fetch blog posts
async function RecentBlogPosts() {
	try {
		const allPosts = await getAllBlogPosts();
		// Sort by date, newest first
		const sortedPosts = [...allPosts].sort(
			(a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
		);
		const recentPosts = sortedPosts.slice(0, 3);

		// Ensure each post has a blogHandle property
		const postsWithBlogHandle = recentPosts.map((post) => ({
			...post,
			// Use blog.handle if available, otherwise fallback to blogHandle or "blog"
			blogHandle: post.blog?.handle || post.blogHandle || "blog",
		}));

		// Pass the posts to the client component through props
		return <input id="recent-blog-posts-data" type="hidden" value={JSON.stringify(postsWithBlogHandle)} />;
	} catch (_error) {
		return null;
	}
}

export async function ProductServerWrapper({ product, relatedProducts }: ProductServerWrapperProps) {
	// Enhance the product with recommendations
	const productWithRecommendations = {
		...product,
		recommendations: {
			nodes: relatedProducts || [],
		},
	};

	return (
		<>
			{/* Pre-fetch blog posts server-side */}
			<Suspense fallback={null}>
				<RecentBlogPosts />
			</Suspense>

			{/* Render the client component with pre-fetched data */}
			<Suspense fallback={<ProductLoading />}>
				<ProductContentClient product={productWithRecommendations} />
			</Suspense>

			{/* Render dynamic product sections - guaranteed 6 sections */}
			<ProgressiveSectionsManager product={product} relatedProducts={relatedProducts} />
		</>
	);
}
