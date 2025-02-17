export interface Money {
	amount: string;
	currencyCode: string;
}

export interface Image {
	url: string;
	altText: string;
	width: number;
	height: number;
}

export interface ProductVariant {
	id: string;
	title: string;
	price: Money;
	compareAtPrice: Money | null;
	selectedOptions: Array<{
		name: string;
		value: string;
	}>;
	image: Image | null;
}

export interface ShopifyMoney {
	amount: string;
	currencyCode: string;
}

export interface ShopifyImage {
	url: string;
	altText: string;
	width: number;
	height: number;
}

export interface ShopifyProductVariant {
	id: string;
	title: string;
	availableForSale: boolean;
	quantityAvailable: number;
	price: ShopifyMoney;
	compareAtPrice: ShopifyMoney | null;
	selectedOptions: Array<{
		name: string;
		value: string;
	}>;
	image: ShopifyImage | null;
}

export interface ShopifyProductOption {
	id: string;
	name: string;
	values: string[];
}

export interface ShopifyMetafield {
	id: string;
	namespace: string;
	key: string;
	value: string;
	type: string;
}

export interface ShopifyProduct {
	id: string;
	handle: string;
	title: string;
	description: string;
	priceRange: {
		minVariantPrice: ShopifyMoney;
		maxVariantPrice: ShopifyMoney;
	};
	images: {
		edges: Array<{
			node: ShopifyImage;
		}>;
	};
	variants: {
		edges: Array<{
			node: ShopifyProductVariant;
		}>;
	};
	options: ShopifyProductOption[];
	tags: string[];
	vendor: string;
	metafields?: {
		edges: Array<{
			node: ShopifyMetafield;
		}>;
	};
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
	handle: string;
	description: string;
	image?: ShopifyImage;
	products: {
		edges: Array<{
			node: ShopifyProduct;
		}>;
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
	image?: ShopifyImage;
	blogHandle?: string;
	blogTitle?: string;
	tags?: string[];
	blog?: {
		handle: string;
		title: string;
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
	attributes?: Array<{
		key: string;
		value: string;
	}>;
}

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
								node: ShopifyImage;
							}>;
						};
					};
				};
			};
		}>;
	};
}

export type ShopifyCart = Cart;

export interface ProductsQueryOptions {
	first?: number;
	sortKey?: "TITLE" | "PRICE" | "BEST_SELLING" | "CREATED" | "ID" | "MANUAL" | "COLLECTION_DEFAULT" | "RELEVANCE";
	reverse?: boolean;
	query?: string;
}

export interface ShopifyCustomerAddress {
	id: string;
	address1: string;
	address2: string | null;
	city: string;
	province: string;
	country: string;
	zip: string;
}

export interface ShopifyCustomer {
	id: string;
	firstName: string | null;
	lastName: string | null;
	email: string;
	phone: string | null;
	createdAt: string;
	defaultAddress: ShopifyCustomerAddress | null;
	addresses: {
		edges: Array<{
			node: ShopifyCustomerAddress;
		}>;
	};
	orders: {
		edges: Array<{
			node: {
				id: string;
				orderNumber: number;
				totalPrice: {
					amount: string;
					currencyCode: string;
				};
				processedAt: string;
				fulfillmentStatus: string;
				lineItems: {
					edges: Array<{
						node: {
							title: string;
							quantity: number;
							originalTotalPrice: {
								amount: string;
								currencyCode: string;
							};
							variant: {
								id: string;
								title: string;
								price: {
									amount: string;
									currencyCode: string;
								};
								image?: ShopifyImage;
								product?: {
									id: string;
									title: string;
									handle: string;
									images: {
										edges: Array<{
											node: ShopifyImage;
										}>;
									};
								};
							};
						};
					}>;
				};
			};
		}>;
	};
}

export interface YouTubeVideo {
	id: string;
	mediaContentType: "YOUTUBE";
	url: string;
	embedUrl: string;
	thumbnail: {
		url: string;
		altText: string | null;
	};
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
	previewImage: ShopifyImage;
}

export interface ShopifyExternalVideo {
	id: string;
	mediaContentType: "EXTERNAL_VIDEO";
	embedUrl: string;
	host: "YOUTUBE" | "VIMEO";
	previewImage: ShopifyImage;
}
