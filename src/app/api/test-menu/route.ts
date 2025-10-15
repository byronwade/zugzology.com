import { NextResponse } from "next/server";
import { getMenu } from "@/lib/api/shopify/actions";

export async function GET() {
	try {
		console.log("Testing menu fetch...");
		const menuItems = await getMenu("main-menu");
		console.log("Menu items:", JSON.stringify(menuItems, null, 2));

		return NextResponse.json({
			success: true,
			menuItems,
			count: menuItems.length,
		});
	} catch (error) {
		console.error("Error fetching menu:", error);
		return NextResponse.json({
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		}, { status: 500 });
	}
}
