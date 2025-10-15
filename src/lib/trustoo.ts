const _TRUSTOO_PUBLIC_TOKEN = "b3yNAlbjsiAw9FFoZ9KhqQ==";
const TRUSTOO_API_URL = "/api/trustoo";

type TrustooReview = {
	id: string;
	rating: number;
	title: string;
	content: string;
	author: string;
	createdAt: string;
	verifiedPurchase: boolean;
	productId: string;
	productSku?: string;
	images?: string[];
	likes?: number;
	response?: {
		content: string;
		author: string;
		createdAt: string;
	};
};

type TrustooProductStats = {
	averageRating: number;
	totalReviews: number;
	ratingDistribution: {
		[key: number]: number;
	};
};

type SubmitReviewData = {
	productId: string;
	productSku?: string;
	rating: number;
	title: string;
	content: string;
	author: string;
	email: string;
	images?: File[];
};

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(error.message || `HTTP error! status: ${response.status}`);
	}
	return response.json();
}

// Helper function to encode product ID
function encodeProductId(id: string): string {
	return id.replace(/gid:\/\/shopify\/Product\//, "").replace(/\//g, "-");
}

// Get reviews for a product
export async function getProductReviews(
	productId: string,
	page = 1,
	limit = 10
): Promise<{ reviews: TrustooReview[]; total: number }> {
	try {
		const startTime = performance.now();
		const encodedProductId = encodeProductId(productId);

		// Fix the API endpoint construction
		const queryParams = new URLSearchParams({
			productId: encodedProductId,
			page: page.toString(),
			limit: limit.toString(),
		}).toString();

		const response = await fetch(`${TRUSTOO_API_URL}/reviews?${queryParams}`, {
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			cache: "no-store", // Disable cache temporarily for debugging
		});

		if (!response.ok) {
			const _errorText = await response.text(); // Get raw response text for better debugging
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		const duration = performance.now() - startTime;
		if (duration > 100) {
		}

		return {
			reviews: data.reviews || [],
			total: data.total || 0,
		};
	} catch (_error) {
		return { reviews: [], total: 0 };
	}
}

// Get product statistics
export async function getProductStats(productId: string): Promise<TrustooProductStats | null> {
	try {
		const startTime = performance.now();
		const encodedProductId = encodeProductId(productId);

		const response = await fetch(`${TRUSTOO_API_URL}/products/${encodeURIComponent(encodedProductId)}/stats`, {
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			cache: "no-store", // Disable cache temporarily for debugging
		});

		if (!response.ok) {
			const _errorText = await response.text();
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		const duration = performance.now() - startTime;
		if (duration > 100) {
		}

		return data;
	} catch (_error) {
		return null;
	}
}

// Submit a new review
export async function submitReview(data: SubmitReviewData): Promise<{ success: boolean; message: string }> {
	try {
		const startTime = performance.now();

		// First, upload images if any
		let imageUrls: string[] = [];
		if (data.images && data.images.length > 0) {
			const formData = new FormData();
			data.images.forEach((image) => {
				formData.append("images", image);
			});

			const imageResponse = await fetch(`${TRUSTOO_API_URL}/reviews/images`, {
				method: "POST",
				body: formData,
			});

			const imageData = await handleResponse<{ urls: string[] }>(imageResponse);
			imageUrls = imageData.urls;
		}

		// Submit the review with image URLs
		const response = await fetch(`${TRUSTOO_API_URL}/reviews`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				...data,
				images: imageUrls,
			}),
		});

		const result = await handleResponse<{ success: boolean; message: string }>(response);

		const duration = performance.now() - startTime;
		if (duration > 100) {
		}

		// Revalidate the cache for this product
		await revalidateProductReviews(data.productId);

		return result;
	} catch (error) {
		throw new Error(error instanceof Error ? error.message : "Failed to submit review");
	}
}

// Revalidate cache for a product's reviews and stats
export async function revalidateProductReviews(productId: string) {
	try {
		await Promise.all([
			fetch(`/api/revalidate?tag=trustoo-reviews-${productId}`),
			fetch(`/api/revalidate?tag=trustoo-stats-${productId}`),
		]);
	} catch (_error) {}
}
