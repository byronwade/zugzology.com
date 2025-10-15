import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Generates a random code verifier for PKCE
 */
export async function generateCodeVerifier(): Promise<string> {
	const buffer = randomBytes(32);
	return buffer.toString("base64url");
}

/**
 * Generates a code challenge from a code verifier using SHA-256
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
	const hash = createHash("sha256");
	hash.update(verifier);
	return hash.digest("base64url");
}

/**
 * Generates a random state value for OAuth
 */
export async function generateState(): Promise<string> {
	const buffer = randomBytes(16);
	return buffer.toString("base64url");
}

/**
 * Generates a random nonce value for OpenID Connect
 */
export async function generateNonce(): Promise<string> {
	const buffer = randomBytes(16);
	return buffer.toString("base64url");
}

// Helper functions
function _generateRandomCode() {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return String.fromCharCode.apply(null, Array.from(array));
}

function _base64UrlEncode(str: string) {
	const base64 = btoa(str);
	return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function _convertBufferToString(hash: ArrayBuffer) {
	const uintArray = new Uint8Array(hash);
	const numberArray = Array.from(uintArray);
	return String.fromCharCode(...numberArray);
}

// JWT token decoder
export function decodeJwt(token: string) {
	const [header, payload, signature] = token.split(".");

	const decodedHeader = JSON.parse(atob(header));
	const decodedPayload = JSON.parse(atob(payload));

	return {
		header: decodedHeader,
		payload: decodedPayload,
		signature,
	};
}

/**
 * Extracts the nonce from a JWT token
 */
export async function getNonce(token: string): Promise<string | null> {
	try {
		const [, payload] = token.split(".");
		if (!payload) {
			return null;
		}

		const decodedPayload = Buffer.from(payload, "base64url").toString();
		const { nonce } = JSON.parse(decodedPayload);
		return nonce || null;
	} catch (_error) {
		return null;
	}
}

// Check if user is authenticated
export async function isAuthenticated() {
	const cookieStore = await cookies();
	const token = cookieStore.get("customerAccessToken");
	return !!token;
}

// Get current access token
export async function getAccessToken() {
	const cookieStore = await cookies();
	return cookieStore.get("customerAccessToken")?.value;
}
