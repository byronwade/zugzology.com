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
	productType: string;
	vendor: string;
	tags: string[];
	isGiftCard: boolean;
	availableForSale: boolean;
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
	media?: {
		edges: Array<{
			node: ShopifyMediaImage | ShopifyMediaVideo | ShopifyExternalVideo;
		}>;
	};
	youtubeVideos?: {
		id: string;
		value: string;
		type: string;
		references?: {
			edges: Array<{
				node: {
					type: string;
					fields: Array<{
						key: string;
						value: string;
						type: string;
					}>;
				};
			}>;
		};
	};
	recommendations?: {
		id: string;
		value: string;
		type: string;
		references?: {
			edges: Array<{
				node: ShopifyProduct;
			}>;
		};
	};
	complementaryProducts?: {
		id: string;
		value: string;
		type: string;
		references?: {
			edges: Array<{
				node: ShopifyProduct;
			}>;
		};
	};
	relatedProducts?: {
		id: string;
		value: string;
		type: string;
		references?: {
			edges: Array<{
				node: ShopifyProduct;
			}>;
		};
	};
	frequentlyBoughtTogether?: {
		id: string;
		value: string;
		type: string;
		references?: {
			edges: Array<{
				node: ShopifyProduct;
			}>;
		};
	};
	metafields?: {
		edges: Array<{
			node: {
				id: string;
				namespace: string;
				key: string;
				value: string;
				type: string;
			};
		}>;
	};
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
	selectedOptions: Array<{
		name: string;
		value: string;
	}>;
	requiresShipping: boolean;
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
	width: number;
	height: number;
	variantIds?: string[];
}

export interface ShopifyBlogArticle {
	id: string;
	handle: string;
	title: string;
	excerpt?: string;
	content: string;
	contentHtml: string;
	publishedAt: string;
	author: {
		name: string;
		email?: string;
	};
	image?: {
		url: string;
		width: number;
		height: number;
		altText: string | null;
	};
	blogHandle?: string;
	blogTitle?: string;
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

export interface ShopifyMediaImage {
	id: string;
	mediaContentType: "IMAGE";
	image: ShopifyImage;
}

export interface ShopifyMediaVideo {
	id: string;
	mediaContentType: "VIDEO";
	sources: Array<{
		url: string;
		mimeType: string;
		format: string;
		height?: number;
		width?: number;
	}>;
	previewImage: {
		url: string;
		altText: string | null;
		width: number;
		height: number;
	};
}

export interface ShopifyExternalVideo {
	id: string;
	mediaContentType: "EXTERNAL_VIDEO";
	embedUrl: string;
	host: string;
	previewImage: {
		url: string;
		altText: string | null;
		width: number;
		height: number;
	};
}

export interface ShopifyMedia {
	id: string;
	mediaContentType: "IMAGE" | "VIDEO";
	alt?: string | null;
}

export interface YouTubeVideo {
	id: string;
	mediaContentType: "YOUTUBE";
	url: string;
	thumbnail: {
		url: string;
		altText: string | null;
	};
}
