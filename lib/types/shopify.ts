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
	options: {
		id: string;
		name: string;
		values: string[];
	}[];
	priceRange: {
		minVariantPrice: Money;
		maxVariantPrice: Money;
	};
	variants: {
		edges: {
			node: ProductVariant;
		}[];
	};
	images: {
		edges: {
			node: Image;
		}[];
	};
	availableForSale: boolean;
};

export type Cart = {
	id: string;
	checkoutUrl: string;
	totalQuantity: number;
	lines: {
		edges: {
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
							edges: {
								node: Image;
							}[];
						};
					};
				};
			};
		}[];
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
	image?: {
		url: string;
		altText: string | null;
		width: number;
		height: number;
	};
	author: {
		name: string;
	};
	blog: {
		handle: string;
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
	image?: {
		url: string;
		altText: string | null;
		width: number;
		height: number;
		id: string;
		transformedSrc?: string;
	};
	products: {
		edges: {
			node: Product;
		}[];
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
				edges: {
					node: Image;
				}[];
			};
		};
	};
};
