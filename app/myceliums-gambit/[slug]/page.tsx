import { Suspense } from "react";
import { headers } from "next/headers";
import { PostContent } from "@/components/myceliums-gambit/post-content";
import { PostSkeleton } from "@/components/myceliums-gambit/post-skeleton";
import { getMyceliumsGambitPost } from "@/actions/getMyceliumsGambitPost";
import { notFound } from "next/navigation";

export const revalidate = 3600;
export const runtime = "edge";
export const preferredRegion = "auto";

export async function generateMetadata({ params }: { params: { slug: string } }) {
	const next15Slug = await params;
	const headersList = await headers();
	const domain = headersList.get("host") || "";
	const post = await getMyceliumsGambitPost(next15Slug.slug);

	if (!post) {
		return {
			title: "Post Not Found | Zugzology",
			description: "The requested post could not be found.",
		};
	}

	return {
		title: `${post.title} | Mycelium's Gambit`,
		description: post.excerpt || "Read our latest articles about mushrooms and mycology",
		openGraph: {
			title: post.title,
			description: post.excerpt || "Read our latest articles about mushrooms and mycology",
			url: `https://${domain}/myceliums-gambit/${post.handle}`,
			images: post.image ? [{ url: post.image.url, alt: post.image.altText || post.title }] : [],
		},
	};
}

export default async function PostPage({ params }: { params: { slug: string } }) {
	const next15Slug = await params;
	const post = await getMyceliumsGambitPost(next15Slug.slug);

	if (!post) {
		notFound();
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<Suspense fallback={<PostSkeleton />}>
				<PostContent post={post} />
			</Suspense>
		</div>
	);
}
