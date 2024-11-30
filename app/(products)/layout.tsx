import { Sidebar } from "@/components/sidebar/sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: {
		default: "Shop Mushroom Growing Supplies | Zugzology",
		template: "%s | Zugzology",
	},
	description: "Premium mushroom growing supplies and equipment. Find grow bags, substrates, and cultivation tools for successful mushroom growing.",
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

export default function ProductsLayout({ children, params }: { children: React.ReactNode; params?: { handle?: string } }) {
	const showSidebar = !params?.handle;

	return (
		<div className="flex">
			{showSidebar && <Sidebar />}
			<div className={`flex-1 ${showSidebar ? "" : "w-full"}`}>{children}</div>
		</div>
	);
}
