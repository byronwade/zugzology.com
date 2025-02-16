"use client";

import { Link } from "@/components/ui/link";
import { jsonLdScriptProps } from "react-schemaorg";
import type { WebPage, BreadcrumbList } from "schema-dts";
import { WithContext } from "schema-dts";
import { useEffect, useState } from "react";

interface NotFoundContentProps {
	storeName: string;
	storeUrl: string;
}

// Structured data for 404 page
function getStructuredData(storeName: string, storeUrl: string) {
	const pageStructuredData: WithContext<WebPage> = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: `Page Not Found - 404 Error | ${storeName}`,
		description: `The requested page could not be found on ${storeName}.`,
		url: `${storeUrl}/404`,
		publisher: {
			"@type": "Organization",
			name: storeName,
			logo: {
				"@type": "ImageObject",
				url: `${storeUrl}/logo.png`,
			},
		},
	};

	const breadcrumbStructuredData: WithContext<BreadcrumbList> = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{
				"@type": "ListItem",
				position: 1,
				name: "Home",
				item: storeUrl,
			},
			{
				"@type": "ListItem",
				position: 2,
				name: "404 Not Found",
				item: `${storeUrl}/404`,
			},
		],
	};

	return { pageStructuredData, breadcrumbStructuredData };
}

export default function NotFound() {
	const [settings, setSettings] = useState({
		storeName: "Zugzology",
		storeUrl: "https://zugzology.com",
	});

	useEffect(() => {
		fetch("/api/settings")
			.then((res) => res.json())
			.then((data) => {
				setSettings({
					storeName: data.name || "Zugzology",
					storeUrl: data.url || "https://zugzology.com",
				});
			})
			.catch((error) => {
				console.warn("Failed to fetch site settings:", error);
			});
	}, []);

	const { pageStructuredData, breadcrumbStructuredData } = getStructuredData(settings.storeName, settings.storeUrl);

	return (
		<>
			<script {...jsonLdScriptProps(pageStructuredData)} />
			<script {...jsonLdScriptProps(breadcrumbStructuredData)} />
			<div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
				<h1 className="text-4xl font-bold mb-4">404</h1>
				<h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
				<p className="text-neutral-600 dark:text-neutral-400 text-center mb-8">The page you're looking for doesn't exist or has been moved.</p>
				<Link href="/" className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-colors">
					Return to {settings.storeName}
				</Link>
			</div>
		</>
	);
}
