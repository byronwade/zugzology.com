/**
 * Comprehensive E-Commerce Analytics Tracking Utility
 *
 * This module provides type-safe event tracking for Vercel Analytics.
 * All events are designed to provide maximum insight into user behavior,
 * sales funnels, and website performance.
 *
 * NOTE: Custom events require Vercel Pro or Enterprise plan.
 * Free tier only tracks page views automatically.
 */

import { track } from "@vercel/analytics";

// ============================================================================
// EVENT TYPES - Type-safe event definitions
// ============================================================================

export type ProductEventData = {
	productId: string;
	productTitle?: string;
	price?: number | string;
	variant?: string;
	category?: string;
	collection?: string;
	source?: string; // Where the event originated (e.g., 'grid', 'search', 'related')
	position?: number; // Position in list/grid
};

export type CartEventData = {
	productId: string;
	quantity?: number;
	price?: number | string;
	variant?: string;
	cartValue?: number | string;
	itemCount?: number;
};

export type SearchEventData = {
	query: string;
	resultCount?: number;
	filters?: string;
	source?: string;
};

export type NavigationEventData = {
	from?: string;
	to: string;
	section?: string;
	type?: string;
};

export type ErrorEventData = {
	errorType: string;
	errorMessage?: string;
	page?: string;
	component?: string;
};

export type EngagementEventData = {
	element: string;
	value?: string | number;
	context?: string;
};

// ============================================================================
// ANALYTICS TRACKER CLASS
// ============================================================================

class AnalyticsTracker {
	private enabled: boolean;
	private debugMode: boolean;

	constructor() {
		// Only enable in production or when explicitly enabled
		this.enabled = process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true";
		this.debugMode = process.env.NEXT_PUBLIC_DEBUG_ANALYTICS === "true";
	}

	/**
	 * Internal tracking method with debug logging
	 */
	private trackEvent(eventName: string, data?: Record<string, any>) {
		if (this.debugMode) {
			console.log("[Analytics]", eventName, data);
		}

		if (!this.enabled) {
			return;
		}

		try {
			track(eventName, data);
		} catch (error) {
			console.error("[Analytics] Failed to track event:", eventName, error);
		}
	}

	// ========================================================================
	// PRODUCT EVENTS
	// ========================================================================

	/**
	 * Track product view (product page visited)
	 */
	productView(data: ProductEventData) {
		this.trackEvent("product_view", {
			product_id: data.productId,
			product_title: data.productTitle,
			price: data.price,
			category: data.category,
			collection: data.collection,
			source: data.source || "direct",
		});
	}

	/**
	 * Track product click (product card clicked)
	 */
	productClick(data: ProductEventData) {
		this.trackEvent("product_click", {
			product_id: data.productId,
			source: data.source,
			position: data.position,
			collection: data.collection,
		});
	}

	/**
	 * Track variant selection
	 */
	variantSelected(data: ProductEventData) {
		this.trackEvent("variant_selected", {
			product_id: data.productId,
			variant: data.variant,
		});
	}

	/**
	 * Track related product click
	 */
	relatedProductClick(data: ProductEventData) {
		this.trackEvent("related_product_click", {
			product_id: data.productId,
			source_product: data.source,
		});
	}

	// ========================================================================
	// CART EVENTS
	// ========================================================================

	/**
	 * Track add to cart
	 */
	addToCart(data: CartEventData) {
		this.trackEvent("add_to_cart", {
			product_id: data.productId,
			quantity: data.quantity || 1,
			price: data.price,
			variant: data.variant,
		});
	}

	/**
	 * Track remove from cart
	 */
	removeFromCart(data: CartEventData) {
		this.trackEvent("remove_from_cart", {
			product_id: data.productId,
			quantity: data.quantity,
		});
	}

	/**
	 * Track cart quantity update
	 */
	updateCartQuantity(data: CartEventData & { oldQuantity?: number }) {
		this.trackEvent("cart_quantity_update", {
			product_id: data.productId,
			old_quantity: data.oldQuantity,
			new_quantity: data.quantity,
		});
	}

	/**
	 * Track cart opened
	 */
	cartOpen(data?: { itemCount?: number; cartValue?: number | string }) {
		this.trackEvent("cart_open", {
			item_count: data?.itemCount,
			cart_value: data?.cartValue,
		});
	}

	/**
	 * Track cart closed
	 */
	cartClose(data?: { itemCount?: number; cartValue?: number | string }) {
		this.trackEvent("cart_close", {
			item_count: data?.itemCount,
			cart_value: data?.cartValue,
		});
	}

	/**
	 * Track checkout initiated
	 */
	checkoutInitiated(data: CartEventData) {
		this.trackEvent("checkout_initiated", {
			cart_value: data.cartValue,
			item_count: data.itemCount,
		});
	}

	// ========================================================================
	// WISHLIST EVENTS
	// ========================================================================

	/**
	 * Track add to wishlist
	 */
	addToWishlist(data: ProductEventData) {
		this.trackEvent("wishlist_add", {
			product_id: data.productId,
			source: data.source,
		});
	}

	/**
	 * Track remove from wishlist
	 */
	removeFromWishlist(data: { productId: string }) {
		this.trackEvent("wishlist_remove", {
			product_id: data.productId,
		});
	}

	/**
	 * Track wishlist view
	 */
	wishlistView(data?: { itemCount?: number }) {
		this.trackEvent("wishlist_view", {
			item_count: data?.itemCount,
		});
	}

	// ========================================================================
	// SEARCH & DISCOVERY EVENTS
	// ========================================================================

	/**
	 * Track search performed
	 */
	searchPerformed(data: SearchEventData) {
		this.trackEvent("search_performed", {
			query: data.query,
			result_count: data.resultCount,
			filters: data.filters,
		});
	}

	/**
	 * Track search result click
	 */
	searchResultClick(data: ProductEventData & { query?: string }) {
		this.trackEvent("search_result_click", {
			query: data.query,
			product_id: data.productId,
			position: data.position,
		});
	}

	/**
	 * Track collection view
	 */
	collectionView(data: { collection: string; productCount?: number }) {
		this.trackEvent("collection_view", {
			collection: data.collection,
			product_count: data.productCount,
		});
	}

	/**
	 * Track filter applied
	 */
	filterApplied(data: { filterType: string; filterValue: string; collection?: string }) {
		this.trackEvent("filter_applied", {
			filter_type: data.filterType,
			filter_value: data.filterValue,
			collection: data.collection,
		});
	}

	/**
	 * Track sort changed
	 */
	sortChanged(data: { sortType: string; collection?: string }) {
		this.trackEvent("sort_changed", {
			sort_type: data.sortType,
			collection: data.collection,
		});
	}

	// ========================================================================
	// ENGAGEMENT EVENTS
	// ========================================================================

	/**
	 * Track newsletter signup
	 */
	newsletterSignup(data?: { location?: string; source?: string }) {
		this.trackEvent("newsletter_signup", {
			location: data?.location,
			source: data?.source,
		});
	}

	/**
	 * Track video play
	 */
	videoPlay(data: { productId?: string; videoType?: string }) {
		this.trackEvent("video_play", {
			product_id: data.productId,
			video_type: data.videoType,
		});
	}

	/**
	 * Track share click
	 */
	shareClick(data: { productId?: string; method: string; content?: string }) {
		this.trackEvent("share_click", {
			product_id: data.productId,
			method: data.method,
			content: data.content,
		});
	}

	/**
	 * Track review interaction
	 */
	reviewInteraction(data: { productId: string; action: string; helpful?: boolean }) {
		this.trackEvent("review_interaction", {
			product_id: data.productId,
			action: data.action,
			helpful: data.helpful,
		});
	}

	// ========================================================================
	// NAVIGATION EVENTS
	// ========================================================================

	/**
	 * Track navigation click
	 */
	navigationClick(data: NavigationEventData) {
		this.trackEvent("navigation_click", {
			from: data.from,
			to: data.to,
			section: data.section,
			type: data.type,
		});
	}

	/**
	 * Track breadcrumb click
	 */
	breadcrumbClick(data: { path: string; position: number }) {
		this.trackEvent("breadcrumb_click", {
			path: data.path,
			position: data.position,
		});
	}

	/**
	 * Track pagination
	 */
	paginationClick(data: { page: number; collection?: string; totalPages?: number }) {
		this.trackEvent("pagination_click", {
			page: data.page,
			collection: data.collection,
			total_pages: data.totalPages,
		});
	}

	// ========================================================================
	// UX & PERFORMANCE EVENTS
	// ========================================================================

	/**
	 * Track scroll depth
	 */
	scrollDepth(data: { depth: number; page: string }) {
		// Only track at certain milestones: 25%, 50%, 75%, 100%
		const milestones = [25, 50, 75, 100];
		if (milestones.includes(data.depth)) {
			this.trackEvent("scroll_depth", {
				depth: data.depth,
				page: data.page,
			});
		}
	}

	/**
	 * Track error encountered
	 */
	errorEncountered(data: ErrorEventData) {
		this.trackEvent("error_encountered", {
			error_type: data.errorType,
			error_message: data.errorMessage,
			page: data.page,
			component: data.component,
		});
	}

	/**
	 * Track 404 not found
	 */
	notFound(data: { path: string; referrer?: string }) {
		this.trackEvent("not_found", {
			path: data.path,
			referrer: data.referrer,
		});
	}

	// ========================================================================
	// CUSTOM GENERIC TRACKING
	// ========================================================================

	/**
	 * Track custom event
	 * Use this for any event not covered by the specific methods above
	 */
	custom(eventName: string, data?: Record<string, any>) {
		this.trackEvent(eventName, data);
	}
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const analytics = new AnalyticsTracker();

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

// Export common tracking functions for easy imports
export const {
	productView,
	productClick,
	addToCart,
	removeFromCart,
	addToWishlist,
	removeFromWishlist,
	searchPerformed,
	searchResultClick,
	collectionView,
	checkoutInitiated,
	newsletterSignup,
	errorEncountered,
} = analytics;

// Export the tracker instance for advanced use
export default analytics;
