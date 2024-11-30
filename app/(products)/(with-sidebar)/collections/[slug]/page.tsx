import React, { Suspense } from "react";
import { getCollection } from "@/lib/actions/shopify";
import { notFound } from "next/navigation";
import { ErrorBoundary } from "@/components/error-boundary";
import type { Metadata } from "next";
import { CollectionContentClient } from "@/components/collections/collection-content-client";

interface PageProps {
	params: {
		slug: string;
	};
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const nextjs15 = await params;
	const collection = await getCollection(nextjs15.slug);

	if (!collection) return notFound();

	return {
		title: collection.title,
		description: collection.description,
		openGraph: {
			title: collection.title,
			description: collection.description,
		},
	};
}

function CollectionLoading() {
	return (
		<div className="w-full h-screen flex items-center justify-center">
			<div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary" />
		</div>
	);
}

async function CollectionContent({ slug }: { slug: string }) {
	const nextjs15 = await slug;
	const collection = await getCollection(nextjs15);

	if (!collection) return notFound();

	return <CollectionContentClient collection={collection} />;
}

export default async function CollectionPage({ params }: PageProps) {
	const nextjs15 = await params;
	return (
		<div className="w-full px-4 py-8">
			<ErrorBoundary fallback={<div className="text-center text-red-600">Error loading collection</div>}>
				<Suspense fallback={<CollectionLoading />}>
					<CollectionContent slug={nextjs15.slug} />
				</Suspense>
			</ErrorBoundary>
		</div>
	);
}
