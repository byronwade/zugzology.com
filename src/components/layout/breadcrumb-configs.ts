import type { BreadcrumbConfig } from "./universal-breadcrumb";

/**
 * Centralized breadcrumb configurations for consistent navigation across the site
 */
export const BreadcrumbConfigs = {
	/**
	 * Collection page breadcrumb
	 */
	collection: (title: string, handle: string): BreadcrumbConfig[] => [
		{ name: "Collections", url: "/collections" },
		{ name: title, url: `/collections/${handle}` },
	],

	/**
	 * Blog listing page breadcrumb
	 */
	blog: (title: string, handle: string): BreadcrumbConfig[] => [
		{ name: "Blog", url: "/blogs" },
		{ name: title, url: `/blogs/${handle}` },
	],

	/**
	 * Blog article page breadcrumb
	 */
	blogArticle: (blogTitle: string, blogHandle: string, articleTitle: string): BreadcrumbConfig[] => [
		{ name: "Blog", url: "/blogs" },
		{ name: blogTitle, url: `/blogs/${blogHandle}` },
		{ name: articleTitle, url: "#" },
	],

	/**
	 * Account dashboard breadcrumb
	 */
	account: (): BreadcrumbConfig[] => [{ name: "Account", url: "/account" }],

	/**
	 * Account orders breadcrumb
	 */
	accountOrders: (): BreadcrumbConfig[] => [
		{ name: "Account", url: "/account" },
		{ name: "Orders", url: "/account/orders" },
	],

	/**
	 * Account order detail breadcrumb
	 */
	accountOrder: (orderNumber: string): BreadcrumbConfig[] => [
		{ name: "Account", url: "/account" },
		{ name: "Orders", url: "/account/orders" },
		{ name: `Order #${orderNumber}`, url: `/account/${orderNumber}` },
	],

	/**
	 * Cart page breadcrumb
	 */
	cart: (): BreadcrumbConfig[] => [{ name: "Cart", url: "/cart" }],

	/**
	 * Product page breadcrumb
	 */
	product: (
		productTitle: string,
		productHandle: string,
		collectionTitle?: string,
		collectionHandle?: string
	): BreadcrumbConfig[] => {
		const breadcrumbs: BreadcrumbConfig[] = [];

		if (collectionTitle && collectionHandle) {
			breadcrumbs.push(
				{ name: "Collections", url: "/collections" },
				{ name: collectionTitle, url: `/collections/${collectionHandle}` }
			);
		} else {
			breadcrumbs.push({ name: "Products", url: "/products" });
		}

		breadcrumbs.push({ name: productTitle, url: `/products/${productHandle}` });

		return breadcrumbs;
	},

	/**
	 * Search results breadcrumb
	 */
	search: (query: string): BreadcrumbConfig[] => [
		{ name: "Search", url: "/search" },
		{ name: `Results for "${query}"`, url: `/search?q=${encodeURIComponent(query)}` },
	],

	/**
	 * Wishlist page breadcrumb
	 */
	wishlist: (): BreadcrumbConfig[] => [{ name: "Wishlist", url: "/wishlist" }],
};
