"use client";

import { useEffect } from "react";
import "./loading-types";

export function HomeLoading() {
	useEffect(() => {
		// Track loading state analytics
		if (typeof window !== 'undefined' && window.gtag) {
			window.gtag('event', 'page_view', {
				page_type: 'home_loading',
				page_location: window.location.href,
				content_category: 'loading_state'
			});
		}
	}, []);
	return (
		<div className="w-full animate-pulse">
			<div className="max-w-screen-xl mx-auto px-4 py-8">
				<div className="h-12 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-6" />
				<div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-800 rounded mb-12" />
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
					{[...Array(8)].map((_, i) => (
						<div key={i} className="space-y-4">
							<div className="bg-gray-200 dark:bg-gray-800 rounded-lg h-48 w-full" />
							<div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
							<div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export function ProductLoading() {
	useEffect(() => {
		// Track product loading state analytics
		if (typeof window !== 'undefined' && window.gtag) {
			window.gtag('event', 'page_view', {
				page_type: 'product_loading',
				page_location: window.location.href,
				content_category: 'loading_state'
			});
		}
	}, []);
	
	return (
		<div className="w-full animate-pulse">
			<div className="max-w-screen-xl mx-auto px-4 py-8">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					<div className="bg-gray-200 dark:bg-gray-800 rounded-lg h-96" />
					<div className="space-y-6">
						<div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
						<div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
						<div className="space-y-4">
							<div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
							<div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
							<div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-4/6" />
						</div>
						<div className="h-12 bg-gray-200 dark:bg-gray-800 rounded w-full" />
					</div>
				</div>
			</div>
		</div>
	);
}

export function CollectionLoading() {
	useEffect(() => {
		// Track collection loading state analytics
		if (typeof window !== 'undefined' && window.gtag) {
			window.gtag('event', 'page_view', {
				page_type: 'collection_loading',
				page_location: window.location.href,
				content_category: 'loading_state'
			});
		}
	}, []);
	
	return (
		<div className="w-full animate-pulse">
			<div className="max-w-screen-xl mx-auto px-4 py-8">
				<div className="h-12 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-6" />
				<div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-800 rounded mb-12" />
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
					{[...Array(12)].map((_, i) => (
						<div key={i} className="space-y-4">
							<div className="bg-gray-200 dark:bg-gray-800 rounded-lg h-48 w-full" />
							<div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
							<div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
