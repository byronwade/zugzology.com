import type { Metadata } from "next";
import { ScrollToTop } from "@/components/scroll-to-top";

export const metadata: Metadata = {
	title: {
		default: "Shop Mushroom Growing Supplies | Zugzology",
		template: "%s | Zugzology",
	},
	description:
		"Premium mushroom growing supplies and equipment. Find grow bags, substrates, and cultivation tools for successful mushroom growing.",
	openGraph: {
		type: "website",
		locale: "en_US",
		siteName: "Zugzology",
	},
	robots: {
		index: true,
		follow: true,
	},
	alternates: {
		canonical: "https://zugzology.com/products",
	},
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<ScrollToTop />
			{children}
		</>
	);
}
