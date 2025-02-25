import { Suspense } from "react";
import { ProductContentClient } from "./product-content-client";
import { ShopifyProduct, ShopifyBlogArticle } from "@/lib/types";
import { getAllBlogPosts } from "@/lib/actions/shopify";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductWithRecommendations extends ShopifyProduct {
	recommendations?: {
		nodes: ShopifyProduct[];
	};
}

interface ProductServerWrapperProps {
	product: ProductWithRecommendations;
	relatedProducts: ShopifyProduct[];
}

// Loading fallback component
function ProductLoading() {
	return (
		<div className="w-full space-y-8 animate-pulse">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				<div className="aspect-square bg-muted rounded-lg"></div>
				<div className="space-y-4">
					<div className="h-8 bg-muted rounded w-3/4"></div>
					<div className="h-4 bg-muted rounded w-1/2"></div>
					<div className="h-24 bg-muted rounded w-full"></div>
				</div>
			</div>
		</div>
	);
}

// Server component to fetch blog posts
async function RecentBlogPosts() {
	const posts = await getAllBlogPosts();
	const recentPosts = posts.slice(0, 3);

	// Pass the posts to the client component through props
	return <input type="hidden" id="recent-blog-posts-data" value={JSON.stringify(recentPosts)} />;
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
		</>
	);
}
