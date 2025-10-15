import type { NextRequest } from "next/server";

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
	return id.replace(/gid:\/\/shopify\/Product\//, "").replace(/\//g, "-");
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
	try {
		const resolvedParams = await params;
		const path = resolvedParams.path.join("/");
		const searchParams = new URLSearchParams(request.nextUrl.searchParams);

		// Handle product ID encoding for specific endpoints
		if (path.includes("products") || path.includes("reviews")) {
			const productId = searchParams.get("productId");
			if (productId) {
				const encodedId = encodeProductId(productId);
				searchParams.set("productId", encodedId);
			}
		}

		const url = `${TRUSTOO_API_URL}/v1/${path}?${searchParams.toString()}`;

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
		} catch (_e) {
			throw new Error("Invalid JSON response from Trustoo API");
		}

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

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
	try {
		const resolvedParams = await params;
		const path = resolvedParams.path.join("/");
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

export async function OPTIONS(_request: NextRequest) {
	return new Response(null, {
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
			"Access-Control-Allow-Headers": "*",
			"Access-Control-Max-Age": "86400",
		},
	});
}
