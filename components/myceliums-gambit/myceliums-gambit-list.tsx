"use client";

import { type Article } from "@/lib/types/shopify";
import { MyceliumsGambitPostCard } from "./myceliums-gambit-post-card";

interface MyceliumsGambitListProps {
	posts: Article[];
}

export function MyceliumsGambitList({ posts }: MyceliumsGambitListProps) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
			{posts.map((post) => (
				<MyceliumsGambitPostCard key={post.id} post={post} />
			))}
		</div>
	);
}
