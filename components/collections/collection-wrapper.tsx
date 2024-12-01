"use client";

import React from "react";
import { CollectionContentClient } from "./collection-content-client";
import type { ShopifyCollection, ShopifyProduct } from "@/lib/types";

interface CollectionWrapperProps {
	collection: ShopifyCollection & {
		products: {
			edges: Array<{
				node: ShopifyProduct;
			}>;
		};
	};
}

export function CollectionWrapper({ collection }: CollectionWrapperProps) {
	return (
		<div className="collection-wrapper" itemScope itemType="https://schema.org/CollectionPage">
			{/* Collection metadata */}
			<meta itemProp="name" content={collection.title} />
			<meta itemProp="description" content={collection.description || `Shop our premium ${collection.title.toLowerCase()} collection`} />
			<meta itemProp="url" content={`https://zugzology.com/collections/${collection.handle}`} />
			{collection.image && <meta itemProp="image" content={collection.image.url} />}

			{/* Collection content */}
			<CollectionContentClient collection={collection} />
		</div>
	);
}
