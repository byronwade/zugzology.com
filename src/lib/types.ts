export type Money = {
	amount: string;
	currencyCode: string;
};

export type Image = {
	url: string;
	altText: string;
	width: number;
	height: number;
};

export type ProductVariant = {
	id: string;
	title: string;
	price: Money;
	compareAtPrice: Money | null;
	selectedOptions: Array<{
		name: string;
		value: string;
	}>;
	image: Image | null;
};

export type ShopifyMoney = {
	amount: string;
	currencyCode: string;
};

export type ShopifyImage = {
	url: string;
	altText: string;
	width: number;
	height: number;
};

export type ShopifyProductVariant = {
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
	sku?: string;
	barcode?: string;
	weight?: number;
	weightUnit?: string;
};

export type ShopifyProductOption = {
	id: string;
	name: string;
	values: string[];
};

export type ShopifyMetafield = {
	id: string;
	namespace: string;
	key: string;
	value: string;
	type: string;
};

export type ShopifyMediaBase = {
	id: string;
	mediaContentType: string;
	alt: string | null;
	previewImage: {
		url: string;
		altText: string | null;
		height: number;
		width: number;
	};
	presentation?: {
		asJson: string;
	};
};

export interface ShopifyMediaImage extends ShopifyMediaBase {
	mediaContentType: "IMAGE";
	image: {
		url: string;
		altText: string | null;
		height: number;
		width: number;
		originalSrc: string;
	};
}

export interface ShopifyMediaVideo extends ShopifyMediaBase {
	mediaContentType: "VIDEO";
	sources: Array<{
		format: string;
		height: number;
		mimeType: string;
		url: string;
		width: number;
	}>;
}

export interface ShopifyExternalVideo extends ShopifyMediaBase {
	mediaContentType: "EXTERNAL_VIDEO";
	embedUrl: string;
	host: string;
	originUrl: string;
}

export interface ShopifyModel3d extends ShopifyMediaBase {
	mediaContentType: "MODEL_3D";
	sources: Array<{
		format: string;
		mimeType: string;
		url: string;
		filesize: number;
	}>;
}

export type ShopifyMedia = ShopifyMediaImage | ShopifyMediaVideo | ShopifyExternalVideo | ShopifyModel3d;

export type ShopifyProduct = {
	id: string;
	title: string;
	handle: string;
	description: string;
	descriptionHtml: string;
	productType: string;
	vendor: string;
	tags: string[];
	isGiftCard: boolean;
	availableForSale: boolean;
	options: ShopifyProductOption[];
	priceRange: {
		minVariantPrice: ShopifyMoney;
		maxVariantPrice: ShopifyMoney;
	};
	compareAtPriceRange?: {
		minVariantPrice: ShopifyMoney;
		maxVariantPrice: ShopifyMoney;
	};
	variants: {
		nodes: ShopifyProductVariant[];
	};
	media: {
		nodes: ShopifyMedia[];
	};
	images: {
		nodes: ShopifyImage[];
	};
	metafields?: ShopifyMetafield[];
	publishedAt: string;
	collections?: {
		edges: Array<{
			node: {
				id: string;
				handle: string;
				title: string;
			};
		}>;
	};
	rating?: number;
	reviewsCount?: number;
};

export type ShopifyCollection = {
	id: string;
	title: string;
	handle: string;
	description: string | null;
	image?: ShopifyImage;
	products: {
		nodes: ShopifyProduct[];
		productsCount: number;
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
};

export type ShopifyBlogArticle = {
	id: string;
	handle: string;
	title: string;
	excerpt?: string;
	summary?: string;
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
	updatedAt?: string;
	authorV2?: {
		displayName?: string;
		image?: {
			url?: string;
		};
	};
};

export type ShopifyBlog = {
	id: string;
	title: string;
	handle: string;
	articles: {
		edges: Array<{
			node: ShopifyBlogArticle;
		}>;
	};
};

export type CartItem = {
	merchandiseId: string;
	quantity: number;
	isPreOrder?: boolean;
	productId?: string;
	attributes?: Array<{
		key: string;
		value: string;
	}>;
};

export type Cart = {
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
};

export type ShopifyCart = Cart;

export type ShopifyMenuItem = {
	id: string;
	title: string;
	url: string;
	resourceId?: string | null;
	items?: ShopifyMenuItem[];
};

export type ShopifyPage = {
	id: string;
	title: string;
	handle: string;
	bodySummary?: string | null;
	onlineStoreUrl?: string | null;
};

// Enhanced Page types for dynamic page builder
export type MetaobjectField = {
	key: string;
	value: string;
	type: string;
	reference?: MetaobjectReference;
	references?: {
		nodes: MetaobjectReference[];
	};
};

export type MetaobjectReference =
	| {
			__typename: "MediaImage";
			id: string;
			image: ShopifyImage;
	  }
	| {
			__typename: "Product";
			id: string;
			handle: string;
			title: string;
			images: {
				nodes: ShopifyImage[];
			};
			priceRange: {
				minVariantPrice: ShopifyMoney;
			};
	  }
	| {
			__typename: "Collection";
			id: string;
			handle: string;
			title: string;
			description?: string;
			image?: ShopifyImage;
	  };

export type PageMetaobject = {
	id: string;
	type: string;
	handle: string;
	fields: MetaobjectField[];
};

export type PageMetafield = {
	id: string;
	namespace: string;
	key: string;
	value: string;
	type: string;
	reference?: PageMetaobject;
	references?: {
		nodes: PageMetaobject[];
	};
};

export type PageWithSections = {
	id: string;
	title: string;
	handle: string;
	body: string;
	bodySummary?: string;
	seo?: {
		title?: string;
		description?: string;
	};
	createdAt: string;
	updatedAt: string;
	metafields?: PageMetafield[];
};

// Section types for rendering
export type SectionType =
	| "hero"
	| "features"
	| "products"
	| "content"
	| "testimonials"
	| "cta"
	| "gallery"
	| "video"
	| "custom";

export type HeroSectionSettings = {
	heading: string;
	subheading?: string;
	ctaText?: string;
	ctaLink?: string;
	backgroundImage?: ShopifyImage;
	layout?: "full-width" | "split" | "minimal";
	theme?: "light" | "dark";
};

export type FeatureGridSettings = {
	heading: string;
	subheading?: string;
	features: Array<{
		icon?: string;
		title: string;
		description: string;
		image?: ShopifyImage;
	}>;
	columns?: 2 | 3 | 4;
};

export type ProductCarouselSettings = {
	heading: string;
	subheading?: string;
	productHandles?: string[];
	collectionHandle?: string;
	limit?: number;
	showPrices?: boolean;
	ctaText?: string;
	ctaLink?: string;
};

export type ContentBlockSettings = {
	heading?: string;
	content: string;
	image?: ShopifyImage;
	imagePosition?: "left" | "right" | "top" | "bottom";
	backgroundColor?: string;
	textAlign?: "left" | "center" | "right";
};

export type CTABannerSettings = {
	heading: string;
	description?: string;
	ctaText: string;
	ctaLink: string;
	backgroundImage?: ShopifyImage;
	theme?: "primary" | "secondary" | "accent";
	size?: "small" | "medium" | "large";
};

export type TestimonialSectionSettings = {
	heading?: string;
	testimonials: Array<{
		content: string;
		author: string;
		role?: string;
		image?: ShopifyImage;
		rating?: number;
	}>;
	layout?: "grid" | "carousel";
};

export type ImageGallerySettings = {
	heading?: string;
	images: ShopifyImage[];
	columns?: 2 | 3 | 4;
	spacing?: "tight" | "normal" | "loose";
	aspectRatio?: "square" | "landscape" | "portrait";
};

export type VideoEmbedSettings = {
	heading?: string;
	videoUrl: string;
	provider?: "youtube" | "vimeo" | "custom";
	thumbnail?: ShopifyImage;
	autoplay?: boolean;
	controls?: boolean;
};

export type PageSection = {
	id: string;
	type: SectionType;
	priority: number;
	settings:
		| HeroSectionSettings
		| FeatureGridSettings
		| ProductCarouselSettings
		| ContentBlockSettings
		| CTABannerSettings
		| TestimonialSectionSettings
		| ImageGallerySettings
		| VideoEmbedSettings
		| Record<string, unknown>; // For custom sections
};

export type PageLayout = "full-width" | "contained" | "split";
export type PageTheme = "default" | "dark" | "accent";

export type ProductsQueryOptions = {
	first?: number;
	sortKey?: "TITLE" | "PRICE" | "BEST_SELLING" | "CREATED" | "ID" | "MANUAL" | "COLLECTION_DEFAULT" | "RELEVANCE";
	reverse?: boolean;
	query?: string;
};

export type ShopifyCustomerAddress = {
	id: string;
	address1: string;
	address2: string | null;
	city: string;
	province: string;
	country: string;
	zip: string;
};

export type ShopifyCustomer = {
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
};

export type YouTubeVideo = {
	id: string;
	mediaContentType: "YOUTUBE";
	url: string;
	embedUrl: string;
	thumbnail: {
		url: string;
		altText: string | null;
	};
};

export type HeaderQueryResponse = {
	shop: {
		name: string;
	};
	menu: {
		items: MenuItem[];
	};
	blogs: {
		nodes: BlogType[];
	};
	products: {
		nodes: ShopifyProduct[];
	};
	collections: {
		nodes: ShopifyCollection[];
	};
};

export type MenuItem = {
	id: string;
	title: string;
	url: string;
	items?: MenuItem[];
};

export type BlogType = {
	id: string;
	handle: string;
	title: string;
	articles: {
		nodes: Article[];
	};
};

export type Article = {
	id: string;
	handle: string;
	title: string;
	content: string;
	contentHtml: string;
	publishedAt: string;
	image?: {
		url: string;
		altText?: string;
		width: number;
		height: number;
	};
};

// Type alias for Product (same as ShopifyProduct)
export type Product = ShopifyProduct;
