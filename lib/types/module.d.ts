interface GraphQLResponse<T> {
	data?: T;
	errors?: Array<{
		message: string;
		locations?: Array<{ line: number; column: number }>;
		path?: string[];
		extensions?: Record<string, unknown>;
	}>;
}

declare module "@/lib/shopify/client" {
	export const shopifyClient: {
		request<T>(query: string, options?: { variables?: Record<string, unknown> }): Promise<GraphQLResponse<T>>;
		query<T>(query: string, options?: { variables?: Record<string, unknown> }): Promise<GraphQLResponse<T>>;
		mutation<T>(mutation: string, options?: { variables?: Record<string, unknown> }): Promise<GraphQLResponse<T>>;
	};
}

declare module "@/lib/types/api";

declare module "@/lib/config/constants" {
	export const SHOPIFY_CONFIG: {
		storeDomain: string;
		storefrontToken: string;
		apiVersion: string;
	};

	export const SHOPIFY: {
		storeDomain: string;
		storefrontAccessToken: string;
		apiVersion: string;
	};

	export const CACHE_TIMES: {
		products: number;
		collections: number;
		menu: number;
		blog: number;
	};

	export const TAGS: {
		products: string;
		cart: string;
		myceliumsGambit: string;
	};
}

declare module "@/lib/unstable-cache" {
	type AsyncFunction = (...args: unknown[]) => Promise<unknown>;
	export function unstable_cache<T extends AsyncFunction>(fn: T, keyParts: string[], options: { revalidate: number }): T;
}
