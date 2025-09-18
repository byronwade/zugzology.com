import { NextResponse } from "next/server";

// Dynamic rendering and revalidation handled by dynamicIO

export async function GET() {
	try {
		// Mock blog posts for now - TODO: implement Shopify blog integration
		const blogs: any[] = [];
		return NextResponse.json({ blogs });
	} catch (error) {
		console.error("Error fetching blog posts:", error);
		return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 });
	}
}
