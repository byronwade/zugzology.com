import { NextResponse } from "next/server";
import { getAllPages, getPageByHandle } from "@/lib/api/shopify/page-actions";

/**
 * Debug endpoint to test page data fetching
 * GET /api/debug/pages - List all pages
 * GET /api/debug/pages?handle=privacy - Get specific page with sections
 */
export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const handle = searchParams.get("handle");

		if (handle) {
			// Get specific page
			const data = await getPageByHandle(handle);
			return NextResponse.json({
				success: true,
				handle,
				data,
			});
		}

		// Get all pages
		const pages = await getAllPages();
		return NextResponse.json({
			success: true,
			count: pages.length,
			pages,
		});
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}
