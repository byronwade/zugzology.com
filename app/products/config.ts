import { headers } from "next/headers";

export const runtime = "edge";
export const preferredRegion = "auto";
export const dynamic = "force-dynamic";

export async function generateMetadata() {
	const headersList = await headers();
	const domain = headersList.get("host") || "";

	return {
		title: "Products | Zugzology",
		description: "Browse our selection of premium mushroom products",
		openGraph: {
			title: "Products | Zugzology",
			description: "Browse our selection of premium mushroom products",
			url: `https://${domain}/products`,
		},
	};
}
