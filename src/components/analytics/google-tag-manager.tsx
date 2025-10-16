"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

type GTMProps = {
	gtmId: string;
	auth?: string;
	preview?: string;
	dataLayerName?: string;
};

/**
 * Google Tag Manager component
 * Implements GTM with proper pageview tracking and noscript fallback
 * @see https://developers.google.com/tag-platform/tag-manager/web
 */
export function GoogleTagManager({ gtmId, auth, preview, dataLayerName = "dataLayer" }: GTMProps) {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// Track page views on route change
	useEffect(() => {
		if (pathname) {
			// Push pageview event to dataLayer
			window[dataLayerName] = window[dataLayerName] || [];
			window[dataLayerName].push({
				event: "pageview",
				page: pathname,
				title: document.title,
			});
		}
	}, [pathname, searchParams, dataLayerName]);

	// Don't load GTM in development unless explicitly enabled
	if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_GTM_ENABLED) {
		return null;
	}

	const gtmParams = new URLSearchParams({
		id: gtmId,
		...(auth && { gtm_auth: auth }),
		...(preview && { gtm_preview: preview }),
		...(auth && preview && { gtm_cookies_win: "x" }),
	});

	return (
		<>
			{/* Google Tag Manager Script */}
			<Script
				dangerouslySetInnerHTML={{
					__html: `
						(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
						new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
						j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
						'https://www.googletagmanager.com/gtm.js?${gtmParams.toString()}';
						f.parentNode.insertBefore(j,f);
						})(window,document,'script','${dataLayerName}','${gtmId}');
					`,
				}}
				id="google-tag-manager"
				strategy="afterInteractive"
			/>

			{/* Google Tag Manager Noscript */}
			<noscript>
				<iframe
					height="0"
					src={`https://www.googletagmanager.com/ns.html?${gtmParams.toString()}`}
					style={{ display: "none", visibility: "hidden" }}
					title="Google Tag Manager"
					width="0"
				/>
			</noscript>
		</>
	);
}

/**
 * Helper functions for pushing events to GTM dataLayer
 */

declare global {
	interface Window {
		dataLayer?: any[];
		[key: string]: any;
	}
}

/**
 * Push a custom event to GTM dataLayer
 */
export function gtmEvent(eventName: string, eventData?: Record<string, any>) {
	if (typeof window === "undefined") {
		return;
	}

	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({
		event: eventName,
		...eventData,
	});
}

/**
 * Track enhanced ecommerce events
 */
export const gtmEcommerce = {
	/**
	 * Track product view
	 */
	viewItem: (product: {
		item_id: string;
		item_name: string;
		price: number;
		currency?: string;
		item_category?: string;
		item_brand?: string;
		quantity?: number;
	}) => {
		gtmEvent("view_item", {
			ecommerce: {
				items: [
					{
						...product,
						currency: product.currency || "USD",
						quantity: product.quantity || 1,
					},
				],
			},
		});
	},

	/**
	 * Track add to cart
	 */
	addToCart: (product: {
		item_id: string;
		item_name: string;
		price: number;
		currency?: string;
		quantity: number;
		item_category?: string;
		item_brand?: string;
	}) => {
		gtmEvent("add_to_cart", {
			ecommerce: {
				items: [
					{
						...product,
						currency: product.currency || "USD",
					},
				],
			},
		});
	},

	/**
	 * Track remove from cart
	 */
	removeFromCart: (product: {
		item_id: string;
		item_name: string;
		price: number;
		currency?: string;
		quantity: number;
	}) => {
		gtmEvent("remove_from_cart", {
			ecommerce: {
				items: [
					{
						...product,
						currency: product.currency || "USD",
					},
				],
			},
		});
	},

	/**
	 * Track view cart
	 */
	viewCart: (items: any[], value: number, currency = "USD") => {
		gtmEvent("view_cart", {
			ecommerce: {
				currency,
				value,
				items,
			},
		});
	},

	/**
	 * Track begin checkout
	 */
	beginCheckout: (items: any[], value: number, currency = "USD") => {
		gtmEvent("begin_checkout", {
			ecommerce: {
				currency,
				value,
				items,
			},
		});
	},

	/**
	 * Track purchase
	 */
	purchase: (transaction: {
		transaction_id: string;
		value: number;
		currency?: string;
		tax?: number;
		shipping?: number;
		items: any[];
	}) => {
		gtmEvent("purchase", {
			ecommerce: {
				...transaction,
				currency: transaction.currency || "USD",
			},
		});
	},

	/**
	 * Track product list view
	 */
	viewItemList: (listId: string, listName: string, items: any[]) => {
		gtmEvent("view_item_list", {
			item_list_id: listId,
			item_list_name: listName,
			ecommerce: {
				items,
			},
		});
	},

	/**
	 * Track product click
	 */
	selectItem: (listId: string, listName: string, item: any) => {
		gtmEvent("select_item", {
			item_list_id: listId,
			item_list_name: listName,
			ecommerce: {
				items: [item],
			},
		});
	},
};

/**
 * Track user interactions
 */
export const gtmInteraction = {
	/**
	 * Track search
	 */
	search: (query: string, results?: number) => {
		gtmEvent("search", {
			search_term: query,
			...(results !== undefined && { results_count: results }),
		});
	},

	/**
	 * Track form submission
	 */
	formSubmit: (formId: string, formName: string) => {
		gtmEvent("form_submit", {
			form_id: formId,
			form_name: formName,
		});
	},

	/**
	 * Track newsletter signup
	 */
	newsletterSignup: (method: string) => {
		gtmEvent("newsletter_signup", {
			method,
		});
	},

	/**
	 * Track social share
	 */
	share: (method: string, contentType: string, itemId: string) => {
		gtmEvent("share", {
			method,
			content_type: contentType,
			item_id: itemId,
		});
	},

	/**
	 * Track video engagement
	 */
	videoProgress: (videoTitle: string, percent: number) => {
		gtmEvent("video_progress", {
			video_title: videoTitle,
			video_percent: percent,
		});
	},
};
