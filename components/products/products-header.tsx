"use client";

import React from "react";
import { ProductsHeaderWrapper } from "./products-header-wrapper";

const ProductsHeader = React.memo(({ title, description, defaultSort }: { title: string; description: string; defaultSort: string }) => {
	return <ProductsHeaderWrapper title={title} description={description} defaultSort={defaultSort} />;
});

ProductsHeader.displayName = "ProductsHeader";

export { ProductsHeader };
