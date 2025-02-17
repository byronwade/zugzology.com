// Re-export Shopify server actions
export {
	// Product and Collection actions
	getProduct,
	getProducts,
	getCollection,
	getCollectionDiscounts,
	getSiteSettings,
	getProductPageData,

	// Blog actions
	getBlogs,
	getAllBlogPosts,
	getBlogByHandle,

	// Cart actions
	createCart,
	getCart,
	addToCart,
	updateCartLine,
	removeFromCart,

	// Header data
	getHeaderData,
} from "@/lib/api/shopify/actions";
