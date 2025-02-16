import { Metadata } from "next";

export const metadata: Metadata = {
	title: "404 - Page Not Found | Zugzology",
	description: "The page you're looking for doesn't exist or has been moved. Return to Zugzology's homepage for premium mushroom cultivation supplies.",
	robots: {
		index: false,
		follow: true,
	},
	openGraph: {
		title: "404 - Page Not Found | Zugzology",
		description: "The page you're looking for doesn't exist or has been moved. Return to our homepage.",
		type: "website",
		images: [
			{
				url: "https://zugzology.com/404-og-image.jpg",
				width: 1200,
				height: 630,
				alt: "404 Page Not Found",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "404 - Page Not Found | Zugzology",
		description: "The page you're looking for doesn't exist or has been moved. Return to our homepage.",
		images: ["https://zugzology.com/404-twitter-image.jpg"],
	},
};

export default function NotFoundLayout({ children }: { children: React.ReactNode }) {
	return children;
}
