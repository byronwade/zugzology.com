import { NextRequest, NextResponse } from "next/server";
import { parseHTML } from "linkedom";

export const dynamic = "force-static";
export const revalidate = 3600; // Cache for 1 hour

function getHostname() {
	if (process.env.NODE_ENV === "development") {
		return "localhost:3001";
	}
	if (process.env.VERCEL_URL) {
		return process.env.VERCEL_URL;
	}
	return "zugzology.com";
}

export async function GET(request: NextRequest, { params }: { params: { rest: string[] } }) {
	const nextjsParams = await params;
	try {
		const schema = process.env.NODE_ENV === "development" ? "http" : "https";
		const host = getHostname();
		const href = nextjsParams.rest.join("/");

		if (!href) {
			return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
		}

		const url = `${schema}://${host}/${href}`;

		// Skip known 404 pages
		if (href.startsWith("pages/") && !["about", "contact", "terms", "privacy"].includes(href.split("/")[1])) {
			return NextResponse.json(
				{ images: [] },
				{
					headers: {
						"Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
					},
				}
			);
		}

		const response = await fetch(url, {
			headers: {
				"User-Agent": "Zugzology Image Prefetcher",
			},
			next: { revalidate: 3600 }, // Cache for 1 hour
		});

		if (!response.ok) {
			// Return empty array for 404s instead of error
			if (response.status === 404) {
				return NextResponse.json(
					{ images: [] },
					{
						headers: {
							"Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
						},
					}
				);
			}
			return NextResponse.json({ error: "Failed to fetch", status: response.status }, { status: response.status });
		}

		const body = await response.text();
		const { document } = parseHTML(body);

		const images = Array.from(document.querySelectorAll("main img, article img"))
			.map((img) => ({
				srcset: img.getAttribute("srcset") || img.getAttribute("srcSet"),
				sizes: img.getAttribute("sizes"),
				src: img.getAttribute("src"),
				alt: img.getAttribute("alt"),
				loading: img.getAttribute("loading"),
			}))
			.filter((img) => img.src);

		return NextResponse.json(
			{ images },
			{
				headers: {
					"Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
				},
			}
		);
	} catch (error) {
		console.error("[Prefetch] Error:", error);
		return NextResponse.json(
			{ images: [] },
			{
				headers: {
					"Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
				},
			}
		);
	}
}
