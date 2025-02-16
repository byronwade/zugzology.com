import { Suspense } from "react";
import { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
	title: "Contact Us - Get in Touch | Zugzology",
	description: "Have questions about mushroom cultivation or our products? Contact Zugzology for expert assistance. We're here to help with your cultivation needs.",
	openGraph: {
		title: "Contact Zugzology - Get Expert Assistance",
		description: "Have questions about mushroom cultivation or our products? We're here to help with your cultivation needs.",
		type: "website",
		images: [
			{
				url: "https://zugzology.com/contact-og-image.jpg",
				width: 1200,
				height: 630,
				alt: "Contact Zugzology",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Contact Zugzology - Get Expert Assistance",
		description: "Have questions about mushroom cultivation or our products? We're here to help with your cultivation needs.",
		images: ["https://zugzology.com/contact-twitter-image.jpg"],
	},
	robots: {
		index: true,
		follow: true,
		nocache: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
};

export default function ContactPage() {
	return (
		<Suspense
			fallback={
				<div className="max-w-2xl mx-auto p-4">
					<div className="animate-pulse space-y-6">
						<div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded" />
						<div className="space-y-4">
							<div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded" />
							<div className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded" />
							<div className="h-10 w-32 bg-neutral-200 dark:bg-neutral-800 rounded" />
						</div>
					</div>
				</div>
			}
		>
			<ContactForm />
		</Suspense>
	);
}
