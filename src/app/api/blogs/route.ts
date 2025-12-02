import { NextResponse } from "next/server";
import { getBlogs } from "@/lib/api/shopify/actions";

// Dynamic rendering and revalidation handled by dynamicIO

export async function GET() {
	try {
		const blogs = await getBlogs();
		return NextResponse.json({ blogs });
	} catch (_error) {
		return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 });
	}
}
