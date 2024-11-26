export type Money = {
	amount: string;
	currencyCode: string;
};

export type Image = {
	url: string;
	altText: string | null;
	width: number;
	height: number;
	id: string;
	originalSrc: string;
	transformedSrc?: string;
};

export type ProductVariant = {
	id: string;
	title: string;
	availableForSale: boolean;
	selectedOptions: {
		name: string;
		value: string;
	}[];
	price: Money;
};

export type Product = {
	id: string;
	title: string;
	handle: string;
	description: string;
	descriptionHtml: string;
	options: Array<{
		id: string;
		name: string;
		values: string[];
	}>;
	priceRange: {
		minVariantPrice: Money;
		maxVariantPrice: Money;
	};
	variants: {
		edges: Array<{
			node: ProductVariant;
		}>;
	};
	images: {
		edges: Array<{
			node: Image;
		}>;
	};
	availableForSale: boolean;
	tags: string[];
	vendor: string;
	productType: string;
};

export type Cart = {
	id: string;
	checkoutUrl: string;
	totalQuantity: number;
	lines: {
		edges: Array<{
			node: {
				id: string;
				quantity: number;
				cost: {
					totalAmount: Money;
					subtotalAmount: Money;
				};
				merchandise: ProductVariant & {
					product: Pick<Product, "id" | "title" | "handle"> & {
						images: {
							edges: Array<{
								node: Image;
							}>;
						};
					};
				};
			};
		}>;
	};
	cost: {
		subtotalAmount: Money;
		totalAmount: Money;
		totalTaxAmount: Money;
	};
};

export type ShopifyError = {
	message: string;
	locations: { line: number; column: number }[];
	path: string[];
};

export type Article = {
	id: string;
	title: string;
	handle: string;
	content: string;
	contentHtml: string;
	excerpt?: string;
	excerptHtml?: string;
	publishedAt: string;
	blog: {
		handle: string;
	};
	author: {
		name: string;
	};
	image?: {
		url: string;
		altText?: string;
		width: number;
		height: number;
	};
};

export type BlogResponse = {
	articles: {
		edges: Array<{
			node: Article;
		}>;
		pageInfo: {
			hasNextPage: boolean;
			endCursor: string | null;
		};
	};
};

export type Collection = {
	id: string;
	handle: string;
	title: string;
	description: string | null;
	productsCount: number;
	image?: {
		url: string;
		altText: string | null;
		width: number;
		height: number;
		id: string;
		transformedSrc?: string;
	};
	products: {
		edges: Array<{
			node: Product;
		}>;
	};
};

export type CartLine = {
	id: string;
	quantity: number;
	cost: {
		totalAmount: Money;
		subtotalAmount: Money;
	};
	merchandise: ProductVariant & {
		product: Pick<Product, "id" | "title" | "handle"> & {
			images: {
				edges: Array<{
					node: Image;
				}>;
			};
		};
	};
};

export type Brand = {
	id: string;
	handle: string;
	title: string;
	description: string | null;
	products: {
		edges: Array<{
			node: Product;
		}>;
	};
	image?: {
		url: string;
		altText: string | null;
		width: number;
		height: number;
		id: string;
		transformedSrc?: string;
	};
};

export type Page = {
	id: string;
	title: string;
	handle: string;
	bodySummary: string;
	body: string;
	bodyHtml: string;
	createdAt: string;
	updatedAt: string;
	onlineStoreUrl: string;
	author?: {
		name: string;
	};
	publishedAt: string;
	seo?: {
		title?: string;
		description?: string;
	};
};

export type ProductColor = {
	name: string;
	value: string;
	handle: string;
};

export interface ProductWithColor extends Omit<Product, "options"> {
	options: Array<{
		id: string;
		name: string;
		values: string[];
	}>;
	vendor: string;
	productType: string;
	tags: string[];
	metafields: {
		edges: Array<{
			node: {
				key: string;
				value: string;
				namespace: string;
			};
		}>;
	};
}

export interface ShopifyMenu {
	id: string;
	items: Array<{
		id: string;
		title: string;
		url: string;
		items?: Array<{
			id: string;
			title: string;
			url: string;
		}>;
	}>;
}

export interface CustomerAddress {
	id: string;
	address1: string;
	address2?: string;
	city: string;
	country: string;
	zip: string;
	phone?: string;
}

export interface Customer {
	id: string;
	firstName?: string;
	lastName?: string;
	email: string;
	phone?: string;
	defaultAddress?: CustomerAddress;
	addresses?: CustomerAddress[];
	orders?: {
		edges: Array<{
			node: {
				id: string;
				orderNumber: number;
				totalPrice: string;
				processedAt: string;
				fulfillmentStatus: string;
			};
		}>;
	};
}

export interface CartItem {
	id: string;
	quantity: number;
	merchandise: {
		id: string;
		title: string;
		image?: { url: string };
		product: {
			handle: string;
			title: string;
		};
	};
	cost: {
		totalAmount: {
			amount: string;
			currencyCode: string;
		};
	};
}

export interface ShopifyCart {
	id: string;
	checkoutUrl: string;
	totalQuantity: number;
	lines: {
		edges: Array<{
			node: CartItem;
		}>;
	};
	cost?: {
		subtotalAmount: {
			amount: string;
			currencyCode: string;
		};
	};
}

export interface CustomerAccessToken {
	accessToken: string;
	expiresAt: string;
}

export interface CustomerUserError {
	code: string;
	field: string[];
	message: string;
}

export interface CustomerCreateInput {
	email: string;
	password: string;
	firstName?: string;
	lastName?: string;
	acceptsMarketing?: boolean;
}

export interface CustomerUpdateInput {
	email?: string;
	firstName?: string;
	lastName?: string;
	password?: string;
	acceptsMarketing?: boolean;
}

export interface Blog {
	id: string;
	handle: string;
	title: string;
	articles: {
		edges: Array<{
			node: Article;
		}>;
	};
}
