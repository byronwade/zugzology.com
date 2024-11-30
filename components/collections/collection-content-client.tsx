"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ShopifyCollection, ShopifyProduct } from "@/lib/types";
import ProductList from "@/components/ui/product-list";
import { FilterState } from "@/components/sidebar/sidebar";

interface CollectionContentClientProps {
	collection: ShopifyCollection;
}

export function CollectionContentClient({ collection }: CollectionContentClientProps) {
	const searchParams = useSearchParams();
	const [view, setView] = useState<"grid" | "list">("grid");
	const [filteredProducts, setFilteredProducts] = useState(collection.products.edges.map((edge) => edge.node));

	// Client-side filtering
	useEffect(() => {
		const filters: FilterState = {
			categories: searchParams.get("categories")?.split(",").filter(Boolean) || [],
			brands: searchParams.get("brands")?.split(",").filter(Boolean) || [],
			priceRange: [Number(searchParams.get("priceRange")) || 0],
			ratings: searchParams.get("ratings")?.split(",").filter(Boolean) || [],
			sortBy: searchParams.get("sortBy") || "manual",
			tags: searchParams.get("tags")?.split(",").filter(Boolean) || [],
		};

		let filtered = collection.products.edges
			.map((edge) => edge.node)
			.filter((product) => {
				let matches = true;

				// Price filter
				if (filters.priceRange[0] > 0) {
					const price = parseFloat(product.priceRange.minVariantPrice.amount);
					matches = matches && price >= filters.priceRange[0];
				}

				// Category filter
				if (filters.categories.length > 0) {
					matches = matches && filters.categories.some((category) => product.productType.toLowerCase().includes(category.toLowerCase()));
				}

				// Brand filter
				if (filters.brands.length > 0) {
					matches = matches && filters.brands.some((brand) => product.vendor.toLowerCase().includes(brand.toLowerCase()));
				}

				// Tags filter
				if (filters.tags.length > 0) {
					matches = matches && filters.tags.some((tag) => product.tags.some((productTag) => productTag.toLowerCase().includes(tag.toLowerCase())));
				}

				// Rating filter
				if (filters.ratings.length > 0) {
					const minRating = Math.min(...filters.ratings.map((r) => parseInt(r.split("-")[1])));
					// Exclude products with no reviews and ensure rating meets minimum
					matches = matches && typeof product.rating === "number" && product.rating > 0 && (minRating === 5 ? product.rating === 5 : product.rating >= minRating);
				}

				return matches;
			});

		// Apply sorting
		filtered = sortProducts(filtered, filters.sortBy);

		console.log("Applied filters:", filters);
		console.log("Filtered products:", filtered.length);

		setFilteredProducts(filtered);
	}, [collection.products.edges, searchParams]);

	// Helper function to sort products
	const sortProducts = (products: ShopifyProduct[], sortBy: string) => {
		return [...products].sort((a, b) => {
			const priceA = parseFloat(a.priceRange.minVariantPrice.amount);
			const priceB = parseFloat(b.priceRange.minVariantPrice.amount);
			const dateA = new Date(a.publishedAt).getTime();
			const dateB = new Date(b.publishedAt).getTime();

			switch (sortBy) {
				case "price-asc":
					return priceA - priceB;
				case "price-desc":
					return priceB - priceA;
				case "title-asc":
					return a.title.localeCompare(b.title);
				case "title-desc":
					return b.title.localeCompare(a.title);
				case "date-desc":
					return dateB - dateA;
				case "date-asc":
					return dateA - dateB;
				default:
					return 0; // Keep original order for "manual" (Featured)
			}
		});
	};

	return (
		<div className="w-full">
			<ProductList products={filteredProducts} view={view} />
		</div>
	);
}
