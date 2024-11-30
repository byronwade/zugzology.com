"use client";

import React, { useState } from "react";
import Image from "next/image";
import ProductList from "@/components/ui/product-list";
import type { ShopifyCollection } from "@/lib/types";
import { ProductsHeader } from "@/components/products/products-header";

interface CollectionContentProps {
	collection: ShopifyCollection & { products: any[] };
}

export function CollectionContent({ collection }: CollectionContentProps) {
	const [view, setView] = useState<"grid" | "list">("grid");

	return (
		<div className="py-8 w-full max-w-none">
			{collection.image && (
				<div className="mb-8 aspect-[3/1] w-full overflow-hidden rounded-lg">
					<Image
						src={collection.image.url}
						alt={collection.image.altText || collection.title}
						width={1200}
						height={400}
						className="h-full w-full object-cover"
						priority
						onError={(e) => {
							console.error("Image load error:", e);
							e.currentTarget.src = "https://placehold.co/1200x400?text=Image+Not+Available";
						}}
					/>
				</div>
			)}

			<ProductsHeader
				title={collection.title}
				count={collection.products.length}
				onSort={(value) => {
					console.log("Sort by:", value);
				}}
				view={view}
				onViewChange={setView}
			/>

			{collection.description && <p className="text-muted-foreground mb-6">{collection.description}</p>}

			<ProductList products={collection.products} collectionHandle={collection.handle} view={view} />
		</div>
	);
}
