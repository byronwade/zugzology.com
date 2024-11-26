import { shopifyClient } from "@/lib/shopify/client";
import type { Page } from "@/lib/types/api";
import { CACHE_TIMES } from "@/lib/config/constants";
import { unstable_cache } from "@/lib/unstable-cache";

export const runtime = "edge";

export const getPage = unstable_cache(
	async (handle: string) => {
		const response = await shopifyClient.query<{ page: Page }>(
			/* GraphQL */ `
				query GetPage($handle: String!) {
					page(handle: $handle) {
						id
						title
						handle
						bodySummary
						bodyHtml
						seo {
							title
							description
						}
					}
				}
			`,
			{ handle }
		);
		return response.data?.page;
	},
	["page"],
	{ revalidate: CACHE_TIMES.products }
);
