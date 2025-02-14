import { NextRequest } from "next/server";

const TRUSTOO_API_URL = "https://api.trustoo.io";
const TRUSTOO_PUBLIC_TOKEN = "b3yNAlbjsiAw9FFoZ9KhqQ==";

// Helper function to get headers
function getHeaders(contentType?: string) {
	return {
		Authorization: `Bearer ${TRUSTOO_PUBLIC_TOKEN}`,
		...(contentType && contentType !== "multipart/form-data" ? { "Content-Type": contentType } : {}),
		Accept: "application/json",
	};
}

// Helper function to encode product ID
function encodeProductId(id: string): string {
	return id.replace(/gid:\/\/shopify\/Product\//, '').replace(/\//g, '-');
}

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
	try {
		const path = params.path.join("/");
		const searchParams = new URLSearchParams(request.nextUrl.searchParams);

		// Log incoming request details
		console.log("[Trustoo] Incoming request:", {
			path,
			searchParams: Object.fromEntries(searchParams.entries()),
			headers: Object.fromEntries(request.headers.entries()),
		});

		// Handle product ID encoding for specific endpoints
		if (path.includes("products") || path.includes("reviews")) {
			const productId = searchParams.get("productId");
			if (productId) {
				const encodedId = encodeProductId(productId);
				console.log("[Trustoo] Encoding product ID:", { original: productId, encoded: encodedId });
				searchParams.set("productId", encodedId);
			}
		}

		const url = `${TRUSTOO_API_URL}/v1/${path}?${searchParams.toString()}`;

		console.log("[Trustoo] Making API request:", {
			url,
			method: "GET",
			headers: getHeaders("application/json"),
		});

		const response = await fetch(url, {
			method: "GET",
			headers: getHeaders("application/json"),
			cache: "no-store",
		});

		// Get the raw response text first for debugging
		const responseText = await response.text();
		let data;
		try {
			data = JSON.parse(responseText);
		} catch (e) {
			console.error("[Trustoo] Failed to parse JSON response:", {
				responseText,
				error: e instanceof Error ? e.message : "Unknown error",
			});
			throw new Error("Invalid JSON response from Trustoo API");
		}

		if (!response.ok) {
			console.error("[Trustoo] API Error:", {
				status: response.status,
				url,
				error: data,
				responseText,
			});
			throw new Error(data.message || `Trustoo API responded with status ${response.status}`);
		}

		console.log("[Trustoo] API Response:", {
			status: response.status,
			url,
			dataShape: Object.keys(data),
		});

		return new Response(JSON.stringify(data), {
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
				"Access-Control-Allow-Headers": "*",
			},
		});
	} catch (error) {
		console.error("[Trustoo] API Error:", {
			error: error instanceof Error ? error.message : "Unknown error",
			stack: error instanceof Error ? error.stack : undefined,
			path: params.path.join("/"),
			searchParams: Object.fromEntries(request.nextUrl.searchParams.entries()),
		});
		
		return new Response(
			JSON.stringify({
				error: "Failed to fetch from Trustoo API",
				details: error instanceof Error ? error.message : "Unknown error",
			}),
			{
				status: 500,
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
					"Access-Control-Allow-Headers": "*",
				},
			}
		);
	}
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
	try {
		const path = params.path.join("/");
		const contentType = request.headers.get("content-type");

		let requestBody;
		if (contentType?.includes("multipart/form-data")) {
			const formData = await request.formData();
			requestBody = formData;
		} else {
			const json = await request.json();
			// Handle product ID encoding
			if (json.productId) {
				json.productId = encodeProductId(json.productId);
			}
			requestBody = json;
		}

		const url = `${TRUSTOO_API_URL}/v1/${path}`;
		
		console.log('Posting to Trustoo:', url);

		const response = await fetch(url, {
			method: "POST",
			headers: getHeaders(contentType || "application/json"),
			body: contentType?.includes("multipart/form-data") ? requestBody : JSON.stringify(requestBody),
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.message || `Trustoo API responded with status ${response.status}`);
		}

		return new Response(JSON.stringify(data), {
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
				"Access-Control-Allow-Headers": "*",
			},
		});
	} catch (error) {
		console.error("Trustoo API Error:", error);
		return new Response(
			JSON.stringify({
				error: "Failed to post to Trustoo API",
				details: error instanceof Error ? error.message : "Unknown error",
			}),
			{
				status: 500,
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
					"Access-Control-Allow-Headers": "*",
				},
			}
		);
	}
}

export async function OPTIONS(request: NextRequest) {
	return new Response(null, {
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
			"Access-Control-Allow-Headers": "*",
			"Access-Control-Max-Age": "86400",
		},
	});
}
