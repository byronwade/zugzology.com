export interface ShopifyProduct {
	id: string;
	title: string;
	description: string;
	handle: string;
	availableForSale: boolean;
	priceRange: {
		minVariantPrice: {
			amount: string;
			currencyCode: string;
		};
	};
	images: {
		edges: {
			node: {
				url: string;
				altText: string | null;
				width: number;
				height: number;
			};
		}[];
	};
	variants: {
		edges: {
			node: {
				id: string;
				title: string;
				availableForSale: boolean;
				price: {
					amount: string;
					currencyCode: string;
				};
			};
		}[];
	};
}

export interface ShopifyCollection {
	id: string;
	title: string;
	description: string;
	handle: string;
	image?: {
		url: string;
		altText: string | null;
		width: number;
		height: number;
	};
}

export interface CartLine {
	id: string;
	quantity: number;
	merchandise: {
		id: string;
		title: string;
		price: {
			amount: string;
			currencyCode: string;
		};
		product: {
			title: string;
			images: {
				edges: {
					node: {
						url: string;
						altText: string | null;
					};
				}[];
			};
		};
	};
}

export interface Cart {
	id: string;
	lines: {
		edges: {
			node: CartLine;
		}[];
	};
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
}
