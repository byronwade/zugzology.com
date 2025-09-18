import { NextResponse } from "next/server";
import { getAllBlogPosts } from "@/lib/api/shopify/actions";

// Dynamic rendering and revalidation handled by dynamicIO

export async function GET() {
	try {
		const blogs = await getAllBlogPosts();
		return NextResponse.json({ blogs });
	} catch (error) {
		console.error("Error fetching blog posts:", error);
		return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 });
	}
}
