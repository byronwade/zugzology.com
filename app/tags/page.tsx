import { Suspense } from "react";
import { TagsList } from "@/components/tags/tags-list";
import { unstable_cache } from "@/lib/unstable-cache";
import { shopifyClient } from "@/lib/shopify";
import { getTagsQuery } from "@/lib/queries/tags";

interface ProductNode {
	tags: string[];
}

interface TagsResponse {
	products: {
		edges: Array<{
			node: ProductNode;
		}>;
	};
}

const getTags = unstable_cache(
	async () => {
		try {
			const response = await shopifyClient.request<TagsResponse>(getTagsQuery);

			if (!response.data?.products?.edges) {
				throw new Error("No products found in response");
			}

			const tagCounts = response.data.products.edges.reduce((acc: Record<string, number>, { node }) => {
				node.tags.forEach((tag: string) => {
					acc[tag] = (acc[tag] || 0) + 1;
				});
				return acc;
			}, {});

			return Object.entries(tagCounts).map(([tag, count]) => ({
				tag,
				count,
			}));
		} catch (error) {
			console.error("Error fetching tags:", error);
			throw error;
		}
	},
	["tags"],
	{ revalidate: 60 * 60 * 2 }
);

export default async function TagsPage() {
	const tags = await getTags();

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-8">Product Tags</h1>
			<Suspense fallback={<div>Loading...</div>}>
				<TagsList tags={tags} />
			</Suspense>
		</div>
	);
}
