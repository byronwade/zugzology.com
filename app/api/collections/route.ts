import { NextResponse } from "next/server";
import { getAllCollections } from "@/lib/actions/shopify";

// Dynamic rendering and revalidation handled by dynamicIO

export async function GET() {
	try {
		const collections = await getAllCollections();
		return NextResponse.json({ collections });
	} catch (error) {
		console.error("Error fetching collections:", error);
		return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
	}
}
