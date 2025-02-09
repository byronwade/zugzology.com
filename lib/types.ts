export interface ShopifyProductOption {
	id: string;
	name: string;
	values: string[];
}

export interface ShopifyProduct {
	id: string;
	title: string;
	description: string;
	descriptionHtml: string;
	handle: string;
	availableForSale: boolean;
	productType: string;
	vendor: string;
	tags: string[];
	rating?: number;
	reviewsCount?: number;
	options: ShopifyProductOption[];
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
	variants: {
		edges: Array<{
			node: ShopifyProductVariant;
		}>;
	};
	images: {
		edges: Array<{
			node: ShopifyImage;
		}>;
	};
	media: {
		edges: Array<{
			node: {
				mediaContentType: "VIDEO" | "IMAGE" | "EXTERNAL_VIDEO";
				alt: string | null;
				previewImage?: {
					url: string;
				};
				sources?: Array<{
					url: string;
					mimeType: string;
				}>;
				embedUrl?: string;
			};
		}>;
	};
	metafields?: Array<{
		key: string;
		value: string;
	}>;
	publishedAt: string;
}

export interface ShopifyCollection {
	id: string;
	title: string;
	description: string;
	handle: string;
	products: {
		edges: Array<{
			node: ShopifyProduct;
		}>;
	};
	image?: {
		url: string;
		altText: string | null;
		width: number;
		height: number;
	};
}

export interface ShopifyProductVariant {
	id: string;
	title: string;
	availableForSale: boolean;
	quantityAvailable: number;
	price: {
		amount: string;
		currencyCode: string;
	};
	compareAtPrice?: {
		amount: string;
		currencyCode: string;
	};
	selectedOptions: Array<{
		name: string;
		value: string;
	}>;
	image?: {
		url: string;
		altText: string | null;
		width?: number;
		height?: number;
	};
}

export interface ShopifyImage {
	url: string;
	altText: string | null;
	width?: number;
	height?: number;
	variantIds?: string[];
}

export interface ShopifyBlogArticle {
	id: string;
	title: string;
	handle: string;
	content: string;
	contentHtml: string;
	excerpt: string;
	publishedAt: string;
	author: {
		name: string;
	};
	image?: {
		url: string;
		altText: string;
		width: number;
		height: number;
	};
}

export interface ShopifyBlog {
	id: string;
	title: string;
	handle: string;
	articles: {
		edges: Array<{
			node: ShopifyBlogArticle;
		}>;
	};
}

export type ShopifyCart = Cart;

export interface Cart {
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
		totalTaxAmount: {
			amount: string;
			currencyCode: string;
		};
	};
	lines: {
		edges: Array<{
			node: {
				id: string;
				quantity: number;
				attributes?: Array<{
					key: string;
					value: string;
				}>;
				cost: {
					totalAmount: {
						amount: string;
						currencyCode: string;
					};
				};
				merchandise: {
					id: string;
					title: string;
					price: {
						amount: string;
						currencyCode: string;
					};
					product: {
						id: string;
						title: string;
						handle: string;
						images: {
							edges: Array<{
								node: {
									url: string;
									altText: string | null;
									width: number;
									height: number;
								};
							}>;
						};
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
	attributes?: Array<{
		key: string;
		value: string;
	}>;
}

export interface ProductWithEdges extends Omit<ShopifyProduct, "variants" | "images"> {
	images: {
		edges: Array<{
			node: {
				url: string;
				altText: string | null;
			};
		}>;
	};
	variants: {
		edges: Array<{
			node: ShopifyProductVariant;
		}>;
	};
}

export interface ProductsQueryOptions {
	first?: number;
	sortKey?: "TITLE" | "PRICE" | "BEST_SELLING" | "CREATED" | "ID" | "MANUAL" | "COLLECTION_DEFAULT" | "RELEVANCE";
	reverse?: boolean;
	query?: string;
}

export interface ProductVariant {
	id: string;
	title: string;
	price: {
		amount: string;
		currencyCode: string;
	};
	compareAtPrice?: {
		amount: string;
		currencyCode: string;
	};
	selectedOptions: Array<{
		name: string;
		value: string;
	}>;
	image?: {
		url: string;
		altText?: string;
	};
}

export interface Product {
	id: string;
	handle: string;
	title: string;
	description: string;
	images: {
		edges: Array<{
			node: {
				url: string;
				altText?: string;
			};
		}>;
	};
	variants: {
		edges: Array<{
			node: ProductVariant;
		}>;
	};
	tags?: string[];
	metafields?: Array<{
		key: string;
		value: string;
	}>;
}
