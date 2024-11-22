import { Suspense } from "react";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { unstable_cache } from "@/lib/unstable-cache";
import { shopifyClient } from "@/lib/shopify";
import { ProductSkeleton } from "@/components/products/product-skeleton";
import { ProductDetails } from "@/components/products/product-details";

export const revalidate = 3600; // 1 hour
export const runtime = "edge";
export const preferredRegion = "auto";

const getProductQuery = `#graphql
  query GetProduct($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      options {
        id
        name
        values
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      variants(first: 250) {
        edges {
          node {
            id
            title
            availableForSale
            selectedOptions {
              name
              value
            }
            price {
              amount
              currencyCode
            }
          }
        }
      }
      images(first: 20) {
        edges {
          node {
            url
            altText
            width
            height
            id
            originalSrc
            transformedSrc(
              maxWidth: 1920
              maxHeight: 1080
              crop: CENTER
              preferredContentType: WEBP
            )
          }
        }
      }
      availableForSale
      vendor
      productType
      tags
    }
  }
`;

const getProduct = unstable_cache(
	async (handle: string) => {
		try {
			const response = await shopifyClient.request(getProductQuery, {
				variables: { handle },
			});

			if (!response.data?.product) {
				return null;
			}

			return response.data.product;
		} catch (error) {
			console.error("Error fetching product:", error);
			throw error;
		}
	},
	["product"],
	{ revalidate: 60 * 60 * 2 } // 2 hours
);

export async function generateMetadata({ params }: { params: { handle: string } }) {
	const next15Handle = await params;
	const headersList = await headers();
	const domain = headersList.get("host") || "";
	const product = await getProduct(next15Handle.handle);

	if (!product) {
		return {
			title: "Product Not Found | Zugzology",
			description: "The requested product could not be found.",
		};
	}

	const firstImage = product.images.edges[0]?.node;

	return {
		title: `${product.title} | Zugzology`,
		description: product.description || "Shop our selection of mushroom products",
		openGraph: {
			title: product.title,
			description: product.description || "Shop our selection of mushroom products",
			url: `https://${domain}/products/${product.handle}`,
			images: firstImage ? [{ url: firstImage.url, alt: firstImage.altText || product.title }] : [],
		},
	};
}

export default async function ProductPage({ params }: { params: { handle: string } }) {
	const next15Handle = await params;
	const product = await getProduct(next15Handle.handle);

	if (!product) {
		notFound();
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<Suspense fallback={<ProductSkeleton />}>
				<ProductDetails product={product} priority={true} />
			</Suspense>
		</div>
	);
}
