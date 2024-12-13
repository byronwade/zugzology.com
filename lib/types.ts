export interface ShopifyProductOption {
	id: string;
	name: string;
	values: string[];
}

export interface ShopifyProduct {
	id: string;
	title: string;
	description: string;
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

export interface CartItem {
	merchandiseId: string;
	quantity: number;
	isPreOrder?: boolean;
}

export interface ShopifyCart {
	id: string;
	checkoutUrl: string;
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
