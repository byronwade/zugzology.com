import { Suspense } from "react";
import { getCollection } from "@/lib/actions/shopify";
import CollectionPage from "./page";

async function CollectionContent({ slug }: { slug: string }) {
	const collection = await getCollection(slug);
	return <CollectionPage initialCollection={collection} />;
}

export default function CollectionServerPage({ params }: { params: { slug: string } }) {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<CollectionContent slug={params.slug} />
		</Suspense>
	);
}
