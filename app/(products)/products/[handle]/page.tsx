import { getProductPageData } from "@/lib/actions/shopify";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductContent } from "@/components/products/sections/product-content";
import { cache } from "react";
import type { ShopifyImage } from "@/lib/types";

interface ProductPageProps {
	params: {
		handle: string;
	};
	searchParams?: {
		variant?: string;
	};
}

interface ImageNode {
	node: ShopifyImage;
}

// Cache the product data at the page level
const getPageData = cache(async (handle: string) => {
	return getProductPageData(handle);
});

// Error fallback component
const ProductError = () => (
	<div className="w-full min-h-[50vh] flex items-center justify-center">
		<div className="text-center">
			<h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
			<p className="text-muted-foreground">Unable to load product information</p>
		</div>
	</div>
);

// Generate metadata for the product
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
	const nextParams = await params;
	const { product } = await getPageData(nextParams.handle);

	if (!product) {
		return {
			title: "Product Not Found",
			description: "The requested product could not be found.",
		};
	}

	const title = `${product.title} | Zugzology`;
	const description = product.description || `Buy ${product.title} from Zugzology. Premium mushroom cultivation supplies and equipment.`;

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			type: "website",
			images:
				product.images?.edges?.map(({ node }: ImageNode) => ({
					url: node.url,
					width: node.width,
					height: node.height,
					alt: node.altText || product.title,
				})) || [],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: product.images?.edges?.map(({ node }: ImageNode) => node.url) || [],
		},
	};
}

export default async function ProductPage({ params }: ProductPageProps) {
	const nextParams = await params;
	const { product } = await getPageData(nextParams.handle);

	if (!product) {
		return notFound();
	}

	return <ProductContent product={product} />;
}
