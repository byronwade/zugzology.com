import { getCollection } from "@/lib/actions/shopify";
import { notFound } from "next/navigation";
import { ProductsContentClient } from "@/components/products/products-content-client";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
	const nextjs15 = await params;
	const collection = await getCollection(nextjs15.slug);
	if (!collection) return notFound();

	return {
		title: `${collection.title} | Premium Mushroom Growing Supplies`,
		description: collection.description || `Shop our premium ${collection.title.toLowerCase()} collection. Find high-quality mushroom growing supplies and equipment.`,
		openGraph: {
			title: `${collection.title} | Premium Mushroom Growing Supplies`,
			description: collection.description || `Shop our premium ${collection.title.toLowerCase()} collection`,
			url: `https://zugzology.com/collections/${collection.handle}`,
			siteName: "Zugzology",
			type: "website",
			images: collection.image
				? [
						{
							url: collection.image.url,
							width: 1200,
							height: 630,
							alt: `${collection.title} Collection`,
						},
				  ]
				: [],
		},
		alternates: {
			canonical: `https://zugzology.com/collections/${collection.handle}`,
		},
	};
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CollectionPage({ params, searchParams }: { params: { slug: string }; searchParams?: { sort?: string; availability?: string; price?: string; category?: string } }) {
	const nextjs15 = await params;
	const collection = await getCollection(nextjs15.slug);

	if (!collection) {
		notFound();
	}

	// Initialize filtered products
	let filteredProducts = [...collection.products.edges];

	// Apply filters server-side
	if (searchParams) {
		// Apply availability filter
		if (searchParams.availability && searchParams.availability !== "all") {
			filteredProducts = filteredProducts.filter(({ node }) => {
				const firstVariant = node.variants?.edges?.[0]?.node;
				const quantity = firstVariant?.quantityAvailable || 0;
				const isInStock = quantity > 0;

				if (searchParams.availability === "in-stock") {
					return isInStock;
				} else if (searchParams.availability === "out-of-stock") {
					return !isInStock;
				}
				return true;
			});
		}

		// Apply price filter
		if (searchParams.price && searchParams.price !== "all") {
			filteredProducts = filteredProducts.filter(({ node }) => {
				const price = parseFloat(node.priceRange.minVariantPrice.amount);

				switch (searchParams.price) {
					case "under-25":
						return price < 25;
					case "25-50":
						return price >= 25 && price <= 50;
					case "50-100":
						return price > 50 && price <= 100;
					case "over-100":
						return price > 100;
					default:
						return true;
				}
			});
		}

		// Apply category filter
		if (searchParams.category) {
			const categories = searchParams.category.split(",");
			if (categories.length > 0) {
				filteredProducts = filteredProducts.filter(({ node }) => {
					const productType = (node.productType || "").toLowerCase().trim();
					return categories.some((category) => {
						const normalizedCategory = category.toLowerCase().trim();
						if (productType === normalizedCategory) return true;
						if (productType.includes(normalizedCategory)) return true;
						if (normalizedCategory === "merch" && productType.includes("merchandise")) return true;
						return false;
					});
				});
			}
		}

		// Apply sort
		if (searchParams.sort && searchParams.sort !== "featured") {
			filteredProducts.sort((a, b) => {
				const priceA = parseFloat(a.node.priceRange.minVariantPrice.amount);
				const priceB = parseFloat(b.node.priceRange.minVariantPrice.amount);

				switch (searchParams.sort) {
					case "price-asc":
						return priceA - priceB;
					case "price-desc":
						return priceB - priceA;
					case "name-asc":
						return a.node.title.localeCompare(b.node.title);
					case "name-desc":
						return b.node.title.localeCompare(a.node.title);
					default:
						return 0;
				}
			});
		}
	}

	// Create filtered collection
	const filteredCollection = {
		...collection,
		products: {
			edges: filteredProducts,
		},
	};

	const collectionJsonLd = {
		"@context": "https://schema.org",
		"@type": "CollectionPage",
		name: collection.title,
		description: collection.description || `Shop our premium ${collection.title.toLowerCase()} collection`,
		url: `https://zugzology.com/collections/${collection.handle}`,
		image: collection.image?.url,
		numberOfItems: filteredProducts.length,
		breadcrumb: {
			"@type": "BreadcrumbList",
			itemListElement: [
				{
					"@type": "ListItem",
					position: 1,
					name: "Home",
					item: "https://zugzology.com",
				},
				{
					"@type": "ListItem",
					position: 2,
					name: "Collections",
					item: "https://zugzology.com/collections",
				},
				{
					"@type": "ListItem",
					position: 3,
					name: collection.title,
					item: `https://zugzology.com/collections/${collection.handle}`,
				},
			],
		},
	};

	return (
		<section aria-label={`${collection.title} Collection`} className="collection-section">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(collectionJsonLd),
				}}
			/>
			<ProductsContentClient collection={filteredCollection} />
		</section>
	);
}
