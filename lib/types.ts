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
