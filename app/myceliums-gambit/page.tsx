import { Suspense } from "react";
import { MyceliumsGambitList } from "@/components/myceliums-gambit/myceliums-gambit-list";
import { MyceliumsGambitSkeleton } from "@/components/myceliums-gambit/myceliums-gambit-skeleton";
import { getMyceliumsGambitPosts } from "@/actions/getMyceliumsGambitPosts";

export const revalidate = 3600;
export const runtime = "edge";
export const preferredRegion = "auto";

export default async function MyceliumsGambitPage() {
	const posts = await getMyceliumsGambitPosts(250);

	return (
		<div className="container mx-auto px-4">
			<Suspense fallback={<MyceliumsGambitSkeleton />}>
				<MyceliumsGambitList posts={posts} />
			</Suspense>
		</div>
	);
}
