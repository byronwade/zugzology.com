"use client";

import { useSearchParams } from "next/navigation";
import { jsonLdScriptProps } from "react-schemaorg";
import type { ContactPage, BreadcrumbList } from "schema-dts";
import { WithContext } from "schema-dts";
import { Suspense } from "react";

// Inner component that uses useSearchParams
function ContactFormInner() {
	const searchParams = useSearchParams();
	const subject = searchParams.get("subject") || "";

	// Generate structured data
	const contactStructuredData: WithContext<ContactPage> = {
		"@context": "https://schema.org",
		"@type": "ContactPage",
		name: "Contact Zugzology",
		description: "Contact page for Zugzology - Premium mushroom cultivation supplies and equipment.",
		url: "https://zugzology.com/help",
		mainEntity: {
			"@type": "Organization",
			name: "Zugzology",
			contactPoint: {
				"@type": "ContactPoint",
				contactType: "customer service",
				email: "support@zugzology.com",
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
				item: "https://zugzology.com",
			},
			{
				"@type": "ListItem",
				position: 2,
				name: "Contact",
				item: "https://zugzology.com/help",
			},
		],
	};

	return (
		<>
			<script {...jsonLdScriptProps(contactStructuredData)} />
			<script {...jsonLdScriptProps(breadcrumbStructuredData)} />
			<div className="max-w-2xl mx-auto p-4">
				<h1 className="text-3xl font-bold mb-8">Contact Us</h1>
				<form className="space-y-6">
					<div>
						<label htmlFor="subject" className="block text-sm font-medium mb-2">
							Subject
						</label>
						<input
							type="text"
							id="subject"
							name="subject"
							defaultValue={subject}
							className="w-full p-2 border rounded-lg"
						/>
					</div>
					<div>
						<label htmlFor="message" className="block text-sm font-medium mb-2">
							Message
						</label>
						<textarea id="message" name="message" rows={6} className="w-full p-2 border rounded-lg"></textarea>
					</div>
					<button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90">
						Send Message
					</button>
				</form>
			</div>
		</>
	);
}

// Wrapper component with Suspense boundary
export function ContactForm() {
	return (
		<Suspense
			fallback={
				<div className="max-w-2xl mx-auto p-4">
					<h1 className="text-3xl font-bold mb-8">Contact Us</h1>
					<div className="space-y-6">
						<div>
							<div className="block text-sm font-medium mb-2">Subject</div>
							<div className="w-full h-10 bg-gray-200 animate-pulse rounded-lg"></div>
						</div>
						<div>
							<div className="block text-sm font-medium mb-2">Message</div>
							<div className="w-full h-32 bg-gray-200 animate-pulse rounded-lg"></div>
						</div>
						<div className="w-32 h-10 bg-gray-300 animate-pulse rounded-lg"></div>
					</div>
				</div>
			}
		>
			<ContactFormInner />
		</Suspense>
	);
}
