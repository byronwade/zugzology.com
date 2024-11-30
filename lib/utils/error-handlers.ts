export function handleShopifyError(error: unknown): never {
	console.error("Shopify Error:", error);

	if (error instanceof Error) {
		if (error.message.includes("Not Found")) {
			throw new Error("The requested resource was not found");
		}
		throw new Error(error.message);
	}

	throw new Error("An unknown error occurred");
}
