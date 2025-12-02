"use client";

import Script from "next/script";
import type { WithContext } from "schema-dts";
import {
	getBlogPostSchema,
	getBlogSchema,
	getBreadcrumbSchema,
	getCollectionSchema,
	getFAQSchema,
	getOrganizationSchema,
	getProductSchema,
	getStoreSchema,
	getWebsiteSchema,
} from "@/lib/seo/standardized-jsonld";
import type { ShopifyProduct } from "@/lib/types";

type SEOProps = {
	type: "home" | "product" | "collection" | "blog" | "article" | "page" | "faq";
	siteSettings?: any;
	data?: any;
	breadcrumbs?: Array<{ name: string; url: string }>;
	faq?: Array<{ question: string; answer: string }>;
	additionalSchemas?: any[];
};

// Convert an object to a JSON-LD script
function JsonLdScript({ data }: { data: WithContext<any> }) {
	return (
		<script
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(data),
			}}
			type="application/ld+json"
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
	const schemas: WithContext<any>[] = [];

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
		const _currency = product.priceRange?.minVariantPrice?.currencyCode || "USD";

		return (
			<>
				{schemas.map((schema, index) => (
					<JsonLdScript data={schema} key={index} />
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
				<JsonLdScript data={schema} key={index} />
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
		<div className="mt-12" itemScope itemType="https://schema.org/FAQPage">
			<h2 className="mb-6 font-bold text-2xl">Frequently Asked Questions</h2>
			<div className="space-y-6">
				{questions.map((q, i) => (
					<div
						className="border-b pb-4 last:border-0"
						itemProp="mainEntity"
						itemScope
						itemType="https://schema.org/Question"
						key={i}
					>
						<h3 className="mb-2 font-semibold text-lg" itemProp="name">
							{q.question}
						</h3>
						<div itemProp="acceptedAnswer" itemScope itemType="https://schema.org/Answer">
							<div className="text-muted-foreground" itemProp="text">
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
	if (!(rating && totalReviews)) {
		return null;
	}

	return (
		<div className="hidden" itemScope itemType="https://schema.org/Product">
			<meta content={productName} itemProp="name" />
			<div itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
				<meta content={rating.toString()} itemProp="ratingValue" />
				<meta content={totalReviews.toString()} itemProp="reviewCount" />
				<meta content="1" itemProp="worstRating" />
				<meta content="5" itemProp="bestRating" />
			</div>

			{reviews.map((review, i) => (
				<div itemProp="review" itemScope itemType="https://schema.org/Review" key={i}>
					<meta content={review.date} itemProp="datePublished" />
					<div itemProp="author" itemScope itemType="https://schema.org/Person">
						<meta content={review.author} itemProp="name" />
					</div>
					<div itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
						<meta content={review.rating.toString()} itemProp="ratingValue" />
						<meta content="1" itemProp="worstRating" />
						<meta content="5" itemProp="bestRating" />
					</div>
					<meta content={review.title} itemProp="name" />
					<meta content={review.content} itemProp="reviewBody" />
				</div>
			))}
		</div>
	);
}
