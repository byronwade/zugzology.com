"use client";

import React, { useState } from "react";
import ProductList from "@/components/ui/product-list";
import { ProductsHeader } from "@/components/products/products-header";

interface ProductsContentProps {
	products: any[];
}

export function ProductsContent({ products }: ProductsContentProps) {
	const [view, setView] = useState<"grid" | "list">("grid");

	return (
		<div className="flex-1 w-full max-w-none px-4">
			<ProductsHeader title="Our Products" count={products.length} view={view} onViewChange={setView} />
			<ProductList products={products} view={view} />
		</div>
	);
}
