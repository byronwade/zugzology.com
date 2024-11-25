"use client";

import { Article } from "@/lib/types/shopify";
import { MyceliumsGambitPostCard } from "./myceliums-gambit-post-card";

export function MyceliumsGambitList({ posts }: { posts: Article[] }) {
	if (!posts || posts.length === 0) {
		return <div>No posts found.</div>;
	}

	return (
		<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{posts.map((post) => (
				<MyceliumsGambitPostCard key={post.id} post={post} />
			))}
		</div>
	);
}
