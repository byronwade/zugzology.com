"use client";

import React from "react";
import Script from "next/script";
import { WithContext } from "schema-dts";
import {
	getOrganizationSchema,
	getProductSchema,
	getWebsiteSchema,
	getBreadcrumbSchema,
	getFAQSchema,
	getStoreSchema,
	getBlogSchema,
	getBlogPostSchema,
	getCollectionSchema,
} from "@/lib/seo/standardized-jsonld";
import { ShopifyProduct } from "@/lib/types";

interface SEOProps {
	type: "home" | "product" | "collection" | "blog" | "article" | "page" | "faq";
	siteSettings?: any;
	data?: any;
	breadcrumbs?: Array<{ name: string; url: string }>;
	faq?: Array<{ question: string; answer: string }>;
	additionalSchemas?: any[];
}

// Convert an object to a JSON-LD script
function JsonLdScript({ data }: { data: WithContext<any> }) {
	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(data),
			}}
		/>
	);
}

export function SEO({
	type,
	siteSettings = {},
	data = {},
	breadcrumbs = [],
	faq = [],
	additionalSchemas = [],
}: SEOProps) {
	// Determine which schemas to include based on page type
	const schemas: Array<WithContext<any>> = [];

	// Always include organization data
	schemas.push(getOrganizationSchema(siteSettings));

	// Website data
	if (type === "home") {
		schemas.push(getWebsiteSchema(siteSettings));
		schemas.push(getStoreSchema(siteSettings));
	}

	// Add breadcrumbs if provided
	if (breadcrumbs.length > 0) {
		schemas.push(getBreadcrumbSchema(breadcrumbs));
	}

	// Add FAQ schema if provided
	if (faq.length > 0) {
		schemas.push(getFAQSchema(faq));
	}

	// Add page-specific schemas
	switch (type) {
		case "product":
			schemas.push(getProductSchema(data as ShopifyProduct));
			break;
		case "collection":
			schemas.push(getCollectionSchema(data.collection, data.products));
			break;
		case "blog":
			schemas.push(getBlogSchema(data.blog, data.articles));
			break;
		case "article":
			schemas.push(getBlogPostSchema(data.blog, data.article));
			break;
	}

	// Add any additional custom schemas
	schemas.push(...additionalSchemas);

	// Structured data for Google Analytics enhanced ecommerce tracking
	if (type === "product" && data) {
		const product = data as ShopifyProduct;
		const price = product.priceRange?.minVariantPrice?.amount || "0";
		const currency = product.priceRange?.minVariantPrice?.currencyCode || "USD";

		return (
			<>
				{schemas.map((schema, index) => (
					<JsonLdScript key={index} data={schema} />
				))}

				{/* Enhanced ecommerce data layer */}
				<Script id="ecommerce-product-data" strategy="afterInteractive">
					{`
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
              'event': 'productView',
              'ecommerce': {
                'detail': {
                  'products': [{
                    'name': ${JSON.stringify(product.title)},
                    'id': ${JSON.stringify(product.id)},
                    'price': ${price},
                    'brand': ${JSON.stringify(product.vendor || "Zugzology")},
                    'category': ${JSON.stringify(product.productType || "")},
                    'variant': ${JSON.stringify(product.variants?.nodes?.[0]?.id || "")}
                  }]
                }
              }
            });
          `}
				</Script>
			</>
		);
	}

	return (
		<>
			{schemas.map((schema, index) => (
				<JsonLdScript key={index} data={schema} />
			))}
		</>
	);
}

// Rich result FAQ component with microdata
export function FAQSEO({ questions }: { questions: Array<{ question: string; answer: string }> }) {
	if (!questions || questions.length === 0) {
		return null;
	}

	return (
		<div itemScope itemType="https://schema.org/FAQPage" className="mt-12">
			<h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
			<div className="space-y-6">
				{questions.map((q, i) => (
					<div
						key={i}
						itemScope
						itemProp="mainEntity"
						itemType="https://schema.org/Question"
						className="border-b pb-4 last:border-0"
					>
						<h3 itemProp="name" className="font-semibold text-lg mb-2">
							{q.question}
						</h3>
						<div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
							<div itemProp="text" className="text-gray-600">
								{q.answer}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

// Rich result review component with microdata
export function ReviewSEO({
	productName,
	rating,
	totalReviews,
	reviews = [],
}: {
	productName: string;
	rating: number;
	totalReviews: number;
	reviews?: Array<{
		author: string;
		date: string;
		rating: number;
		title: string;
		content: string;
	}>;
}) {
	if (!rating || !totalReviews) {
		return null;
	}

	return (
		<div itemScope itemType="https://schema.org/Product" className="hidden">
			<meta itemProp="name" content={productName} />
			<div itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
				<meta itemProp="ratingValue" content={rating.toString()} />
				<meta itemProp="reviewCount" content={totalReviews.toString()} />
				<meta itemProp="worstRating" content="1" />
				<meta itemProp="bestRating" content="5" />
			</div>

			{reviews.map((review, i) => (
				<div key={i} itemProp="review" itemScope itemType="https://schema.org/Review">
					<meta itemProp="datePublished" content={review.date} />
					<div itemProp="author" itemScope itemType="https://schema.org/Person">
						<meta itemProp="name" content={review.author} />
					</div>
					<div itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
						<meta itemProp="ratingValue" content={review.rating.toString()} />
						<meta itemProp="worstRating" content="1" />
						<meta itemProp="bestRating" content="5" />
					</div>
					<meta itemProp="name" content={review.title} />
					<meta itemProp="reviewBody" content={review.content} />
				</div>
			))}
		</div>
	);
}
