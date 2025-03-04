"use server";

import { cache } from "react";

export interface ShopifyBlog {
	id: string;
	handle: string;
	title: string;
	articles?: {
		edges: Array<{
			node: {
				id: string;
				handle: string;
				title: string;
				excerpt: string;
				publishedAt: string;
			};
		}>;
	};
}

export interface ShopifyCollection {
	id: string;
	handle: string;
	title: string;
	description: string;
	image?: {
		url: string;
		altText?: string;
	};
	metafields?: {
		nodes: Array<{
			id: string;
			namespace: string;
			key: string;
			value: string;
			type: string;
		}>;
	};
}

export interface ShopifyProduct {
	id: string;
	handle: string;
	title: string;
	description: string;
	productType: string;
	vendor: string;
	tags: string[];
	images: Array<{
		url: string;
		altText?: string;
	}>;
	priceRange: {
		minVariantPrice: {
			amount: string;
			currencyCode: string;
		};
		maxVariantPrice: {
			amount: string;
			currencyCode: string;
		};
	};
	compareAtPriceRange?: {
		minVariantPrice: {
			amount: string;
			currencyCode: string;
		};
		maxVariantPrice: {
			amount: string;
			currencyCode: string;
		};
	};
}

export interface ShopifyCart {
	id: string;
	checkoutUrl: string;
	totalQuantity: number;
	cost: {
		subtotalAmount: {
			amount: string;
			currencyCode: string;
		};
		totalAmount: {
			amount: string;
			currencyCode: string;
		};
	};
	lines: {
		edges: Array<{
			node: {
				id: string;
				quantity: number;
				merchandise: {
					id: string;
					title: string;
					product: {
						id: string;
						title: string;
						handle: string;
						images: {
							edges: Array<{
								node: {
									url: string;
									altText: string | null;
								};
							}>;
						};
					};
				};
				cost: {
					totalAmount: {
						amount: string;
						currencyCode: string;
					};
				};
			};
		}>;
	};
}

export interface CartItem {
	merchandiseId: string;
	quantity: number;
	isPreOrder?: boolean;
}

// Get blogs with caching
export const getBlogs = cache(async (): Promise<ShopifyBlog[]> => {
	try {
		// For now, return a static blog structure
		return [
			{
				id: "blog1",
				handle: "guides",
				title: "Mushroom Growing Guides",
			},
			{
				id: "blog2",
				handle: "tutorials",
				title: "Step-by-Step Tutorials",
			},
			{
				id: "blog3",
				handle: "tips",
				title: "Tips & Tricks",
			},
		];
	} catch (error) {
		console.error("Failed to fetch blogs:", error);
		return [];
	}
});

// Get all blog posts with caching
export const getAllBlogPosts = cache(async () => {
	try {
		// Return static blog posts
		return [
			{
				id: "post1",
				title: "Getting Started with Mushroom Growing",
				handle: "getting-started",
				excerpt: "Learn the basics of mushroom cultivation.",
				publishedAt: "2023-01-01",
				blog: {
					handle: "guides",
				},
			},
			{
				id: "post2",
				title: "Advanced Techniques for Mushroom Cultivation",
				handle: "advanced-techniques",
				excerpt: "Take your mushroom growing to the next level.",
				publishedAt: "2023-02-01",
				blog: {
					handle: "tutorials",
				},
			},
		];
	} catch (error) {
		console.error("Failed to fetch blog posts:", error);
		return [];
	}
});

// Get all collections with caching
export const getAllCollections = cache(async (): Promise<ShopifyCollection[]> => {
	try {
		// For now, return a static collection structure
		return [
			{
				id: "collection1",
				handle: "all-products",
				title: "All Products",
				description: "Browse our complete collection of mushroom growing supplies.",
				image: {
					url: "/placeholder.svg",
					altText: "All Products",
				},
			},
			{
				id: "collection2",
				handle: "new-arrivals",
				title: "New Arrivals",
				description: "Check out our latest mushroom growing products.",
				image: {
					url: "/placeholder.svg",
					altText: "New Arrivals",
				},
			},
			{
				id: "collection3",
				handle: "best-sellers",
				title: "Best Sellers",
				description: "Our most popular mushroom growing supplies.",
				image: {
					url: "/placeholder.svg",
					altText: "Best Sellers",
				},
			},
		];
	} catch (error) {
		console.error("Failed to fetch collections:", error);
		return [];
	}
});

// Get a specific collection by handle
export const getCollection = cache(async (handle: string): Promise<ShopifyCollection | null> => {
	try {
		const collections = await getAllCollections();
		return collections.find((collection) => collection.handle === handle) || null;
	} catch (error) {
		console.error(`Failed to fetch collection with handle ${handle}:`, error);
		return null;
	}
});

// Get products with caching
export const getProducts = cache(async (): Promise<ShopifyProduct[]> => {
	try {
		// For now, return a static product structure
		return [
			{
				id: "product1",
				handle: "mushroom-growing-kit",
				title: "Mushroom Growing Kit",
				description: "Complete kit for growing gourmet mushrooms at home.",
				productType: "Kit",
				vendor: "Zugzology",
				tags: ["beginner", "kit", "indoor"],
				images: [
					{
						url: "/placeholder.svg",
						altText: "Mushroom Growing Kit",
					},
				],
				priceRange: {
					minVariantPrice: {
						amount: "29.99",
						currencyCode: "USD",
					},
					maxVariantPrice: {
						amount: "29.99",
						currencyCode: "USD",
					},
				},
			},
			{
				id: "product2",
				handle: "mushroom-spawn",
				title: "Mushroom Spawn",
				description: "High-quality mushroom spawn for your growing projects.",
				productType: "Spawn",
				vendor: "Zugzology",
				tags: ["spawn", "intermediate"],
				images: [
					{
						url: "/placeholder.svg",
						altText: "Mushroom Spawn",
					},
				],
				priceRange: {
					minVariantPrice: {
						amount: "19.99",
						currencyCode: "USD",
					},
					maxVariantPrice: {
						amount: "19.99",
						currencyCode: "USD",
					},
				},
			},
		];
	} catch (error) {
		console.error("Failed to fetch products:", error);
		return [];
	}
});

// Get a specific product by handle
export const getProduct = cache(async (handle: string): Promise<ShopifyProduct | null> => {
	try {
		const products = await getProducts();
		return products.find((product) => product.handle === handle) || null;
	} catch (error) {
		console.error(`Failed to fetch product with handle ${handle}:`, error);
		return null;
	}
});

// Get products by IDs
export const getProductsByIds = cache(async (ids: string[]): Promise<ShopifyProduct[]> => {
	try {
		const products = await getProducts();
		return products.filter((product) => ids.includes(product.id));
	} catch (error) {
		console.error("Failed to fetch products by IDs:", error);
		return [];
	}
});

// Get product page data
export const getProductPageData = cache(async (handle: string) => {
	try {
		const product = await getProduct(handle);
		const products = await getProducts();
		const relatedProducts = products.filter((p) => p.handle !== handle).slice(0, 4);
		const recentPosts = await getAllBlogPosts();

		return {
			product,
			relatedProducts,
			recentPosts: recentPosts.slice(0, 3),
		};
	} catch (error) {
		console.error(`Failed to fetch product page data for ${handle}:`, error);
		return {
			product: null,
			relatedProducts: [],
			recentPosts: [],
		};
	}
});

// Cart functions
export const createCart = async (): Promise<ShopifyCart> => {
	// Create a mock cart
	return {
		id: "cart1",
		checkoutUrl: "/checkout",
		totalQuantity: 0,
		cost: {
			subtotalAmount: {
				amount: "0.00",
				currencyCode: "USD",
			},
			totalAmount: {
				amount: "0.00",
				currencyCode: "USD",
			},
		},
		lines: {
			edges: [],
		},
	};
};

export const getCart = async (cartId: string): Promise<ShopifyCart | null> => {
	// Return a mock cart
	return {
		id: cartId,
		checkoutUrl: "/checkout",
		totalQuantity: 0,
		cost: {
			subtotalAmount: {
				amount: "0.00",
				currencyCode: "USD",
			},
			totalAmount: {
				amount: "0.00",
				currencyCode: "USD",
			},
		},
		lines: {
			edges: [],
		},
	};
};

export const addToCart = async (cartId: string, items: CartItem[]): Promise<ShopifyCart> => {
	// Return a mock updated cart
	return {
		id: cartId,
		checkoutUrl: "/checkout",
		totalQuantity: items.reduce((total, item) => total + item.quantity, 0),
		cost: {
			subtotalAmount: {
				amount: "29.99",
				currencyCode: "USD",
			},
			totalAmount: {
				amount: "29.99",
				currencyCode: "USD",
			},
		},
		lines: {
			edges: items.map((item, index) => ({
				node: {
					id: `line${index + 1}`,
					quantity: item.quantity,
					merchandise: {
						id: item.merchandiseId,
						title: "Product Title",
						product: {
							id: "product1",
							title: "Product Title",
							handle: "product-handle",
							images: {
								edges: [
									{
										node: {
											url: "/placeholder.svg",
											altText: null,
										},
									},
								],
							},
						},
					},
					cost: {
						totalAmount: {
							amount: "29.99",
							currencyCode: "USD",
						},
					},
				},
			})),
		},
	};
};

export const updateCartLine = async (cartId: string, lineId: string, quantity: number): Promise<ShopifyCart> => {
	// Return a mock updated cart
	return {
		id: cartId,
		checkoutUrl: "/checkout",
		totalQuantity: quantity,
		cost: {
			subtotalAmount: {
				amount: "29.99",
				currencyCode: "USD",
			},
			totalAmount: {
				amount: "29.99",
				currencyCode: "USD",
			},
		},
		lines: {
			edges: [
				{
					node: {
						id: lineId,
						quantity: quantity,
						merchandise: {
							id: "merchandise1",
							title: "Product Title",
							product: {
								id: "product1",
								title: "Product Title",
								handle: "product-handle",
								images: {
									edges: [
										{
											node: {
												url: "/placeholder.svg",
												altText: null,
											},
										},
									],
								},
							},
						},
						cost: {
							totalAmount: {
								amount: "29.99",
								currencyCode: "USD",
							},
						},
					},
				},
			],
		},
	};
};

export const removeFromCart = async (cartId: string, lineIds: string[]): Promise<ShopifyCart> => {
	// Return a mock updated cart
	return {
		id: cartId,
		checkoutUrl: "/checkout",
		totalQuantity: 0,
		cost: {
			subtotalAmount: {
				amount: "0.00",
				currencyCode: "USD",
			},
			totalAmount: {
				amount: "0.00",
				currencyCode: "USD",
			},
		},
		lines: {
			edges: [],
		},
	};
};

// Additional functions to match imports in header.tsx
export const getSiteSettings = cache(async () => {
	return {
		title: "Zugzology",
		description: "Premium mushroom cultivation supplies",
		features: [],
		categories: [],
	};
});

export const getPaginatedProducts = cache(async () => {
	const products = await getProducts();
	return {
		products,
		pageInfo: {
			hasNextPage: false,
			hasPreviousPage: false,
		},
	};
});
