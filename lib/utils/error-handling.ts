// Create a dedicated error handling utility
export class ShopifyError extends Error {
	constructor(message: string, public code?: string, public statusCode?: number) {
		super(message);
		this.name = "ShopifyError";
	}
}

export function handleShopifyError(error: unknown) {
	if (error instanceof ShopifyError) {
		// Handle known Shopify errors
		console.error(`Shopify Error (${error.code}):`, error.message);
	} else {
		// Handle unknown errors
		console.error("Unknown Error:", error);
	}
}
