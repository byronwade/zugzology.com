import { NextResponse } from "next/server";
import { getAllCollections } from "@/lib/actions/shopify";

// Dynamic rendering and revalidation handled by dynamicIO

/**
 * Feeds the client-side search index, which matches on title and description only.
 *
 * getAllCollections() returns each collection with ten fully hydrated products
 * nested inside it (descriptionHtml, media, variants, images, metafields), so the
 * unprojected response was ~712 KB for eight collections — 139 KB per collection,
 * of which 547 bytes was the collection itself. Everything the index cannot read
 * is dropped here. Server-side callers of getAllCollections() are unaffected and
 * still receive the full shape.
 */
export async function GET() {
	try {
		const collections = await getAllCollections();

		const searchIndex = (collections ?? []).filter(Boolean).map((collection) => ({
			id: collection.id,
			title: collection.title,
			handle: collection.handle,
			description: collection.description,
			image: collection.image ? { altText: collection.image.altText, url: collection.image.url } : null,
			productCount: collection.products?.nodes?.length ?? 0,
		}));

		return NextResponse.json({ collections: searchIndex });
	} catch (_error) {
		return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
	}
}
